<?php

namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\Logger;

use PHPUnit\Exception;
use WP_Error;

/**
 * Class: TrustedLogin Encryption
 *
 * Provides the ability for encrypted payloads to **only** be opened by vendor-side plugin, and not TrustedLogin.
 *
 * @package trustedlogin-vendor
 * @version 0.1.0
 */
class Encryption {

	use Logger;

	private $key_option_name = 'trustedlogin_keys';


	/**
	 * Maximum length of an index in MySQL.
	 *
	 * @since 1.1
	 *
	 * @see https://github.com/WordPress/WordPress/commit/b2cf8231059bb1c762a321a0a481f57f47ae9a1b
	 *
	 * @const int
	 */
	const MAX_INDEX_LENGTH = 191;

	public function __construct() {

		/**
		 * Filter allows site admins to change the site option key for storing the keys data.
		 *
		 * @since 0.8.0
		 *
		 * @param string $key_option_name The name of the option in the database.
		 * @param Encryption $instance The Encryption object.
		 */
		$key_option_name = apply_filters( 'trustedlogin/connector/encryption/keys-option', $this->key_option_name, $this );

		/**
		 * @deprecated 1.1
		 */
		$key_option_name = apply_filters_deprecated( 'trustedlogin/vendor/encryption/keys-option', array( $key_option_name, $this ), '1.1', 'trustedlogin/connector/encryption/keys-option' );

		// If the key_option_name is valid, use it.
		if ( is_string( $key_option_name ) && strlen( $key_option_name ) <= self::MAX_INDEX_LENGTH ) {
			$this->key_option_name = $key_option_name;
		} else {
			$this->log(
				'Key option name is too long or not a string. Using default.',
				__METHOD__,
				'error',
				array(
					'key_option_name' => $key_option_name,
				)
			);
		}
	}

	/**
	 * Delete the keys
	 *
	 * @return void
	 */
	public function deleteKeys() {
		delete_option( $this->key_option_name );
	}
	/**
	 * Returns the existing/saved key set.
	 *
	 * @since 0.8.0
	 *
	 * @param bool $generate_if_not_set If keys aren't saved in the database, should create using {@see generateKeys}?
	 *
	 * @return \stdClass|WP_Error If keys exist, returns the stdClass of keys. Otherwise, WP_Error explaning things.
	 */
	private function getKeys( $generate_if_not_set = true ) {

		$keys  = false;
		$value = get_site_option( $this->key_option_name );

		if ( $value ) {
			$keys = json_decode( $value );

			if ( ! $keys ) {
				$this->log( 'Keys were not decoded properly.', __METHOD__, 'error', $value );
			}
		}

		if ( ! $keys && $generate_if_not_set ) {
			$keys = $this->generateKeys( true );
		}

		/**
		 * Filter allows site admins to change where the key is fetched from.
		 *
		 * @since 1.1
		 *
		 * @param \stdClass|WP_Error $keys The keys object or WP_Error if any issues.
		 * @param Encryption $instance The Encryption object.
		 */
		$filtered_keys = apply_filters( 'trustedlogin/connector/encryption/get-keys', $keys, $this );

		/**
		 * @deprecated 1.1
		 */
		$filtered_keys = apply_filters_deprecated( 'trustedlogin/vendor/encryption/get-keys', array( $filtered_keys, $this ), '1.1', 'trustedlogin/connector/encryption/get-keys' );

		return $filtered_keys;
	}

