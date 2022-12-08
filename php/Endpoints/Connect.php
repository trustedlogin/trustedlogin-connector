<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\ConnectionService;
use TrustedLogin\Vendor\Traits\Logger;

class Connect extends Endpoint
{
	use Logger;

	protected $connectService;

	/** @inheritdoc */
	protected function route()
	{
		return 'connect';
	}


	/** @inheritdoc */
	public function get(\WP_REST_Request $request)
	{
		//This should never happen, but just in case
		return [];
	}


	public function updateArgs(){
		return [
			'exchange' => array(
				'required' => false,
				'type' => 'bool',
				'default' => false,
			),
			'token' => array(
				'required' => true,
				'type' => 'string',
			),
		];
	}

	public function update(\WP_REST_Request $request ){
		$connectService = new ConnectionService(
			\trustedlogin_vendor()
		);
		//Not ready to exhchange yet
		if( ! $request->get_param('exchange') ){
			//Get the account tokens
			$data = $connectService->getAccountTokens(
				$request->get_param('token')
			);
		} else {
			//Exchange account token for account data
			$data = $connectService->getAccount(
				$request->get_param('token')
			);
		}
		return new \WP_REST_Response([
			'success' => true,
			'data' => $data,
		], 200);
	}
}
