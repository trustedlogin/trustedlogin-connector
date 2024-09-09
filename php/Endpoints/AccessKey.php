<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\Traits\Logger;

class AccessKey extends Endpoint {

	use Logger;

	/** @inheritdoc */
	protected function route() {
		return 'access_key';
	}


	/** @inheritdoc */
	public function get( \WP_REST_Request $request ) {
		// This should never happen, but just in case!
		return new \WP_Error( 'method_not_allowed', esc_html__( 'Method not allowed.', 'trustedlogin-connector' ), array( 'status' => 405 ) );
	}

	/** @inheritdoc */
	public function authorize( \WP_REST_Request $request ) {
		// Valid nonce?
		$valid = wp_verify_nonce(
			sanitize_text_field( wp_unslash( $request->get_param( AccessKeyLogin::NONCE_NAME ) ) ),
			AccessKeyLogin::NONCE_ACTION
		);

		if ( ! $valid ) {
			$this->log( 'Nonce is invalid; could be insecure request. Refresh the page and try again.', __METHOD__, 'error' );
			return new \WP_Error( 'bad_nonce', esc_html__( 'The nonce was not set for the request.', 'trustedlogin-connector' ) );
		}
		return true;
	}

	public function updateArgs() {
		return array(
			AccessKeyLogin::ACCESS_KEY_INPUT_NAME => array(
				'required' => true,
				'type'     => 'string',
			),
			AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => array(
				'required' => true,
				'type'     => 'string',
			),
			AccessKeyLogin::NONCE_NAME            => array(
				'required' => true,
				'type'     => 'string',
			),
		);
	}

	public function update( \WP_REST_Request $request ) {
		$handler = new AccessKeyLogin();
		$parts   = $handler->handle(
			array(
				AccessKeyLogin::ACCESS_KEY_INPUT_NAME =>
					$request->get_param( AccessKeyLogin::ACCESS_KEY_INPUT_NAME ),
				AccessKeyLogin::ACCOUNT_ID_INPUT_NAME =>
					$request->get_param( AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ),
			)
		);
		if ( is_wp_error( $parts ) ) {
			return $parts;
		}
		return new \WP_REST_Response(
			array(
				'success' => true,
				'data'    => $parts,
			),
			200
		);
	}
}