	/**
	 * Creates a new public/private key set.
	 *
	 * @since 0.8.0
	 *
	 * @param bool $update Whether to update the database with the new keys. Default: true
	 *
	 * @return  \stdClass|WP_Error  $keys or WP_Error if any issues
	 *    $keys = {
	 *        private_key: (string) The private key used for encrypt/decrypt.
	 *        public_key: (string) The public key used for encrypt/decrypt.
	 *        sign_public_key: (string) The public key used for signing/verifying.
	 *        sign_private_key: (string) The private key used for signing/verifying.
	 *    }
	 */
	private function generateKeys( $update = true ) {

		if ( ! function_exists( 'sodium_crypto_box_keypair' ) ) {
			return new WP_Error( 'sodium_not_exists', 'Sodium isn\'t loaded. Upgrade to PHP 7.0 or WordPress 5.2 or higher.' );
		}

		try {
			// Keeping named $bob_{name} for clarity while implementing:
			// https://paragonie.com/book/pecl-libsodium/read/05-publickey-crypto.md
			$bob_box_kp        = \sodium_crypto_box_keypair();
			$bob_box_secretkey = \sodium_crypto_box_secretkey( $bob_box_kp );
			$bob_box_publickey = \sodium_crypto_box_publickey( $bob_box_kp );

			$bob_sign_kp        = \sodium_crypto_sign_keypair();
			$bob_sign_publickey = \sodium_crypto_sign_publickey( $bob_sign_kp );
			$bob_sign_secretkey = \sodium_crypto_sign_secretkey( $bob_sign_kp );

			$keys = (object) array(
				'private_key'      => \sodium_bin2hex( $bob_box_secretkey ),
				'public_key'       => \sodium_bin2hex( $bob_box_publickey ),
				'sign_private_key' => \sodium_bin2hex( $bob_sign_secretkey ),
				'sign_public_key'  => \sodium_bin2hex( $bob_sign_publickey ),
			);

			if ( $update ) {
				$updated = $this->updateKeys( $keys );

				if ( is_wp_error( $updated ) ) {
					return $updated;
				}
			}

			return $keys;
		} catch ( \SodiumException $e ) {
			return new WP_Error( 'sodium-error', $e->getMessage() );
		}
	}

	/**
	 * Saves the key pair to the local database for future use.
	 *
	 * @since 0.8.0
	 *
	 * @see Encryption::create_keys()
	 *
	 * @param object $keys The keys to save.
	 *
	 * @return true|WP_Error True if keys saved. WP_Error if not.
	 */
	private function updateKeys( $keys ) {

		$keys_db_ready = wp_json_encode( $keys );

		if ( ! $keys_db_ready ) {
			return new WP_Error( 'json_error', 'Could not encode keys to JSON.', $keys );
		}

		// Instead of update_site_option(), which can return false if value didn't change, success is much clearer
		// when deleting and checking whether adding worked
		delete_site_option( $this->key_option_name );

		$saved = add_site_option( $this->key_option_name, $keys_db_ready );

		if ( ! $saved ) {
			return new WP_Error( 'db_error', 'Could not save keys to database.' );
		}

		return true;
	}

	/**
	 * Gets a specific public cryptographic key.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key_slug The slug of the key to fetch.
	 *                          Options are 'public_key' (default), 'sign_public_key'.
	 *
	 * @return string|WP_Error  Returns key if found, otherwise WP_Error.
	 */
	public function getPublicKey( $key_slug = 'public_key' ) {

		$keys = $this->getKeys();

		if ( is_wp_error( $keys ) ) {
			return $keys;
		}

		if ( ! in_array( $key_slug, array( 'public_key', 'sign_public_key' ), true ) ) {
			return new WP_Error( 'not_public_key', 'This function can only return public keys' );
		}

		if ( ! $keys || ! is_object( $keys ) || ! property_exists( $keys, $key_slug ) ) {
			return new WP_Error( 'get_key_failed', \sprintf( 'Could not get %s from get_key.', $key_slug ) );
		}

		return $keys->{$key_slug};
	}

	/**
	 * Gets a specific private cryptographic key.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key_slug The slug of the key to fetch.
	 *                          Options are 'public_key' (default), 'sign_public_key'.
	 *
	 * @return string|WP_Error  Returns key if found, otherwise WP_Error.
	 */
	private function getPrivateKey( $key_slug = 'private_key' ) {

		$keys = $this->getKeys();

		if ( is_wp_error( $keys ) ) {
			return $keys;
		}

		if ( ! in_array( $key_slug, array( 'private_key', 'sign_private_key' ), true ) ) {
			return new WP_Error( 'not_public_key', 'This function can only return private keys' );
		}

		if ( ! $keys || ! is_object( $keys ) || ! property_exists( $keys, $key_slug ) ) {
			return new WP_Error( 'get_key_failed', \sprintf( 'Could not get %s from get_key.', $key_slug ) );
		}

		return $keys->{$key_slug};
	}

