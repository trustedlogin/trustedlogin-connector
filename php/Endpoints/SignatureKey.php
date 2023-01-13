<?php
namespace TrustedLogin\Vendor\Endpoints;


class SignatureKey extends Endpoint
{

	/** @inheritdoc */
	protected function route()
	{
		return 'signature_key';
	}

	/** @inheritdoc */
	public function get(\WP_REST_Request $request)
	{
		$sign_public_key         = \trustedlogin_vendor()->getSignatureKey();

		$response = new \WP_REST_Response();

		if (! is_wp_error($sign_public_key)) {
			$data = array( 'signatureKey' => $sign_public_key );
			$response->set_data($data);
			$response->set_status(self::PUBLIC_KEY_SUCCESS_STATUS);
		} else {
			$response->set_status(self::PUBLIC_KEY_ERROR_STATUS);
		}

		return $response;
	}

	/** @inheritdoc */
	public function authorize( \WP_REST_Request $request ) {
		return true;
	}
}
