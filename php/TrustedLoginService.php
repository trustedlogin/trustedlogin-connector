<?php
/**
 * @package TrustedLogin\TrustedLoginService
 */

namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 * High-level API for SaaS interactions
 *
 * Methods include validation, logging and API calls
 */
class TrustedLoginService {


	use Logger;
	use VerifyUser;

	// Constants came fromhttps://github.com/trustedlogin/trustedlogin-vendor/blob/f8c451d6648a6aa4e1844c4df0952c1bdce87985/includes/class-trustedlogin-endpoint.php#L31-L41
	// Not all are needed.

	const HEALTH_CHECK_SUCCESS_STATUS = 204;

	const HEALTH_CHECK_ERROR_STATUS = 424;

	const PUBLIC_KEY_SUCCESS_STATUS = 200;

	const PUBLIC_KEY_ERROR_STATUS = 501;

	const REDIRECT_SUCCESS_STATUS = 302;

	const REDIRECT_ERROR_STATUS = 303;


	/**
	 * @var Plugin
	 */
	protected $plugin;
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}

	/**
	 * Ingests an array of secret IDs and returns an array of only valid IDs with extra data.
	 *
	 * @since 0.12.0
	 *
	 * @param string[] $secret_ids
	 * @param int      $account_id The account ID of the TrustedLogin account.
	 *
	 * @return array{ id:string, url_parts:array, envelope:array }
	 */
	public function get_valid_secrets( array $secret_ids, $account_id ) {

		$valid_ids = array();

		foreach ( $secret_ids as $secret_id ) {
			$envelope = $this->api_get_envelope( $secret_id, $account_id );

			$envelope = $this->verify_envelope( $envelope );

			if ( is_wp_error( $envelope ) ) {
				$this->log( 'Error: ' . $envelope->get_error_message(), __METHOD__, 'error' );
				continue;
			}

			$this->log(
				'$envelope is not an error. Here\'s the envelope: ',
				__METHOD__,
				'debug',
				array(
					'envelope' => $envelope,
				)
			);

			// TODO: Convert to shared (client/vendor) Envelope library
			$url_parts = $this->envelope_to_url( $envelope, true );

			if ( is_wp_error( $url_parts ) ) {
				$this->log(
					'Error: ',
					__METHOD__,
					'error',
					array(
						'error_messages' => $url_parts->get_error_message(),
					)
				);
				continue;
			}

			if ( empty( $url_parts ) ) {
				continue;
			}

			$valid_ids[] = array(
				'id'        => $secret_id,
				'url_parts' => $url_parts,
				'envelope'  => $envelope,
			);
		}

		return $valid_ids;
	}

	/**
	 * Gets the secretId's associated with an access or license key.
	 *
	 * @since  1.0.0
	 *
	 * @param string $access_key The key we're checking for connected sites
	 * @param int    $account_id The account ID for access key.
	 * @return array|\WP_Error  Array of siteIds or \WP_Error  on issue.
	 */
	public function api_get_secret_ids( $access_key, $account_id ) {

		if ( empty( $access_key ) ) {
			$this->log( 'Error: access_key cannot be empty.', __METHOD__, 'error' );

			return new \WP_Error( 'data-error', esc_html__( 'Access Key cannot be empty', 'trustedlogin-connector' ) );
		}

		if ( ! is_user_logged_in() ) {
			return new \WP_Error( 'auth-error', esc_html__( 'User not logged in.', 'trustedlogin-connector' ) );
		}

		$saas_api = $this->plugin->getApiHandler( $account_id );
		$response = $saas_api->call(
			'accounts/' . $account_id . '/sites/',
			array(
				'searchKeys' => array( $access_key ),
			),
			'POST'
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->log( 'Response: ', __METHOD__, 'debug', array( 'response' => $response ) );

		// 204 response: no sites found.
		if ( true === $response ) {
			return array();
		}

		$access_keys = array();

		if ( ! empty( $response ) ) {
			foreach ( $response as $key => $secrets ) {
				foreach ( (array) $secrets as $secret ) {
					$access_keys[] = $secret;
				}
			}
		}

		return array_reverse( $access_keys );
	}

	/**
	 * API Wrapper: Get the envelope for a specified site ID
	 *
	 * @since 0.2.0
	 *
	 * @param string $secret_id Unique secret_id of a site.
	 * @param int    $account_id The ID for the TrustedLogin account.
	 *
	 * @return array|false|\WP_Error
	 */
	public function api_get_envelope( $secret_id, $account_id ) {

		if ( empty( $secret_id ) ) {
			$this->log( 'Error: secret_id cannot be empty.', __METHOD__, 'error' );

			return new \WP_Error( 'data-error', esc_html__( 'Site ID cannot be empty', 'trustedlogin-connector' ) );
		}

		if ( ! is_user_logged_in() ) {
			return new \WP_Error( 'auth-error', esc_html__( 'User not logged in.', 'trustedlogin-connector' ) );
		}

		// The data array that will be sent to TrustedLogin to request a site's envelope.
		$data = array();

		// Let's grab the user details. Logged in status already confirmed in maybeRedirectSupport().
		$current_user = wp_get_current_user();

		$data['user'] = array(
			'id'   => $current_user->ID,
			'name' => $current_user->display_name,
		);

		// Then let's get the identity verification pair to confirm the site is the one sending the request.
		$trustedlogin_encryption = $this->plugin->getEncryption();
		$auth_nonce              = $trustedlogin_encryption->createIdentityNonce();

		if ( is_wp_error( $auth_nonce ) ) {
			return $auth_nonce;
		}

		$data['nonce']       = $auth_nonce['nonce'];
		$data['signedNonce'] = $auth_nonce['signed'];

		$account_id = (int) $account_id;

		$endpoint = 'sites/' . $account_id . '/' . $secret_id . '/get-envelope';

		$saas_api   = $this->plugin->getApiHandler( $account_id );
		$x_tl_token = $saas_api->getXTlToken();

		if ( is_wp_error( $x_tl_token ) ) {
			$error = esc_html__( 'Error getting X-TL-TOKEN header', 'trustedlogin-connector' );
			$this->log( $error, __METHOD__, 'error' );
			return new \WP_Error( 'x-tl-token-error', $error );
		}

		$token_added = $saas_api->setAdditionalHeader( 'X-TL-TOKEN', $x_tl_token );

		if ( ! $token_added ) {
			$error = esc_html__( 'Error setting X-TL-TOKEN header', 'trustedlogin-connector' );
			$this->log( $error, __METHOD__, 'error' );
			return new \WP_Error( 'x-tl-token-error', $error );
		}

		$envelope = $saas_api->call( $endpoint, $data, 'POST' );
		if ( $envelope && ! is_wp_error( $envelope ) ) {
			$success = esc_html__( 'Successfully fetched envelope.', 'trustedlogin-connector' );
		} else {
			// translators: %s is the error message.
			$success = sprintf( esc_html__( 'Failed: %s', 'trustedlogin-connector' ), $envelope->get_error_message() );
		}

		return $envelope;
	}

	/**
	 * Helper function: verify the structure of an envelope is valid.
	 *
	 * @since TODO
	 *
	 * @param array|mixed $envelope Envelope to validate.
	 *
	 * @return array|\WP_Error Valid envelope or error if invalid.
	 */
	public function verify_envelope( $envelope ) {

		if ( empty( $envelope ) ) {
			$this->log( '$envelope is empty', __METHOD__, 'error' );
			return new \WP_Error( 'empty_envelope', 'The envelope is empty.' );
		}

		if ( is_object( $envelope ) ) {
			$envelope = (array) $envelope;
		}

		if ( ! is_array( $envelope ) ) {
			$this->log(
				'Error: envelope not an array. e:',
				__METHOD__,
				'error',
				array(
					'envelope' => $envelope,
				)
			);

			return new \WP_Error( 'malformed_envelope', 'The data received is not formatted correctly' );
		}

		$required_keys = array( 'identifier', 'siteUrl', 'publicKey', 'nonce' );

		foreach ( $required_keys as $required_key ) {
			if ( ! array_key_exists( $required_key, $envelope ) ) {
				$this->log( 'Error: malformed envelope.', __METHOD__, 'error', $envelope );

				return new \WP_Error( 'malformed_envelope', 'The data received is not formatted correctly or there was a server error.' );
			}
		}

		return $envelope;
	}

	/**
	 * Helper function: Extract redirect url from encrypted envelope.
	 *
	 * @since 0.1.0
	 *
	 * @param array $envelope {
	 * Received from encrypted TrustedLogin storage.
	 * @type string $siteUrl Encrypted site URL
	 * @type string $identifier Encrypted site identifier, used to generate endpoint
	 * @type string $publicKey @TODO
	 * @type string $nonce Nonce from Client {@see \TrustedLogin\Envelope::generate_nonce()} converted to string using \sodium_bin2hex().
	 * @type string $siteUrl URL of the site to access.
	 * }
	 *
	 * @param bool  $return_parts Optional. Whether to return an array of parts. Default: false.
	 *
	 * @return string|array|\WP_Error  If $return_parts is false, returns login URL. If true, returns array with login parts. If error, returns \WP_Error .
	 */
	public function envelope_to_url( $envelope, $return_parts = false ) {

		if ( is_wp_error( $this->verify_envelope( $envelope ) ) ) {
			$this->log(
				'Error: envelope not an array. e:',
				__METHOD__,
				'error',
				array(
					'envelope' => $envelope,
				)
			);

			return new \WP_Error( 'malformed_envelope', 'The data received is not formatted correctly' );
		}

		$trustedlogin_encryption = $this->plugin->getEncryption();

		try {
			$this->log( 'Starting to decrypt envelope.', __METHOD__, 'debug', array( 'envelope' => $envelope ) );

			$decrypted_identifier = $trustedlogin_encryption->decryptCryptoBox( $envelope['identifier'], $envelope['nonce'], $envelope['publicKey'] );

			if ( is_wp_error( $decrypted_identifier ) ) {
				$this->log(
					'There was an error decrypting the envelope:',
					__METHOD__,
					'error',
					array(
						'error_code'    => $decrypted_identifier->get_error_code(),
						'error_message' => $decrypted_identifier->get_error_message(),
					)
				);

				return $decrypted_identifier;
			}

			$this->log( 'Decrypted identifier: ', __METHOD__, 'debug', array( 'print_identifier' => $decrypted_identifier ) );

			$parts = array(
				'siteurl'    => $envelope['siteUrl'],
				'identifier' => $decrypted_identifier,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error( $e->getCode(), $e->getMessage() );
		}

		$endpoint = $trustedlogin_encryption::hash( $parts['siteurl'] . $parts['identifier'] );

		if ( is_wp_error( $endpoint ) ) {
			return $endpoint;
		}

		$loginurl = $parts['siteurl'] . '/' . $endpoint . '/' . $parts['identifier'];

		if ( $return_parts ) {
			return array(
				'siteurl'    => $parts['siteurl'],
				'loginurl'   => $loginurl,
				'endpoint'   => $endpoint,
				'identifier' => $parts['identifier'],
			);
		}

		return $loginurl;
	}
}
