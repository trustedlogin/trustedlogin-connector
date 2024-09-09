<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Contracts\SendsApiRequests as ApiSender;
use TrustedLogin\Vendor\Traits\Logger;
use WP_Error;
use Exception;

/**
 * Class: TrustedLogin API Handler
 *
 * @version 0.1.0
 */
class ApiHandler {

	use Logger;

	/**
	 * @var string Current API version.
	 */
	const API_VERSION = 'v1';

	/**
	 * @var string The url for the API being queried. Defined in {@see ApiHandler::__construct()}.
	 */
	private $api_url;

	/**
	 * @var string The API private key for authenticating API calls.
	 */
	private $private_key;

	/**
	 * @var string (Optional) The TrustedLogin API Key used in generating the X-TL-TOKEN header.
	 */
	private $public_key;

	/**
	 * @var bool Whether an Auth token is required.
	 */
	private $auth_required = true;

	/**
	 * @var string The type of Header to use for sending the token.
	 */
	private $auth_header_type = 'Authorization';

	/**
	 * @var array Additional headers added to the TL_API_Handler instance. Eg for adding 'X-TL-TOKEN' values.
	 */
	private $additional_headers = array();

	/**
	 * @var bool Whether debug logging is enabled.
	 */
	private $debug_mode = false;

	/**
	 * @var ApiSender
	 */
	private $apiSender;


	public function __construct( $data, ApiSender $apiSender ) {
		$this->apiSender = $apiSender;
		$defaults        = array(
			'private_key'   => null,
			'public_key'    => null,
			'debug_mode'    => false,
			'api_url'       => TRUSTEDLOGIN_API_URL,
			'auth_required' => true,
		);

		$atts = wp_parse_args( $data, $defaults );

		foreach ( array_keys( $defaults ) as $key ) {
			$this->{$key} = $atts[ $key ];
		}
	}

	/**
	 * @internal
	 * @return string Full versioned API url, with trailing slash.
	 */
	public function getApiUrl() {
		return $this->api_url;
	}

	/**
	 * @return string
	 */
	public function getAuthHeaderType() {
		return $this->auth_header_type;
	}

	/**
	 * @return string Authentication bearer token hash.
	 */
	private function getAuthBearerToken() {
		return hash( 'sha256', $this->private_key );
	}

	/**
	 * Returns the hash used for the X-TL-TOKEN header.
	 *
	 * @since 1.0
	 *
	 * @return string|WP_Error $saas_token Additional SaaS Token for authenticating API queries. WP_Error on error.
	 */
	public function getXTlToken() {

		if ( ! $this->public_key ) {
			return new WP_Error( 'missing_public_key' );
		}

		if ( ! $this->private_key ) {
			return new WP_Error( 'missing_private_key' );
		}

		return hash( 'sha256', $this->public_key . $this->private_key );
	}

	/**
	 * Get public key
	 *
	 * @return string
	 */
	public function getApiKey() {
		return $this->public_key;
	}

	/**
	 * @return array
	 */
	public function getAdditionalHeader() {
		if ( ! empty( $this->private_key ) ) {
			$this->additional_headers[ $this->auth_header_type ] = 'Bearer ' . $this->getAuthBearerToken();
			$this->additional_headers['X-TL-TOKEN']              = $this->getXTlToken();
		}
		return $this->additional_headers;
	}

	/**
	 * Sets the Header authorization type
	 *
	 * @since 0.8.0
	 *
	 * @param string|WP_Error $value The Header value to add.
	 *
	 * @param string          $key The Header key to add.
	 *
	 * @return array|false
	 */
	public function setAdditionalHeader( $key, $value ) {

		if ( empty( $key ) || empty( $value ) || is_wp_error( $value ) ) {
			return false;
		}

		$this->additional_headers[ $key ] = $value;

		return $this->additional_headers;
	}


