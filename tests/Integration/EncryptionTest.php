<?php
/**
 * Class EncryptionTest
 *
 * @package Tl_Support_Side
 */
namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\Encryption;

/**
 * Tests for Audit Logging
 */
class EncryptionTest extends \WP_UnitTestCase
{

	/** @var TrustedLogin\Vendor\Plugin */
	private $TL;

	/** @var TrustedLogin\Encryption  */
	private $encryption;

	/**
	 * AuditLogTest constructor.
	 */
	public function setUp(): void
	{
		$this->encryption = new Encryption();
	}

	/**
	 * @covers Encryption::generateKeys
	 */
	function test_generateKeys()
	{

		$property = new \ReflectionProperty($this->encryption, 'key_option_name');
		$property->setAccessible(true);
		$option_name = $property->getValue($this->encryption);

		$this->assertEmpty(get_site_option($option_name));

		$method = new \ReflectionMethod('TrustedLogin\Vendor\Encryption', 'generateKeys');
		$method->setAccessible(true);

		$keys = $method->invoke($this->encryption, false);

		// Don't set keys yet (passed false above)
		$this->assertEmpty(get_site_option($option_name));

		$this->assertTrue(is_object($keys), 'create_keys should return an object');
		$this->assertObjectHasAttribute('public_key', $keys, 'public_key should be returned by create_keys ');
		$this->assertObjectHasAttribute('private_key', $keys, 'private_key should be returned by create_keys ');

		// Now we set keys
		$keys = $method->invoke($this->encryption, true);

		$stored_value = get_site_option($option_name);

		$this->assertNotEmpty($stored_value);
		$this->assertEquals(wp_json_encode($keys), $stored_value);

		delete_site_option($option_name);
	}

	/**
	 * @covers TrustedLogin_Encryption::__construct()
	 * @throws ReflectionException
	 */
	function test_key_setting_name_filter()
	{
		$property = new \ReflectionProperty($this->encryption, 'key_option_name');
		$property->setAccessible(true);
		$setting_name = $property->getValue($this->encryption);
		$this->assertEquals($setting_name, 'trustedlogin_keys');
		delete_site_option($setting_name);

		// Test what happens when filtering the setting name
		add_filter('trustedlogin/connector/encryption/keys-option', function () {
			return 'should_be_filtered';
		});

		$Encryption_Class = new Encryption();
		$property = new \ReflectionProperty($Encryption_Class, 'key_option_name');
		$property->setAccessible(true);
		$setting_name = $property->getValue($Encryption_Class);
		$this->assertEquals($setting_name, 'should_be_filtered');

		delete_site_option($setting_name);

		/** @see https://github.com/trustedlogin/trustedlogin-connector/commit/ddd47f4 */
		add_filter('trustedlogin/connector/encryption/keys-option', function () {
			return 'Should be not valid because it is way too long and this should result in a default value. This is a very long string that should not be used as a setting name. It is way too long. But it is a good test.';
		});

		$Encryption_Class = new Encryption();
		$property = new \ReflectionProperty($Encryption_Class, 'key_option_name');
		$property->setAccessible(true);
		$setting_name = $property->getValue($Encryption_Class);
		$this->assertEquals($setting_name, 'trustedlogin_keys', 'The setting name was too long, so it should have been reset to the default value.');

		delete_site_option($setting_name);
	}

	private function delete_key_option()
	{
		$property = new \ReflectionProperty($this->encryption, 'key_option_name');
		$property->setAccessible(true);
		$setting_name = $property->getValue($this->encryption);
		delete_site_option($setting_name);
	}

	/**
	 * @group encryption
	 * @covers Encryption::getKeys()
	 * @covers Encryption::generateKeys()
	 */
	function test_getKeys()
	{

		$method_generateKeys = new \ReflectionMethod('TrustedLogin\Vendor\Encryption', 'generateKeys');
		$method_generateKeys->setAccessible(true);

		/** @see TrustedLogin_Encryption::getKeys() */
		$method_getKeys = new \ReflectionMethod('TrustedLogin\Vendor\Encryption', 'getKeys');
		$method_getKeys->setAccessible(true);

		$this->delete_key_option();

		$keys = $method_getKeys->invoke($this->encryption, false);
		$this->assertFalse($keys, 'When $generate_if_not_set is false, there should be no keys');

		/** @see TrustedLogin\Vendor\Encryption::generateKeys() */
		$generated_keys = $method_generateKeys->invoke($this->encryption, true);

		$keys = $method_getKeys->invoke($this->encryption, false, 'But there should be keys after they have been created.');

		$this->assertEquals($keys, $generated_keys, 'And when the keys are already generated, they should match the DB-stored ones');

		$this->delete_key_option();

		$keys = $method_getKeys->invoke($this->encryption, true);

		$this->assertTrue(is_object($keys), 'And there should be keys if $generate_if_not_set is true');
		$this->assertObjectHasAttribute('public_key', $keys, 'public_key should be returned by getKeys ');
		$this->assertObjectHasAttribute('private_key', $keys, 'private_key should be returned by getKeys ');

		add_filter('trustedlogin/connector/encryption/get-keys', '__return_zero');

		$zero = $method_getKeys->invoke($this->encryption, true);

		$this->assertEquals(0, $zero, 'trustedlogin/connector/encryption/get-keys filter failed');

		remove_all_filters('trustedlogin/connector/encryption/get-keys');
	}