	/**
	 * Encrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 * @since 1.0.0
	 *
	 * @param string $value Value to encrypt.
	 *
	 * @throws \Exception
	 *
	 * @return string|bool Encrypted value, or false on failure.
	 */
	public static function encrypt( $value = '' ) {
		if ( ! extension_loaded( 'openssl' ) ) {
			throw new \Exception( 'OpenSSL is not installed' );
		}

		if ( ! defined( 'LOGGED_IN_KEY' ) ) {
			throw new \Exception( 'LOGGED_IN_KEY constant is not defined.' );
		}

		if ( ! defined( 'LOGGED_IN_SALT' ) ) {
			throw new \Exception( 'LOGGED_IN_SALT constant is not defined.' );
		}

		$method = 'aes-256-ctr';
		$ivlen  = openssl_cipher_iv_length( $method );
		$iv     = openssl_random_pseudo_bytes( $ivlen );

		$raw_value = openssl_encrypt( $value . LOGGED_IN_SALT, $method, LOGGED_IN_KEY, 0, $iv );

		if ( ! $raw_value ) {
			return false;
		}

		return base64_encode( $iv . $raw_value ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	}

	/**
	 * Decrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 * @since 1.0.0
	 *
	 * @param string $raw_value Value to decrypt.
	 * @return string|bool Decrypted value, or false on failure.
	 * @throws \Exception
	 */
	public static function decrypt( $raw_value ) {

		if ( ! extension_loaded( 'openssl' ) ) {
			throw new \Exception( 'OpenSSL is not installed' );
		}

		if ( ! defined( 'LOGGED_IN_KEY' ) ) {
			throw new \Exception( 'LOGGED_IN_KEY constant is not defined.' );
		}

		if ( ! defined( 'LOGGED_IN_SALT' ) ) {
			throw new \Exception( 'LOGGED_IN_SALT constant is not defined.' );
		}

		$raw_value = base64_decode( $raw_value, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode

		$method = 'aes-256-ctr';
		$ivlen  = openssl_cipher_iv_length( $method );
		$iv     = substr( $raw_value, 0, $ivlen );

		$raw_value = substr( $raw_value, $ivlen );

		$value = openssl_decrypt( $raw_value, $method, LOGGED_IN_KEY, 0, $iv );
		if ( ! $value || substr( $value, - strlen( LOGGED_IN_SALT ) ) !== LOGGED_IN_SALT ) {
			return false;
		}

		return substr( $value, 0, - strlen( LOGGED_IN_SALT ) );
	}

	/**
	 * Decrypts an encrypted sodium_crypto_box payload.
	 *
	 * @since 0.8.0
	 * @since 1.0.0 - Added $nonce and $client_public_key params
	 *
	 * @uses \sodium_crypto_box_keypair_from_secretkey_and_publickey()
	 * @uses \sodium_crypto_box_open()
	 *
	 * @param string $encoded_and_encrypted_payload Base 64-encoded string that needs to be decrypted.
	 * @param string $hex_nonce Single use nonce for a specific Client. Passed as string; needs to be converted to binary. Must be 24 bytes.
	 * @param string $alice_public_key The public key from the Client plugin that generated the envelope.
	 *
	 * @return string|WP_Error If successful the decrypted string (could be a JSON string), otherwise WP_Error.
	 */
	public function decryptCryptoBox( $encoded_and_encrypted_payload, $hex_nonce, $alice_public_key ) {

		if ( ! function_exists( 'sodium_crypto_box_open' ) ) {
			return new WP_Error( 'sodium_not_exists', 'Sodium isn\'t loaded. Upgrade to PHP 7.0 or WordPress 5.2 or higher.' );
		}

		$this->log(
			'Nonce before sodium_hex2bin: ',
			__METHOD__,
			'debug',
			array(
				'hex_nonce' => $hex_nonce,
			)
		);

		$bin_nonce = \sodium_hex2bin( $hex_nonce );

		if ( SODIUM_CRYPTO_BOX_NONCEBYTES !== strlen( $bin_nonce ) ) {
			return new WP_Error( 'nonce_wrong_length', sprintf( 'The nonce must be %d characters. Instead it\'s %d.', SODIUM_CRYPTO_BOX_NONCEBYTES, strlen( $bin_nonce ) ) );
		}

		try {
			$bob_private_key = $this->getPrivateKey();

			if ( is_wp_error( $bob_private_key ) ) {
				return new WP_Error( 'key_error', 'Cannot decrypt: can\'t get private keys from the local DB.', $bob_private_key );
			}

			if ( empty( $encoded_and_encrypted_payload ) ) {
				return new WP_Error( 'data_empty', 'Will not decrypt an empty payload.' );
			}

			$encrypted_payload = base64_decode( $encoded_and_encrypted_payload );

			if ( false === $encrypted_payload ) {
				// Data was not successfully base64_decode'd
				return new WP_Error( 'data_malformated', 'Encrypted data must be base64 encoded.' );
			}

			$bob_private_key    = \sodium_hex2bin( $bob_private_key );
			$alice_public_key   = \sodium_hex2bin( $alice_public_key );
			$crypto_box_keypair = \sodium_crypto_box_keypair_from_secretkey_and_publickey( $bob_private_key, $alice_public_key );
			$decrypted_payload  = \sodium_crypto_box_open( $encrypted_payload, $bin_nonce, $crypto_box_keypair );
			if ( false === $decrypted_payload ) {
				return new WP_Error( 'decryption_failed', 'Decryption failed.' );
			}

			return $decrypted_payload;
		} catch ( \TypeError $e ) {
			return new WP_Error(
				'decryption_failed_typeerror',
				sprintf( 'Error while decrypting envelope: %s (%s)', $e->getMessage(), $e->getCode() )
			);
		} catch ( \SodiumException $e ) {
			return new WP_Error(
				'decryption_failed_sodiumexception',
				sprintf( 'Error while decrypting envelope: %s (%s)', $e->getMessage(), $e->getCode() )
			);
		}
	}

	/**
	 * Returns an pair of values to verify identity.
	 *
	 * This pair acts as a signature, helping to verify that this site is indeed the sender of the data.
	 *
	 * @since 0.8.0
	 *
	 * @return  array|WP_Error  $identity or WP_Error if any issues
	 *    $identity = [
	 *        'nonce'  => (string)  A base64 encoded random string
	 *        'signed' => (string)  The `nonce` encrypted with this site's Private Key, also base64 encoded.
	 *    ]
	 */
	public function createIdentityNonce() {

		$unsigned_nonce = $this->generateNonce();

		if ( is_wp_error( $unsigned_nonce ) ) {
			return $unsigned_nonce;
		}

		$key = $this->getPrivateKey( 'sign_private_key' );

		if ( is_wp_error( $key ) ) {
			return $key;
		}

		$signed_nonce = $this->sign( $unsigned_nonce, $key );

		if ( is_wp_error( $signed_nonce ) ) {
			return $signed_nonce;
		}

		$verified = $this->verifySignature( $signed_nonce, $unsigned_nonce );

		if ( is_wp_error( $verified ) ) {
			return $verified;
		}

		$identity           = array();
		$identity['nonce']  = base64_encode( $unsigned_nonce );
		$identity['signed'] = base64_encode( $signed_nonce );

		return $identity;
	}

	/**
	 * Verifies if signature validates correctly
	 *
	 * @since 1.0.0
	 *
	 * @param string $signed_nonce
	 * @param string $unsigned_nonce
	 *
	 * @return bool|WP_Error  True if signature validates correctly, otherwise false. Returns WP_Error on issue.
	 */
	private function verifySignature( $signed_nonce, $unsigned_nonce ) {

		try {
			$sign_public_key = $this->getPublicKey( 'sign_public_key' );

			if ( is_wp_error( $sign_public_key ) ) {
				return $sign_public_key;
			}

			$message_valid = \sodium_crypto_sign_verify_detached(
				$signed_nonce,
				$unsigned_nonce,
				\sodium_hex2bin( $sign_public_key )
			);
			$this->log(
				'message_valid: ',
				__METHOD__,
				'debug',
				array(
					'message_valid' => $message_valid,
				)
			);

			if ( ! $message_valid ) {
				return new WP_Error( 'signature-failure', 'Signature will not pass verification' );
			}

			return $message_valid;
		} catch ( \SodiumException $e ) {
			return new WP_Error( 'sodium-error', $e->getMessage(), $e );
		} catch ( \TypeError $e ) {
			return new WP_Error( 'sodium-type-error', $e->getMessage(), $e );
		} catch ( \RangeException $e ) {
			return new WP_Error( 'sodium-range-error', $e->getMessage(), $e );
		}
	}

	/**
	 * Generates a cryptographic nonce .
	 *
	 * @since 1.0.0
	 *
	 * @uses \random_bytes()
	 *
	 * @return string|WP_Error  If generated, a nonce. Otherwise a WP_Error.
	 */
	private function generateNonce() {

		if ( ! function_exists( 'sodium_bin2hex' ) ) {
			return new WP_Error( 'sodium_not_exists', 'Sodium isn\'t loaded. Upgrade to PHP 7.0 or WordPress 5.2 or higher.' );
		}

		try {
			return \sodium_bin2hex( \random_bytes( SODIUM_CRYPTO_BOX_NONCEBYTES ) );
		} catch ( \SodiumException $e ) {
			return new WP_Error( 'sodium-error', $e->getMessage() );
		}
	}

	/**
	 * Signs a string using the Signature Private Key provided by the plugin/theme developers' server.
	 *
	 * @since 0.8.0
	 * @since 1.0.0
	 *
	 * @uses \sodium_crypto_sign_detached for signing.
	 *
	 * @param string $data Data to encrypt.
	 * @param string $key Key to use to encrypt the data.
	 *
	 * @return string|WP_Error  Signed value or WP_Error on failure.
	 */
	private function sign( $data, $key ) {

		try {
			if ( empty( $data ) || empty( $key ) ) {
				return new WP_Error( 'no_data', 'No data provided.' );
			}

			if ( ! function_exists( 'sodium_crypto_sign_detached' ) ) {
				return new WP_Error( 'sodium_not_exists', 'Sodium isn\'t loaded. Upgrade to PHP 7.0 or WordPress 5.2 or higher.' );
			}

			$signed = \sodium_crypto_sign_detached( $data, \sodium_hex2bin( $key ) );

			return $signed;
		} catch ( \SodiumException $e ) {
			return new WP_Error( 'sodium-error', $e->getMessage() );
		}
	}

	/**
	 * Resets the encryption keys.
	 *
	 * @return true|WP_Error
	 */
	public function resetKeys() {

		$reset = $this->generateKeys( true );

		if ( is_wp_error( $reset ) ) {
			return $reset;
		}

		return true;
	}

	/**
	 * @param $string
	 *
	 * @return string|WP_Error
	 */
	public static function hash( $string ) {

		if ( ! function_exists( 'sodium_crypto_generichash' ) ) {
			return new WP_Error( 'sodium_crypto_generichash_not_available', 'sodium_crypto_generichash not available' );
		}

		try {
			$hash_bin = sodium_crypto_generichash( $string, '', 16 );
			$hash     = sodium_bin2hex( $hash_bin );
		} catch ( \SodiumException $e ) {
			return new WP_Error(
				'encryption_failed_generichash',
				sprintf( 'Error while generating hash: %s (%s)', $e->getMessage(), $e->getCode() )
			);
		} catch ( \Throwable $e ) {
			return new WP_Error(
				'encryption_failed_generichash_typeerror',
				sprintf( 'Error while generating hash: %s (%s)', $e->getMessage(), $e->getCode() )
			);
		}

		return $hash;
	}
}