	/**
	 * Prepare API call and return result
	 *
	 * @since 0.4.1
	 *
	 * @param string $endpoint - the API endpoint to be pinged
	 * @param array  $data - the data variables being synced
	 * @param string $method - HTTP RESTful method ('POST','GET','DELETE','PUT','UPDATE')
	 *
	 * @return object|bool|WP_Error - response from the RESTful API
	 */
	public function call( $endpoint, $data, $method ) {

		$additional_headers = $this->getAdditionalHeader();

		$url = $this->getApiUrl() . $endpoint;

		if ( ! empty( $this->private_key ) ) {
			$additional_headers[ $this->auth_header_type ] = 'Bearer ' . $this->getAuthBearerToken();
		}

		if ( $this->auth_required && empty( $additional_headers ) ) {
			$this->log( 'Auth required for API call', __METHOD__, 'error' );

			return false;
		}

		$this->log( "Sending $method API call to $url", __METHOD__, 'debug' );

		$api_response = $this->apiSend( $url, $data, $method, $additional_headers );

		return $this->handleResponse( $api_response );
	}

	/**
	 * Verifies the provided credentials.
	 *
	 * @since 0.9.1
	 *
	 * @return \stdClass|WP_Error If valid status received, returns object with a few details, otherwise a WP_Error for the status code provided.
	 */
	public function verify( $account_id = '' ) {

		$account_id = (int) $account_id;

		if ( 0 === $account_id ) {
			return new WP_Error(
				'verify-failed',
				__( 'No account ID provided.', 'trustedlogin-connector' )
			);
		}

		$url     = $this->getApiUrl() . 'accounts/' . $account_id;
		$method  = 'POST';
		$body    = array(
			'api_endpoint' => get_rest_url(),
		);
		$headers = $this->getAdditionalHeader();

		$verification = $this->apiSend( $url, $body, $method, $headers );

		$this->log( 'Verification results:', __METHOD__ . ':' . __LINE__, 'debug', array( '$verification' => $verification ) );

		if ( is_wp_error( $verification ) ) {
			return new WP_Error(
				$verification->get_error_code(),
				__( 'We could not verify your TrustedLogin credentials, please try save settings again.', 'trustedlogin-connector' ),
				$verification->get_error_message()
			);
		}

		if ( ! $verification ) {
			return new WP_Error(
				'verify-failed',
				__( 'We could not verify your TrustedLogin credentials, please try save settings again.', 'trustedlogin-connector' )
			);
		}

		$status = wp_remote_retrieve_response_code( $verification );
		$body   = wp_remote_retrieve_body( $verification );

		$body = json_decode( $body );

		if ( $status > 399 ) {
			switch ( $status ) {
				case 402:
					return new WP_Error(
						'verify-failed-402',
						__( 'You do not have a valid TrustedLogin subscription.', 'trustedlogin-connector' )
					);
				case 400:
				case 403:
					return new WP_Error(
						'verify-failed-' . $status,
						__( 'Could not verify the team. Please confirm the Public Key and Private Key settings are correct.', 'trustedlogin-connector' )
					);
				case 404:
					return new WP_Error(
						'verify-failed-404',
						__( 'Account not found, please check the ID provided.', 'trustedlogin-connector' )
					);
				case 405:
					return new WP_Error(
						'verify-failed-405',
						sprintf(
						// translators: %1$s is the HTTP method used, %2$s is the URL.
							__( 'Incorrect method (%1$s) used for %2$s', 'trustedlogin-connector' ),
							/* %1$s */ $method,
							/* %2$s */ $url
						)
					);
				case 500:
					return new WP_Error(
						'verify-failed-500',
						// translators: %d is the HTTP status code.
						sprintf( __( 'Status %d returned', 'trustedlogin-connector' ), $status )
					);
				default:
					return new WP_Error(
						'verify-failed-' . $status,
						// translators: %s is the Response message if available otherwise the HTTP status code.
						sprintf( __( "The TrustedLogin Service Responded with:\n%s\nIf the problem continues please contact support.", 'trustedlogin-connector' ), $body['message'] ?? $status )
					);
			}
		}

		$this->log( 'Verification response on line ' . __LINE__ . ':', __METHOD__, 'debug', $body );

		if ( ! $body ) {
			return new WP_Error(
				'verify-failed',
				__( 'Your TrustedLogin account is not active, please login to activate your account.', 'trustedlogin-connector' )
			);
		}

		if ( isset( $body->status ) && 'active' !== $body->status ) {
			return new WP_Error(
				'verify-failed-inactive',
				__( 'Your TrustedLogin account is not active, please login to activate your account.', 'trustedlogin-connector' )
			);
		}

		if ( isset( $body->error ) && $body->error ) {
			return new WP_Error(
				'verify-failed-other',
				// translators: %d is the HTTP status code.
				sprintf( __( 'Please contact support (Error Status #%d)', 'trustedlogin-connector' ), $status )
			);
		}

		return $body;
	}

