<?php

namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\Encryption;
use TrustedLogin\Vendor\AccessKeyLogin;

class AccesKeyLoginTest extends \WP_UnitTestCase
{
	use MocksTLApi;

	const ACCOUNT_ID = 'test-tl-service';
	const ACCESS_KEY = 'a218a218a218a218a218218218218218a218a218a218a218a218218218218218';
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
		foreach ([
			AccessKeyLogin::ACCESS_KEY_INPUT_NAME,
			AccessKeyLogin::ACCOUNT_ID_INPUT_NAME,
			AccessKeyLogin::NONCE_NAME,
			'_wp_http_referer'

		] as $key) {
			unset($_REQUEST[ $key]);
		}
		SettingsApi::fromSaved()->reset()->save();
		//Always reset API sender
		$this->resetTlApiMock();
		parent::tearDown();
	}

	/**
	 * @group AccessKeyLogin
	 * @covers TrustedLogin\Vendor\AccessKeyLogin::verifyGrantAccessRequest()
	 */
	public function testVerifyRequest()
	{
		$ak = new AccessKeyLogin();
		//Check for no_access_key error
		$this->assertTrue(
			is_wp_error(
				$ak->verifyGrantAccessRequest()
			)
		);
		$this->assertArrayHasKey(
			'no_access_key',
			$ak->verifyGrantAccessRequest()->errors
		);
		//Set access key
		$_REQUEST[ AccessKeyLogin::ACCESS_KEY_INPUT_NAME ] ='something';
		//Check for no no_account_id error
		$this->assertTrue(
			is_wp_error(
				$ak->verifyGrantAccessRequest()
			)
		);
		$this->assertArrayHasKey(
			'no_account_id',
			$ak->verifyGrantAccessRequest()->errors
		);
		//Set account id
		$_REQUEST[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ] = 'whatever';
		//Check for no no_nonce
		$this->assertTrue(
			is_wp_error(
				$ak->verifyGrantAccessRequest()
			)
		);
		$this->assertArrayHasKey(
			'no_nonce',
			$ak->verifyGrantAccessRequest()->errors
		);

		//Can bypass nonce check
		$this->assertTrue(
			$ak->verifyGrantAccessRequest(false)
		);


		//Set invalid nonce
		$_REQUEST[AccessKeyLogin::NONCE_NAME ] = wp_create_nonce('bad-action');

		//Return WP_Error for bad nonce
		$this->assertTrue(
			is_wp_error(
				$ak->verifyGrantAccessRequest()
			)
		);

		//Set valid nonce
		$_REQUEST[AccessKeyLogin::NONCE_NAME ] = wp_create_nonce(AccessKeyLogin::NONCE_ACTION);

		$this->assertTrue(
			$ak->verifyGrantAccessRequest()
		);
	}

	/**
	 * @group suspect
	 * @group AccessKeyLogin
	 * @covers AccessKeyLogin::handle()
	 */
	public function testHandler()
	{

		//Set mock API for TrustedLogin eCommerce
		$this->setTlApiMock();
		//Handler that will lways return true on verification.
		$handler = new class extends AccessKeyLogin {
			public function verifyGrantAccessRequest(bool $checkNonce = true)
			{
				return true;
			}
		};
		//Set up REQUEST var
		$access_key = self::ACCESS_KEY;
		$_REQUEST[ AccessKeyLogin::ACCESS_KEY_INPUT_NAME ]= $access_key;
		$account_id = self::ACCOUNT_ID;
		$_REQUEST[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME] = $account_id;


		//login - we test authentication in self::testVerifyRequest()
		wp_set_current_user(self::factory()->user->create([ 'role' => 'administrator' ]));

		//Set encryption keys to same vendor keys as test envelope was encrypted with.
		add_filter('trustedlogin/connector/encryption/get-keys', function () {
			return $this->getEncryptionKeys();
		});

		//Run handler, expect it to return the envelope(s), as an array
		$results = $handler->handle();

		$this->assertIsArray($results);

		$result = reset($results);

		//With the right things in it
		$this->assertArrayHasKey('loginurl', $result);
		$this->assertTrue(
			(bool)filter_var($result['loginurl'], FILTER_VALIDATE_URL)
		);
		$this->assertArrayHasKey('siteurl', $result);
		$this->assertSame('https://trustedlogin.support', $result['siteurl']);
	}

	/**
	 * @covers AccessKeyLogin::url()
	 */
	public function testUrl()
	{
		$this->assertTrue(
			(bool)filter_var(AccessKeyLogin::url('arms', 'helpscout'), FILTER_VALIDATE_URL)
		);
	}

	/**
	 * @covers AccessKeyLogin::makeSecret()
	 */
	public function testMakeSecret()
	{
		$this->assertTrue(
			is_string(AccessKeyLogin::makeSecret())
		);
	}
}
