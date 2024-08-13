<?php


namespace TrustedLogin\Vendor\Status;

class IsIntegrationActive {



	/**
	 * Check if integration is globally active
	 */
	public static function check( string $integrationName ) {
		$settings = \trustedlogin_connector()->getSettings()->getIntegrationSettings();
		return isset( $settings[ $integrationName ] ) && $settings[ $integrationName ]['enabled'];
	}
}
