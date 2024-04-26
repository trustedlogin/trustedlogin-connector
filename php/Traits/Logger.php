<?php

namespace TrustedLogin\Vendor\Traits;

use DateTime;
use TrustedLogin\Vendor\SettingsApi;

trait Logger {

	/**
	 * The random hash used for log location
	 *
	 * @var string
	 */
	private $hash;

	/**
	 * Logs a message to a file using the WordPress Filesystem API.
	 *
	 * Call using `trustedlogin_connector()->log( 'message', __METHOD__ );`
	 *
	 * @param string $message  The message to log.
	 * @param string $method   The method issuing the log call.
	 * @param string $logLevel The log level (e.g., 'info', 'warning', etc.).
	 * @param array  $context  Additional context to log with the message.
	 *
	 * @return void
	 */
	public function log( $message, $method, $logLevel = 'info', $context = [] ) {
		$context  = (array) $context;
		$logLevel = strtolower( is_string( $logLevel ) ? $logLevel : 'info' );
		$message  = "[{$this->getTimestamp()}] [{$logLevel}] {$message}";

		if ( $context ) {
			$message .= ' ' . wp_json_encode( $context, JSON_PRETTY_PRINT );
		}

		$logFileName   = $this->getLogFileName();
		$logFileDir    = dirname( $logFileName );
		$wp_filesystem = $this->init_wp_filesystem();

		if ( ! $wp_filesystem->is_dir( $logFileDir ) ) {
			$wp_filesystem->mkdir( $logFileDir, FS_CHMOD_DIR ); // Ensure permission compatibility.
		}

		if ( ! $wp_filesystem->exists( $logFileName ) ) {
			$wp_filesystem->touch( $logFileName );
		}

		// Read existing content and append new message
		$existing_content = $wp_filesystem->get_contents( $logFileName );
		$new_content      = $existing_content . $message . "\n";
		$wp_filesystem->put_contents( $logFileName, $new_content, FS_CHMOD_FILE );
	}

	/**
	 * Initializes the WordPress filesystem API.
	 *
	 * @since 1.1
	 *
	 * @return \WP_Filesystem_Base The filesystem object.
	 */
	private function init_wp_filesystem() {
		global $wp_filesystem;

		if ( ! $wp_filesystem ) {
			require_once( ABSPATH . 'wp-admin/includes/file.php' );
			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	/**
	 * Formats the message for logging.
	 *
	 * @see https://github.com/katzgrau/KLogger/blob/master/src/Logger.php#L260-L294
	 *
	 * @param string $message The message to log
	 * @param array $context The context
	 *
	 * @param string $level The Log Level of the message
	 *
	 * @return string
	 */
	protected function formatMessage( $level, $message, $context ) {
		$message = "[{$this->getTimestamp()}] [{$level}] {$message}";
		if ( $context ) {
			$message .= ' ' . wp_json_encode( $context, JSON_PRETTY_PRINT );
		}

		return $message . PHP_EOL;

	}

	/**
	 * Gets the correctly formatted Date/Time for the log entry.
	 *
	 * PHP DateTime is dump, and you have to resort to trickery to get microseconds
	 * to work correctly, so here it is.
	 *
	 * @see https://github.com/katzgrau/KLogger/blob/master/src/Logger.php#L296-L311
	 *
	 * @return string
	 */
	private function getTimestamp() {
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
		$originalTime = microtime( true );
		$micro        = sprintf( '%06d', ( $originalTime - floor( $originalTime ) ) * 1000000 );
		$date         = new DateTime( gmdate( 'Y-m-d H:i:s.' . $micro, (int) $originalTime ) );

		return $date->format( 'Y-m-d H:i:s' );
	}

	/**
	 * Returns a random hash for the log file.
	 *
	 * @return string Random hash.
	 */
	private function getHash() {

		if ( $this->hash ) {
			return $this->hash;
		}

		$hash = get_option( SettingsApi::LOG_LOCATION_SETTING_NAME, false );

		if ( $hash ) {
			$this->hash = $hash;

			return $hash;
		}

		$this->hash = hash( 'sha256', uniqid( wp_rand(), true ) );

		update_option( SettingsApi::LOG_LOCATION_SETTING_NAME, $this->hash );

		return $this->hash;
	}

	/**
	 * Returns the directory name where the log file.
	 *
	 * @since 0.14.0
	 * @return string
	 */
	private function getLogFileDirectoryName() {
		return 'trustedlogin-logs';
	}

	/**
	 * Get full path to the error log file.
	 *
	 * @see https://github.com/trustedlogin/vendor/issues/83
	 * @return string
	 */
	public function getLogFileName( $fullPath = true ) {

		// Use plugin dir in development.
		if ( ( defined( 'TRUSTEDLOGIN_DEBUG' ) && TRUSTEDLOGIN_DEBUG ) || ( defined( 'DOING_TL_VENDOR_TESTS' ) && DOING_TL_VENDOR_TESTS ) ) {
			return dirname( __FILE__, 3 ) . '/trustedlogin-vendor.log';
		}

		$hash = $this->getHash();

		// If we have a hash, use it.
		if ( ! $hash ) {
			error_log( 'TrustedLogin: Unable to get a random hash for the log file.' );

			return dirname( __FILE__, 3 ) . '/trustedlogin-vendor.log';
		}

		$upload_dir = wp_upload_dir();

		if ( ! $fullPath ) {
			return '/' . str_replace( ABSPATH, '', $upload_dir['basedir'] . '/' . $this->getLogFileDirectoryName() . '/' . 'vendor-' . $hash . '.log' );
		}

		return wp_normalize_path( trailingslashit( $upload_dir['basedir'] ) . $this->getLogFileDirectoryName() . '/' ) . 'vendor-' . $hash . '.log';
	}

}
