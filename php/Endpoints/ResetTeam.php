<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

class ResetTeam extends Settings
{


	/** @inheritdoc */
	protected function route()
	{

		return 'settings/team/reset';
	}

	/** @inheritdoc */
	protected function updateArgs()
	{

		return [
			'accountId' => [
				'type' => 'string',
				'required' => true
			],
			'integration' => [
				'type' => 'string',
				'required' => true
			],
		];
	}

	public function get(\WP_REST_Request $request){
		$settingsApi = SettingsApi::fromSaved();
		return $this->createResponse($settingsApi);
	}

	/**
	 * Handler for requests to POST settings updates
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update(\WP_REST_Request $request)
	{
		$settingsApi = SettingsApi::fromSaved();
		if ( in_array( [ 'helpscout', 'freescout' ], $request->param( 'integration' ), true ) ) {
			try {
				$settingsApi = $settingsApi->getByAccountId( $request->param('accountId') );
				$settingsApi->resetHelpdeskSettings(
					$request->get_param('accountId'),
					$request->param('integration')
				);

			} catch (\Throwable $th) {
				return rest_ensure_response( [
					'error' => 'Account not found'
				] );
			}
		}

		return $this->createResponse( SettingsApi::fromSaved());
	}

}
