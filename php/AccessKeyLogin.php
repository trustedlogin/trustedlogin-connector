<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\VerifyUser;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Webhooks\Factory;

/**
 * Handler for access key login
 */
class AccessKeyLogin {


	use Logger;
	use VerifyUser;

	/**
	 * WordPress admin slug for access key login
	 */
	const PAGE_SLUG = 'trustedlogin_access_key_login';

	/**
	 * Name of form nonce
	 */
	const NONCE_NAME = '_tl_ak_nonce';

	/**
	 * Name of form nonce action
	 */
	const NONCE_ACTION = 'ak-redirect';

	/**
	 * Query param for redirect URL, to indicate it is a key login
	 */
	const ACCESS_KEY_ACTION_NAME = 'tl_access_key_login';

	/**
	 * Query param for redirect URL, to indicate account ID
	 */
	const ACCOUNT_ID_INPUT_NAME = 'ak_account_id';

	const ACCESS_KEY_INPUT_NAME = 'ak';

	const ACCESS_KEY_STRING_LENGTH = 64;

	const REDIRECT_ENDPOINT = 'trustedlogin';

	/**
	 * Error code when the current user isn't allowed to provide support.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
	 */
	const ERROR_INVALID_ROLE = 403;

	/**
	 * Error code when the there is no account in TrustedLogin matching the specified account ID.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
	 */
	const ERROR_NO_ACCOUNT_ID = 404;

	/*
	* Error for no secret ids found.
	* @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406
	*/
	const ERROR_NO_SECRET_IDS_FOUND = 406;

	/**
	 * Error code when the secret keys provided are of an invalid format.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
	 */
	const ERROR_INVALID_SECRET = 422;

	/**
	 * Error code for no envelope found
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/510
	 */
	const ERROR_NO_ENVELOPE = 510;


	/**
	 * The URL for access key login
	 *
	 * @param string $account_id The account ID
	 * @param string $provider The provider name
	 * @param string $access_key (Optional) The key for the access being requested.
	 * @return string
	 */
	public static function url( $account_id, $provider, $access_key = '' ) {
		return Factory::actionUrl(
			self::ACCESS_KEY_ACTION_NAME,
			$account_id,
			$provider,
			$access_key
		);
	}

	public static function makeSecret() {
		return bin2hex( random_bytes( 8 ) );
	}


	/**
	 * Processes the request.
	 *
	 * @param array $args. Optional.
	 *
	 * return array|WP_Error
	 */
	public function handle( array $args = array() ) {
		// If needed inputs, passed, used those.
		if ( isset( $args[ self::ACCESS_KEY_INPUT_NAME ] ) && isset( $args[ self::ACCOUNT_ID_INPUT_NAME ] ) ) {
			$access_key = $args[ self::ACCESS_KEY_INPUT_NAME ];
			$account_id = $args[ self::ACCOUNT_ID_INPUT_NAME ];
		}
		// If not, use $_REQUEST
		else {
			$verified = $this->verifyGrantAccessRequest();

			if ( is_wp_error( $verified ) ) {
				return $verified;
			}

			$access_key = Helpers::get_post_or_get( self::ACCESS_KEY_INPUT_NAME, 'sanitize_text_field' );
			$account_id = Helpers::get_post_or_get( self::ACCOUNT_ID_INPUT_NAME, 'sanitize_text_field' );
		}

		if ( self::ACCESS_KEY_STRING_LENGTH !== strlen( $access_key ) ) {
			return new \WP_Error(
				self::ERROR_INVALID_SECRET,
				'invalid_secret',
				esc_html__( 'The provided key is not the correct length. Make sure you copied it correctly and it is an Access Key.', 'trustedlogin-connector' )
			);
		}

		// Get saved settings and then team settings
		$settings   = SettingsApi::fromSaved();
		$account_id = (int) $account_id;

		try {
			$teamSettings = $settings->getByAccountId( $account_id );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				self::ERROR_NO_ACCOUNT_ID,
				'invalid_account_id',
				$e->getMessage()
			);
		}

