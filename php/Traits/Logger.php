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
	 * @return bool|null True if the message was written to the log file, false if not, null if error logging is disabled.
	 */
	public function log( $message, $method, $logLevel = 'info', $context = array() ) {

		if ( ! trustedlogin_connector()->getSettings()->isErrorLogggingEnabled() ) {
			return null;
		}

		$context  = (array) $context;
		$logLevel = strtolower( is_string( $logLevel ) ? $logLevel : 'info' );
		$message  = "[{$this->getTimestamp()}] [{$logLevel}] {$message}";

		if ( $context ) {
			$message .= ' ' . wp_json_encode( $context, JSON_PRETTY_PRINT );
		}

		$logFileName = $this->getLogFileName();
		$logFileDir  = dirname( $logFileName );

		$wp_filesystem = $this->init_wp_filesystem();

		$this->prevent_directory_browsing( $logFileDir );

		if ( is_wp_error( $wp_filesystem ) ) {
			error_log( $wp_filesystem->get_error_message() );
		}

		// If we're running tests, don't use the WP Filesystem API.
		if ( is_wp_error( $wp_filesystem ) || ( defined( 'DOING_TL_VENDOR_TESTS' ) && DOING_TL_VENDOR_TESTS ) ) {
			// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_touch, WordPress.WP.AlternativeFunctions.file_system_operations_fopen, WordPress.WP.AlternativeFunctions.file_system_operations_fwrite, WordPress.WP.AlternativeFunctions.file_system_operations_fclose

			if ( ! file_exists( $logFileName ) ) {
				wp_mkdir_p( dirname( $logFileName ) ); // Create the directory if it doesn't exist.
				touch( $logFileName );
			}

			$file = fopen( $logFileName, 'a' );

			$file_written = fwrite( $file, $message . "\n" );
			$file_closed  = fclose( $file );

			// phpcs:enable WordPress.WP.AlternativeFunctions.file_system_operations_touch, WordPress.WP.AlternativeFunctions.file_system_operations_fopen, WordPress.WP.AlternativeFunctions.file_system_operations_fwrite, WordPress.WP.AlternativeFunctions.file_system_operations_fclose

			return ( $file_written && $file_closed );
		}

		if ( ! $wp_filesystem->is_dir( $logFileDir ) ) {
			$wp_filesystem->mkdir( $logFileDir, FS_CHMOD_DIR ); // Ensure permission compatibility.
		}

		if ( ! $wp_filesystem->exists( $logFileName ) ) {
			$wp_filesystem->touch( $logFileName );
		}

		// Read existing content and append new message
		$existing_content = $wp_filesystem->get_contents( $logFileName );
		$new_content      = $existing_content . $message . "\n";

		return $wp_filesystem->put_contents( $logFileName, $new_content, FS_CHMOD_FILE );
	}

	/**
	 * Deletes the log file.
	 *
	 * @since 1.1
	 *
	 * @return bool True on success, false on failure.
	 */
	public function deleteLog() {
		$logFileName = $this->getLogFileName();

		$wp_filesystem = $this->init_wp_filesystem();

		if ( is_wp_error( $wp_filesystem ) ) {
			error_log( $wp_filesystem->get_error_message() );
		}

		if ( is_wp_error( $wp_filesystem ) || ( defined( 'DOING_TL_VENDOR_TESTS' ) && DOING_TL_VENDOR_TESTS ) ) {
			return unlink( $logFileName ); // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink -- Using unlink() because it provides a return value.
		}

		return $wp_filesystem->delete( $logFileName );
	}

	/**
	 * Initializes the WordPress filesystem API.
	 *
	 * @since 1.1
	 *
	 * @return \WP_Filesystem_Base|\WP_Error The filesystem object.
	 */
	private function init_wp_filesystem() {
		global $wp_filesystem;

		if ( $wp_filesystem instanceof \WP_Filesystem_Base ) {
			return $wp_filesystem;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';

		$filesystem_initialized = WP_Filesystem();

		if ( ! $filesystem_initialized ) {
			return new \WP_Error( 'failed_wp_filesystem_init', esc_html__( 'TrustedLogin logging failed: unable to initialize WP_Filesystem.', 'trustedlogin-connector' ) );
		}

		return $wp_filesystem;
	}

	/**
	 * Prevent browsing a directory by adding an index.html file to it
	 *
	 * Code inspired by @see wp_privacy_generate_personal_data_export_file()
	 *
	 * @since 1.1.1
	 *
	 * @param string $dirpath Path to directory to protect (in this case, logging).
	 *
	 * @return bool True: File exists or was created; False: file could not be created.
	 */
	private function prevent_directory_browsing( $dirpath ) {

		if ( defined( 'DOING_TL_VENDOR_TESTS' ) && DOING_TL_VENDOR_TESTS ) {
			return false;
		}

		$wp_filesystem = $this->init_wp_filesystem();

		if ( is_wp_error( $wp_filesystem ) ) {
			return false;
		}

		// Protect export folder from browsing.
		$index_pathname = trailingslashit( $dirpath ) . 'index.html';

		if ( $wp_filesystem->exists( $index_pathname ) ) {
			return true;
		}

		$file_created = $wp_filesystem->touch( $index_pathname );

		if ( ! $file_created ) {
			return false;
		}

		$file_content = '<!-- Silence is golden. TrustedLogin is also pretty great. Learn more: https://www.trustedlogin.com/about/easy-and-safe/ -->';

		$file_was_saved = $wp_filesystem->put_contents( $index_pathname, $file_content );

		if ( ! $file_was_saved ) {
			return false;
		}

		return true;
	}

	/**
	 * Formats the message for logging.
	 *
	 * @see https://github.com/katzgrau/KLogger/blob/master/src/Logger.php#L260-L294
	 *
	 * @param string $message The message to log
	 * @param array  $context The context
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

		$this->hash = hash( 'sha256', uniqid( (string) wp_rand(), true ) );

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
		if (
			// @phpstan-ignore-next-line
			( defined( 'TRUSTEDLOGIN_DEBUG' ) && TRUSTEDLOGIN_DEBUG ) ||
			// @phpstan-ignore-next-line
			( defined( 'DOING_TL_VENDOR_TESTS' ) && DOING_TL_VENDOR_TESTS )
		) {
			return dirname( __DIR__, 2 ) . '/trustedlogin-connector.log';
		}

		$hash = $this->getHash();

		// If we are missing a hash, upload to the uploads base directory.
		if ( ! $hash ) {
			error_log( 'TrustedLogin: Unable to get a random hash for the log file.' );

			return trailingslashit( wp_upload_dir()['basedir'] ) . 'trustedlogin-connector.log';
		}

		$upload_dir = wp_upload_dir();

		if ( ! $fullPath ) {
			return '/' . str_replace( ABSPATH, '', $upload_dir['basedir'] . '/' . $this->getLogFileDirectoryName() . '/' . 'vendor-' . $hash . '.log' );
		}

		return wp_normalize_path( trailingslashit( $upload_dir['basedir'] ) . $this->getLogFileDirectoryName() . '/' ) . 'vendor-' . $hash . '.log';
	}
}
