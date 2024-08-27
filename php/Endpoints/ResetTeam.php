<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

class ResetTeam extends Settings {



	/** @inheritdoc */
	protected function route() {

		return 'settings/team/reset';
	}

	/** @inheritdoc */
	protected function updateArgs() {

		return array(
			'accountId'   => array(
				'type'     => 'string',
				'required' => true,
			),
			'integration' => array(
				'type'     => 'string',
				'required' => true,
			),
		);
	}

	public function get( \WP_REST_Request $request ) {
		$settingsApi = SettingsApi::fromSaved();
		return $this->createResponse( $settingsApi );
	}

	/**
	 * Handler for requests to POST settings updates
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update( \WP_REST_Request $request ) {
		if ( in_array( $request->get_param( 'integration' ), array( 'helpscout', 'freescout' ), true ) ) {
			$settingsApi = SettingsApi::fromSaved();
			try {
				$settingsApi->resetHelpdeskSettings(
					$request->get_param( 'accountId' ),
					$request->get_param( 'integration' )
				);
			} catch ( \Throwable $th ) {
				return rest_ensure_response(
					array(
						'error' => 'Account not found',
					)
				);
			}
		}

		return $this->createResponse( SettingsApi::fromSaved() );
	}
}
