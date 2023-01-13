<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\Services\RemoteSession;
use TrustedLogin\Vendor\SettingsApi;

/**
 * Endpoint to validate redirect from app
 */
class EncryptRemoteToken extends Settings
{


	/** @inheritdoc */
	protected function route()
	{

		return 'session/token/validate';
	}

	/** @inheritdoc */
	protected function updateArgs()
	{
		return [

			RemoteSession::TOKEN_QUERY_ARG => [
				'required' => true,
				'type' => 'string',
			],
			RemoteSession::NONCE_QUERY_ARG => [
				'required' => true,
				'type' => 'string',
			],
		];
	}

	/**
	 * Take app token, encode it with nonce and send it back to app.
	 *
	 * App then redirects back, and WordPress decrypts token, proving it is for this site, and validates nonce in token.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update(\WP_REST_Request $request)
	{
		$service = new RemoteSession(
			\trustedlogin_vendor()
		);
		$encrypted = $service->encryptToken(
			$request->get_param(RemoteSession::TOKEN_QUERY_ARG),
			$request->get_param(RemoteSession::NONCE_QUERY_ARG)
		);
		//if is WP_Error return it
		if( is_wp_error($encrypted) ){
			return $encrypted;
		}
		//return success
		return rest_ensure_response([
			'success' => true,
			'error' => false,
		],200);

	}

}