	/**
	 * @group encryption
	 *
	 * @covers TrustedLogin\Vendor\Encryption::getPublicKey
	 */
	function test_getPublicKey()
	{

		$public_key = $this->encryption->getPublicKey();

		$this->assertTrue(is_string($public_key));

		$this->assertEquals(64, strlen($public_key));
	}

	/**
	 * @group encryption
	 *
	 * @covers TrustedLogin\Vendor\Encryption::createIdentityNonce
	 * @covers TrustedLogin\Vendor\Encryption::verifySignature()
	 */
	function test_createIdentityNonce()
	{

		// Load in Sodium_Compat
		include_once plugin_dir_path(TRUSTEDLOGIN_PLUGIN_FILE) . 'vendor/autoload.php';

		$nonces = $this->encryption->createIdentityNonce();

		$this->assertTrue(is_array($nonces), 'createIdentityNonce should return an array');

		$this->assertArrayHasKey('nonce', $nonces, 'createIdentityNonce return array should contain a nonce key');
		$this->assertArrayHasKey('signed', $nonces, 'createIdentityNonce return array should contain a signed key');

		$unsigned_nonce = base64_decode($nonces['nonce']);
		$signed_nonce = base64_decode($nonces['signed']);

		$this->assertEquals(\ParagonIE_Sodium_Compat::CRYPTO_SIGN_BYTES, strlen($signed_nonce));

		/** @see TrustedLogin_Encryption::getKeys() */
		$method_verifySignature = new \ReflectionMethod('TrustedLogin\Vendor\Encryption', 'verifySignature');
		$method_verifySignature->setAccessible(true);
		$verified = $method_verifySignature->invoke($this->encryption, $signed_nonce, $unsigned_nonce);
		$this->assertNotWPError($verified);

		/** @var WP_Error $type_error */
		$type_error = $method_verifySignature->invoke($this->encryption, 1, $unsigned_nonce);
		$this->assertWPError($type_error, 'Integer values should not be allowed by sodium_crypto_sign_verify_detached(). This should have thrown an error.');
		$this->assertEquals('sodium-error', $type_error->get_error_code());

		/** @var WP_Error $wp_error */
		$wp_error = $method_verifySignature->invoke($this->encryption, 'asdasdsad', $unsigned_nonce);
		$this->assertWPError($wp_error, 'The signed nonce was made up; this should not have passed.');
		$this->assertEquals('sodium-error', $wp_error->get_error_code());

		add_filter('trustedlogin/connector/encryption/get-keys', $bad_range_key = function ($keys) {

			$keys->sign_public_key = 'should be 64 bytes long...';

			return $keys;
		});

		/** @var WP_Error $wp_error */
		$wp_error = $method_verifySignature->invoke($this->encryption, $signed_nonce, $unsigned_nonce);
		$this->assertWPError($wp_error, 'The key was not the correct number of characters; this should not have passed.');
		$this->assertEquals('sodium-error', $wp_error->get_error_code());

		remove_filter('trustedlogin/connector/encryption/get-keys', $bad_range_key);

		/** @var WP_Error $wp_error */
		$wp_error = $method_verifySignature->invoke($this->encryption, $signed_nonce, str_shuffle($unsigned_nonce));
		$this->assertWPError($wp_error, 'The nonce was modified, so this should not have passed.');
		$this->assertEquals('signature-failure', $wp_error->get_error_code());
	}

	/**
	 * Tests to make sure the decryption doesn't fail because of sodium issues
	 * @group encryption

	 * @todo Update this test to actually check whether it can decrypt properly...
	 *
	 * @covers TrustedLogin\Vendor\Encryption::createIdentityNonce
	 * @uses \TrustedLogin\Vendor\Encryption::getKeys
	 */
	function test_decrypt_passes_sodium_at_least()
	{

		$nonces = $this->encryption->createIdentityNonce();

		/** @see TrustedLogin\Vendor\Encryption::getKeys() */
		$method = new \ReflectionMethod('TrustedLogin\Vendor\Encryption', 'getKeys');
		$method->setAccessible(true);
		$keys = $method->invoke($this->encryption, true);

		$this->assertObjectHasAttribute('public_key', $keys);

		$nonce = \sodium_bin2hex(\random_bytes(SODIUM_CRYPTO_BOX_NONCEBYTES));

		$decrypted = $this->encryption->decryptCryptoBox('Very encrypted.', $nonce, $keys->public_key);

		$this->assertNotEquals('decryption_failed_sodiumexception', $decrypted->get_error_code(), 'The sodium process requires specific parameters that were not met: ' . $decrypted->get_error_message());

		$this->assertEquals('decryption_failed', $decrypted->get_error_code(), $decrypted->get_error_message());

		// TODO: Actual decryption test :facepalm:
	}

	/**
	 * @group encryption
	 * @covers TrustedLogin\Vendor\Encryption::encrypt()
	 * @covers TrustedLogin\Vendor\Encryption::decrypt()
	 */
	function test_encrypt_decrypt()
	{
		$message = 'Lumens';
		$encrypted = Encryption::encrypt($message);
		$this->assertIsString($encrypted);
		$this->assertEquals($message, Encryption::decrypt($encrypted));
	}
}
