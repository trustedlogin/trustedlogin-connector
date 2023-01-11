<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Contracts\SendsApiRequests;

use \WP_Error;
use \Exception;

/**
 *
 */
class ApiSend implements SendsApiRequests
{

	use Logger;


	/**
	 * API Function: send the API request
	 *
	 * @since 0.4.0
	 *
	 * @param string $url The complete url for the REST API request
	 * @param mixed $data Data to send as JSON-encoded request body
	 * @param string $method HTTP request method (must be 'POST', 'PUT', 'GET', 'PUSH', or 'DELETE')
	 * @param array $additional_headers Any additional headers to send in request (required for auth/etc)
	 * @param bool $ssl_verify Whether to verify SSL certificate. Default true. Only disable for local dev
	 * @return array|false|WP_Error - wp_remote_post response, false if invalid HTTP method, WP_Error if request errors
	 */
	public function send($url, $data, $method, $additional_headers, $ssl_verify = true)
	{

		if (! in_array($method, array( 'POST', 'PUT', 'GET', 'PUSH', 'DELETE' ))) {
			$this->log("Error: Method not in allowed array list ($method)", __METHOD__, 'error');

			return false;
		}

		$headers = array(
			'Accept'       => 'application/json',
			'Content-Type' => 'application/json',
		);

		if (! empty($additional_headers)) {
			$headers = array_merge($headers, $additional_headers);
		}

		$request_atts = array(
			'method'      => $method,
			'timeout'     => 45,
			'redirection' => 5,
			'httpversion' => '1.0',
			'blocking'    => true,
			'headers'     => $headers,
			'cookies'     => array(),
			'sslverify'   => $ssl_verify,
		);

		if ($data) {
			$request_atts['body'] = json_encode($data);
		}

		$response = wp_remote_request($url, $request_atts);
		if (is_wp_error($response)) {
			$this->log(sprintf("%s - Something went wrong (%s): %s", __METHOD__,
			 $response->get_error_code(), $response->get_error_message()), __METHOD__, 'error'
			);

			return $response;
		}

		$this->log(__METHOD__ . " - result ", __METHOD__, 'info', (array)$response['response']);

		return $response;
	}
}
