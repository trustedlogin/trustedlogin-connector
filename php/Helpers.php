<?php
namespace TrustedLogin\Vendor;

use function wp_unslash;

class Helpers {

	/**
	 * Retrieve a value from $_POST or $_GET with optional sanitization.
	 *
	 * @param string        $key The input name to check for.
	 * @param callable|null $sanitize_callback Optional. The sanitization callback function. Default: null (no sanitization).
	 *
	 * @return mixed|null The value from $_POST or $_GET, or null if not found.
	 */
	static function get_post_or_get( string $key, callable $sanitize_callback = null ) {
		$value = null;

		if ( isset( $_POST[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$value = $_POST[ $key ];  // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		} elseif ( isset( $_GET[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$value = $_GET[ $key ]; // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}

		if ( null === $value ) {
			return null;
		}

		$value = wp_unslash( $value );

		if ( is_callable( $sanitize_callback ) ) {
			$value = call_user_func( $sanitize_callback, $value );
		}

		return $value;
	}
}
