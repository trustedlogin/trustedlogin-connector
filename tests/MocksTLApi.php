<?php
namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\Endpoints\Settings;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\ApiSend;
use TrustedLogin\Vendor\Contracts\SendsApiRequests;

trait MocksTLApi
{

	/**
	 * Set up mock API for TrustedLogin eCommerce
	 */
	protected function setTlApiMock()
	{

		$sender = new MocksSendsApiRequests();
		trustedlogin_connector()->setApiSender(
			$sender
		);
	}

	/**
	 * The data for get envelope response
	 * @return string
	 */
	protected function getEnvelopeData()
	{
		return file_get_contents(__DIR__ . '/data/get-envelope.json');
	}

	/**
	 * Resets mock API for TrustedLogin eCommerce
	 */
	protected function resetTlApiMock()
	{
		trustedlogin_connector()->setApiSender(
			new ApiSend()
		);
	}

	/**
	 * Get the vendor encryption keys for testing with.
	 */
	protected function getEncryptionKeys()
	{
		if (! isset($_ENV['TL_VENDOR_ENCRYTPTION_KEY'])) {
			throw new \Exception('TL_VENDOR_ENCRYTPTION_KEY is not an env var');
		}
		try {
			return json_decode($_ENV['TL_VENDOR_ENCRYTPTION_KEY']);
		} catch (\Throwable $th) {
			throw $th;
		}
	}
}
