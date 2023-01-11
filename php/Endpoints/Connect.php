<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\ConnectionService;
use TrustedLogin\Vendor\TeamSettings;
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
		return [];
		return [
			'exchange' => array(
				'required' => false,
				'type' => 'string',
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
				$request->get_param('token'),
				ConnectionService::makeNonce()

			);
		} else {
			//Exchange account token for account data
			$data = $connectService->getAccount(
				$request->get_param('token'),
				$request->get_param('exchange')
			);

			if( ! empty($data)){
				if( is_string($data) ){
					$data = json_decode($data,true);
				}
				//Save team settings
				$team = new TeamSettings([
					'account_id'       => $data['id'],
					'private_key'      => $data['privateKey'],
					'public_key'       => $data['publicKey'],
					'name' => $data['name'],
				]);
				SettingsApi::fromSaved()
					->addSetting($team);
				//Return name and id to the client
				return new \WP_REST_Response([
					'success' => true,
					'name' => $data['name'],
					'id'       => $data['id'],
				], 200);
			}else{
				//Return error
				return new \WP_REST_Response([
					'success' => false,
					'error' => $data,
				], 200);
			}
		}
		return new \WP_REST_Response([
			'success' => true,
			'data' => $data,
		], 200);
	}
}
