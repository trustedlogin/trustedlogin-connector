<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

class GlobalSettings extends Settings {



	/** @inheritdoc */
	protected function route() {
		return 'settings/global';
	}

	/** @inheritdoc */
	protected function updateArgs() {
		return array(
			'integrations' => array(
				'type'     => 'object',
				'required' => true,
			),
		);
	}

	/**
	 * Handler for requests to POST settings updates
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update( \WP_REST_Request $request ) {
		$settingsApi = SettingsApi::fromSaved();
		if ( is_array( $request->get_param( 'integrations', false ) ) ) {
			$settingsApi = $settingsApi->setGlobalSettings(
				array(
					'integrations' => $request->get_param( 'integrations' ),
				)
			);
			$settingsApi->save();
		}

		return $this->createResponse( $settingsApi );
	}
}