		if ( ! $this->verifyUserRole( $teamSettings ) ) {
			return new \WP_Error(
				self::ERROR_INVALID_ROLE,
				'invalid_user_role',
				esc_html__( 'You do not have a role that is allowed to provide support for this team.', 'trustedlogin-connector' )
			);
		}

		$trustedlogin_service = new TrustedLoginService(
			trustedlogin_connector()
		);

		$secret_ids = $trustedlogin_service->api_get_secret_ids( $access_key, $account_id );

		if ( is_wp_error( $secret_ids ) ) {
			return new \WP_Error(
				400,
				'invalid_secret_keys',
				$secret_ids->get_error_message()
			);
		}

		if ( empty( $secret_ids ) ) {
			return new \WP_Error(
				self::ERROR_NO_SECRET_IDS_FOUND,
				'no_secret_ids',
				esc_html__( 'There were no sites found that match that Access Key. Access may have been revoked.', 'trustedlogin-connector' )
			);
		}

		$valid_secrets = $trustedlogin_service->get_valid_secrets( $secret_ids, $account_id );

		$this->log( 'Valid secrets: ', __METHOD__, 'debug', $valid_secrets );

		if ( empty( $valid_secrets ) ) {
			return new \WP_Error(
				self::ERROR_NO_SECRET_IDS_FOUND,
				'no_valid_secret_ids',
				esc_html__( 'There were secrets found, but they were invalid.', 'trustedlogin-connector' )
			);
		}

		/**
		 * Return all url parts, not just 0
		 *
		 * @see https://github.com/trustedlogin/vendor/issues/109
		 */
		return wp_list_pluck( $valid_secrets, 'url_parts' );
	}

	/**
	 * Verifies the $_POST request by the Access Key login form.
	 *
	 * @param bool $checkNonce. Optional. Default true. Set false to bypass nonce check.
	 * @return bool|\WP_Error
	 */
	public function verifyGrantAccessRequest( bool $checkNonce = true ) {

		if ( ! Helpers::get_post_or_get( self::ACCESS_KEY_INPUT_NAME ) ) {
			$this->log( 'No access key sent.', __METHOD__, 'error' );
			return new \WP_Error( 'no_access_key', esc_html__( 'No access key was sent with the request.', 'trustedlogin-connector' ) );
		}

		if ( ! Helpers::get_post_or_get( self::ACCOUNT_ID_INPUT_NAME ) ) {
			$this->log( 'No account id sent.', __METHOD__, 'error' );
			return new \WP_Error( 'no_account_id', esc_html__( 'No account id was sent with the request.', 'trustedlogin-connector' ) );
		}

		if ( $checkNonce ) {
			$nonce = Helpers::get_post_or_get( self::NONCE_NAME, 'sanitize_text_field' );

			if ( ! $nonce ) {
				$this->log( 'No nonce set. Insecure request.', __METHOD__, 'error' );
				return new \WP_Error( 'no_nonce', esc_html__( 'No nonce was sent with the request.', 'trustedlogin-connector' ) );
			}

			// Valid nonce?
			$valid = wp_verify_nonce( $nonce, self::NONCE_ACTION );

			if ( ! $valid ) {
				$this->log( 'Nonce is invalid; could be insecure request. Refresh the page and try again.', __METHOD__, 'error' );
				return new \WP_Error( 'bad_nonce', esc_html__( 'The nonce was not set for the request.', 'trustedlogin-connector' ) );
			}
		}

		// Ok, it's chill.
		return true;
	}

	/**
	 * Get access key or account ID from requests
	 *
	 * @param bool $return_access_key Optional. If true, access key returned. If false, account ID.
	 * @return string
	 */
	public static function fromRequest( bool $return_access_key = true ) {

		if ( $return_access_key ) {
			return (string) Helpers::get_post_or_get( self::ACCESS_KEY_INPUT_NAME, 'sanitize_text_field' );
		}

		return (string) Helpers::get_post_or_get( self::ACCOUNT_ID_INPUT_NAME, 'sanitize_text_field' );
	}
}
