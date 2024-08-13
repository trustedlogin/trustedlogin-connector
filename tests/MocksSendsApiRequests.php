<?php
namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\Endpoints\Settings;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\ApiSend;
use TrustedLogin\Vendor\Contracts\SendsApiRequests;

class MocksSendsApiRequests implements SendsApiRequests
{
	public $method;
	public $nextResponse;
	/**
	 * The data for get envelope response
	 * @return string
	 */
	protected function getEnvelopeData()
	{
		return file_get_contents(__DIR__ . '/data/get-envelope.json');  // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	}

	protected function strEndsWith($string, $search)
	{
		if (function_exists('str_ends_with')) {
			return str_ends_with($string, $search);
		}
		$len = strlen($search);
		if ($len == 0) {
			return true;
		}
		return (substr($string, -$len) === $search);
	}

	public function send($url, $data, $method, $additional_headers)
	{
		//Mock get envelope
		if ($this->strEndsWith(
			$url,
			'/get-envelope'
		)) {
			$json = $this->getEnvelopeData();
			return [
				'body' => $json
			];
		}
		//Mock
		if ($this->strEndsWith(
			str_replace(\trustedlogin_connector()->getApiUrl(), '', $url),
			'/sites/'
		)) {
			$json = file_get_contents(__DIR__ . '/data/sites-200.json');  // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			return [
				'body' => $json
			];
		}
	}
}
