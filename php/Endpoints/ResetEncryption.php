<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

/**
 * Endpoint to reset encryption keys
 */
class ResetEncryption extends Settings {



	/** @inheritdoc */
	protected function route() {

		return 'settings/encryption/reset';
	}

	/** @inheritdoc */
	protected function updateArgs() {
		return array();
	}

	/**
	 * Reset encryption keys with POST request
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update( \WP_REST_Request $request ) {
		$encryption = \trustedlogin_connector()
			->getEncryption();
		// Delete keys
		$encryption->deleteKeys();
		// Makes new keys
		$encryption->getPublicKey();
		return rest_ensure_response( array(), 204 );
	}
}
