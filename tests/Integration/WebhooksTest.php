<?php

namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\Webhooks\Factory;
use TrustedLogin\Vendor\Webhooks\Helpscout;

class WebhooksTest extends \WP_UnitTestCase
{
	use MocksTLApi;

	const ACCOUNT_ID = 'WebhooksTest';
	const ACCESS_KEY = 'r218';
	public function setUp()
	{
		$this->setTlApiMock();
		SettingsApi::fromSaved()->reset()->save();
		$settings = new SettingsApi([
			[
				'account_id'       => self::ACCOUNT_ID,
				'private_key'      => 'a217',
				'public_key'       	=> self::ACCESS_KEY,
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
		//Always reset API sender
		$this->resetTlApiMock();
		parent::tearDown();
	}

	/**
	 * @covers TrustedLogin\Vendor\Webhooks\Factory::webhook()
	 * @covers TrustedLogin\Vendor\Webhooks\Helpscout::get_slug()
	 */
	public function testFactory()
	{
		$account = SettingsApi::fromSaved()->getByAccountId(
			self::ACCOUNT_ID
		);
		$webhook = Factory::webhook($account);
		$this->assertSame('helpscout', $webhook->getProviderName());

		$account->set('helpdesk', [ 'random' ]);
		$this->expectException('\Exception');
		Factory::webhook($account);
	}

	/**
	 * @covers TrustedLogin\Vendor\Webhooks\Factory::actionUrl()
	 */
	public function testBuildActionUrl()
	{

		$url = Factory::actionUrl('test', self::ACCOUNT_ID, 'helpscout');
		$this->assertTrue(
			(bool)filter_var($url, FILTER_VALIDATE_URL)
		);
		$this->assertTrue(
			(bool) preg_match('/'.self::ACCOUNT_ID.'/', $url)
		);
		$this->assertTrue(
			(bool) preg_match('/helpscout/', $url)
		);
	}
}
