<?php
namespace TrustedLogin\Vendor\Contracts;

use TrustedLogin\Vendor\Traits\Logger;
use WP_Error;
use Exception;

/**
 * Contract for ApiSender
 */
interface SendsApiRequests {


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
	public function send( $url, $data, $method, $additional_headers );
}
