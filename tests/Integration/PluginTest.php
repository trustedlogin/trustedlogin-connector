<?php
namespace TrusteLoginVendor\Tests\Integration;

use PHPUnit\Framework\TestCase;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\TeamSettings;
use TrustedLogin\Vendor\Contracts\SendsApiRequests;

use TrustedLogin\Vendor\Endpoints\Endpoint;

class PluginTest extends TestCase
{


	/**
	 * @covers TrustedLogin\Vendor\Plugin\getPublicKey
	 */
	public function testGetPublicKey()
	{

		$this->assertNotEmpty(
			trustedlogin_connector()->getPublicKey()
		);
	}

	/**
	 * @covers TrustedLogin\Vendor\Plugin\getPublicKey
	 */
	public function testGetSignatureKey()
	{

		$this->assertNotEmpty(
			trustedlogin_connector()->getSignatureKey()
		);
	}

	/**
	 * @covers TrustedLogin\Vendor\Plugin::getApiHandler()
	 * @covers TrustedLogin\Vendor\ApiHandler::getApiKey()
	 */
	public function testGetApiHandler()
	{
		//Add a team
		$setting = new TeamSettings(
			[
				'account_id'       => '6a',
				'private_key'      => '7',
				'public_key'       	=> '8',
			]
		);
		\TrustedLogin\Vendor\SettingsApi::fromSaved()
			->addSetting(
				$setting
			)
			->save();

		$handler = trustedlogin_connector()->getApiHandler(
			'6a',
			'https://test.com'
		);
		$this->assertSame(
			'https://test.com',
			$handler->getApiUrl()
		);
		$this->assertNotEmpty($handler->getXTlToken());
		$this->assertSame($setting->get('public_key'), $handler->getApiKey());
	}

	/**
	 * @covers TrustedLogin\Vendor\Plugin::getEncryption()
	 */
	public function testGetEncryption()
	{
		$this->assertSame(
			trustedlogin_connector()->getEncryption(),
			trustedlogin_connector()->getEncryption()
		);

		$this->assertSame(
			trustedlogin_connector()->getEncryption()->getPublicKey(),
			trustedlogin_connector()->getEncryption()->getPublicKey()
		);
	}

	/**
	 * @covers TrustedLogin\Vendor\Plugin::setApiSender()
	 */
	public function testGetSetApiSender()
	{
		$sender = new class implements SendsApiRequests {
			public $method;
			public function send($url, $data, $method, $additional_headers)
			{
				$this->method = $method;
			}
		};
		trustedlogin_connector()->setApiSender(
			$sender
		);
		//Add a team
		$setting = new TeamSettings(
			[
				'account_id'       => '6a',
				'private_key'      => '7',
				'public_key'       	=> '8',
			]
		);
		\TrustedLogin\Vendor\SettingsApi::fromSaved()
			->addSetting(
				$setting
			)
			->save();

		$handler = trustedlogin_connector()->getApiHandler(
			'6a',
			'https://test.com'
		);
		$handler->call('/a', [], 'GET');
		$this->assertSame('GET', $sender->method);
	}

	public function testVerifyAccount(){
		$this->markTestIncomplete('Not sure what is up here');
		$data = [
				"id"=> 8,
				"name"=> "Josh Team",
				"status"=> "active"

		];

	}
}
