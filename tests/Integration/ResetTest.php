<?php

namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\Reset;

class ResetTest extends \WP_UnitTestCase
{

	/**
	 * @covers \TrustedLogin\Vendor\Reset::actionUrl()
	 */
	public function testActionUrl()
	{
		$url = Reset::actionUrl();
		//has right endpoint
		$this->assertTrue(
			strpos($url, '/wp-admin/admin.php?') !== false
		);
		//has the correct action
		$this->assertTrue(
			strpos($url, 'action=tl_reset') !== false
		);
		//has a nonce
		$this->assertTrue(
			strpos($url, '_wpnonce') !== false
		);
		//has the right page
		$this->assertTrue(
			strpos($url, 'page='.  MenuPage::PARENT_MENU_SLUG) !== false
		);
	}
}
