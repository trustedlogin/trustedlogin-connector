<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

class Logging extends Settings
{


	/** @inheritdoc */
	protected function route()
	{
		return 'settings/logging';
	}

	/** @inheritdoc */
	protected function updateArgs()
	{
		return [
			'error' => [
				'type' => 'boolean',
				'required' => false,
				'default' => false
			],

		];
	}

	/**
	 * Handler for requests to GET logging settings
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get(\WP_REST_Request $request){
		return $this->createResponse(
			SettingsApi::fromSaved()
		);
	}

	/**
	 * Handler for requests to enable or disable logging
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update(\WP_REST_Request $request)
	{
		$settingsApi = SettingsApi::fromSaved();
		$settingsApi->setGlobalSettings(
			array_merge(
				$settingsApi->getGlobalSettings(),
				[
					'error_logging' => (bool)$request->get_param('error', false)
				]
			)

		);
		$settingsApi->save();


		return $this->createResponse($settingsApi);
	}

	protected function createResponse(SettingsApi $settingsApi){
		return rest_ensure_response(
			[
				'error_logging' => $settingsApi->getGlobalSettings()['error_logging'] ?? false,
			]
		);
	}

}
