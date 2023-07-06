<?php

namespace TrustedLogin\Vendor\Webhooks;

class Freescout extends Helpscout{

	/**
	 * Get slug for this webhook.
	 *
	 * @return string
	 */
	public static function getProviderName(){
		return 'freescout';
	}

	/**
	 * Get name for this webhook with capitals.
	 *
	 * @return string
	 */
	public static function getProviderNameCapitalized(){
		return 'FreeScout';
	}
}
