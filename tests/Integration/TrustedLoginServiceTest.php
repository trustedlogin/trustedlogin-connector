<?php
namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\Endpoints\Settings;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\TrustedLoginService;
use TrustedLogin\Vendor\Contracts\SendsApiRequests;

/**
 *
 */
class TrustedLoginServiceTests extends \WP_UnitTestCase
{
	use MocksTLApi;
	const ACCOUNT_ID = 'test-tl-service';
	public function setUp()
	{
		$this->setTlApiMock();

		SettingsApi::fromSaved()->reset()->save();
		$settings = new SettingsApi([
			[
				'account_id'       => self::ACCOUNT_ID,
				'private_key'      => 'a217',
				'public_key'       	=> 'a218',
			],
			[
				'account_id'       => '1226',
				'private_key'      => 'b227',
				'public_key'       	=> 'b228',
			]
		]);

		$settings->save();
		parent::setUp();
	}

	public function tearDown()
	{
		SettingsApi::fromSaved()->reset()->save();
		$this->resetTlApiMock();
		parent::tearDown();
	}

	/**
	 * @covers TrustedLoginService::apiGetSecretIds()
	 */
	public function testGetSecretIds()
	{

		$this->assertNotEmpty(
			SettingsApi::fromSaved()
				->getByAccountId(
					self::ACCOUNT_ID
				)
		);

		$service = new TrustedLoginService(
			trustedlogin_vendor()
		);
		$r = $service->apiGetSecretIds('accessKey1', self::ACCOUNT_ID);
		$this->assertTrue(
			is_wp_error($r)
		);
		wp_set_current_user(self::factory()->user->create());
		$r = $service->apiGetSecretIds('accessKey1', self::ACCOUNT_ID);
		$this->assertIsArray(
			$r
		);
		$this->assertNotEmpty($r);(
			$r
		);
	}

	 /**
	 * @covers TrustedLoginService::apiGetEnvelope()
	 */
	public function testApiGetEnvelope()
	{
		$service = new TrustedLoginService(
			trustedlogin_vendor()
		);
		$r = $service->apiGetEnvelope('secret?', self::ACCOUNT_ID);
		$this->assertTrue(
			is_wp_error($r)
		);
		wp_set_current_user(self::factory()->user->create());
		$r = $service->apiGetEnvelope('secret?', self::ACCOUNT_ID);
		$this->assertFalse(
			is_wp_error($r)
		);
	}

	/**
	 * @covers TrustedLoginService::envelopeToUrl()
	 */
	public function testEnvelopeToUrl()
	{
		$this->markTestSkipped('Needs fixed');
		//Set encryption keys to same vendor keys as test envelope was encrypted with.
		add_filter('trustedlogin/vendor/encryption/get-keys', function () {
			return $this->getEncryptionKeys();
		});
		$service = new TrustedLoginService(
			trustedlogin_vendor()
		);
		//Get envelope and try to turn it into a URL.
		$envelope = json_decode($this->getEnvelopeData(), true);
		$r = $service->envelopeToUrl($envelope);

		//Is valid URL?
		$this->assertTrue(
			(bool)filter_var($r, FILTER_VALIDATE_URL)
		);
	}
}
