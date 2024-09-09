<?php


namespace TrustedLogin\Vendor\Status;

/**
 * Track onboarding status
 */
class Onboarding {

	/**
	 * The name of the option we store onboarding status in.
	 */
	const ONBOARDED = 'trustedlogin_has_onboarded';

	/**
	 * Reset status of unboarding.
	 *
	 * @return void
	 */
	public static function reset() {
		delete_option( self::ONBOARDED );
	}
	/**
	 * Check if we have already unboarded.
	 *
	 * @return bool
	 */
	public static function hasOnboarded() {
		return get_option( self::ONBOARDED, 0 ) == '1';
	}

	/**
	 * Set onboarding status to has onboarded.
	 *
	 * @return void
	 */
	public static function setHasOnboarded() {
		update_option( self::ONBOARDED, 1 );
	}
}