	/**
	 * Handles the response for API calls
	 *
	 * @since 0.4.1
	 *
	 * @param array|false|WP_Error $api_response The result from `$this->apiSend()`.
	 *
	 * @return object|true|WP_Error  Either `json_decode()` of the result's body, or true if status === 204 (successful response, but no sites found) or WP_Error if empty body or error.
	 */
	public function handleResponse( $api_response ) {

		if ( is_wp_error( $api_response ) ) {
			return $api_response; // Logging intentionally left out; already logged in apiSend()
		}

		if ( empty( $api_response ) || ! is_array( $api_response ) ) {
			$this->log(
				'Malformed api_response received:',
				__METHOD__,
				'error',
				array(
					'response' => $api_response,
				)
			);

			return new WP_Error( 'malformed_response', esc_html__( 'Malformed API response received.', 'trustedlogin-connector' ) );
		}

		// first check the HTTP Response code
		$response_code = wp_remote_retrieve_response_code( $api_response );

		// successful response, but no sites found. does not return any body content, so can bounce out successfully here
		if ( 204 === $response_code ) {
			return true;
		}

		$body = wp_remote_retrieve_body( $api_response );

		$body = json_decode( $body );

		if ( empty( $body ) || ! is_object( $body ) ) {
			$this->log( 'No body received:', __METHOD__, 'error', array( 'body' => $body ) );

			return new WP_Error( 'empty_body', esc_html__( 'No body received.', 'trustedlogin-connector' ) );
		}

		$body_message = isset( $body->message ) ? $body->message : null;

		switch ( $response_code ) {
			case 423:
				$this->log(
					'Pause mode is activated on TrustedLogin.com:',
					__METHOD__,
					'error',
					array(
						'response' => $api_response,
					)
				);
				return new WP_Error( 'pause_mode_error', esc_html__( 'Cannot log in: Pause Mode is activated for this account on TrustedLogin.com.', 'trustedlogin-connector' ) );
			case 424:
				$this->log(
					'Error Getting Signature Key from Vendor: ',
					__METHOD__,
					'error',
					array(
						'response' => $api_response,
					)
				);
				return new WP_Error( 'signature_key_error', $body_message );
			case 410:
				$this->log(
					'Error Getting Signature Key from Vendor: ',
					__METHOD__,
					'error',
					array(
						'response' => $api_response,
					)
				);
				return new WP_Error( 'gone', 'This support request is gone. Please create a new request. (SecretNotFoundInVaultException)' );
			case 403:
				// Problem with Token
				// TODO: Handle this
			case 404:
				return new WP_Error( 'not_found', esc_html__( 'Not found.', 'trustedlogin-connector' ) );
			default:
		}

		// The API may return either error or errors, so we need to check both.
		if ( isset( $body->errors ) || isset( $body->error ) ) {
			$errors = isset( $body->errors ) ? $body->errors : $body->error;
			$errors = implode( ', ', (array) $errors );

			$this->log( "Error from API: {$errors}", __METHOD__, 'error' );

			// translators: %s is the error message from the API.
			return new WP_Error( 'api_errors', sprintf( esc_html__( 'Errors returned from API: %s', 'trustedlogin-connector' ), $errors ) );
		}

		return $body;
	}

	/**
	 * API Function: send the API request
	 *
	 * @since 0.4.0
	 *
	 * @param string $url The complete url for the REST API request
	 * @param mixed  $data Data to send as JSON-encoded request body
	 * @param string $method HTTP request method (must be 'POST', 'PUT', 'GET', 'PUSH', or 'DELETE')
	 * @param array  $additional_headers Any additional headers to send in request (required for auth/etc)
	 *
	 * @return array|false|WP_Error - wp_remote_post response, false if invalid HTTP method, WP_Error if request errors
	 */
	public function apiSend( $url, $data, $method, $additional_headers ) {

		return $this->apiSender->send( $url, $data, $method, $additional_headers );
	}
}
