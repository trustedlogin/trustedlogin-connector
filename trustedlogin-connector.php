<?php
/**
 * Plugin Name: TrustedLogin Connector
 * Description: Authenticate support team members to securely log them in to client sites via TrustedLogin
 * Version: 1.2.1
 * Requires PHP: 7.2
 * Author: TrustedLogin
 * Author URI: https://www.trustedlogin.com
 * Text Domain: trustedlogin-connector
 * License: GPL v2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Copyright: © 2020 Katz Web Services, Inc.
 */

use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\Reset;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\Status\Onboarding;
use TrustedLogin\Vendor\Webhooks\Factory;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

define( 'TRUSTEDLOGIN_PLUGIN_VERSION', '1.2.1' );
define( 'TRUSTEDLOGIN_PLUGIN_FILE', __FILE__ );

if ( ! defined( 'TRUSTEDLOGIN_API_URL' ) ) {
	define( 'TRUSTEDLOGIN_API_URL', 'https://app.trustedlogin.com/api/v1/' );
}

// Set this to true, in wp-config.php to log all PHP errors/warnings/notices to trustedlogin.log
// Code: define( 'TRUSTEDLOGIN_DEBUG', true );
if ( ! defined( 'TRUSTEDLOGIN_DEBUG' ) ) {
	define( 'TRUSTEDLOGIN_DEBUG', null );
}


/** @define "$path" "./" */
$path = plugin_dir_path( __FILE__ );

/**
 * Initialization plugin
 */
// Set register deactivation hook
register_deactivation_hook( __FILE__, 'trustedlogin_connector_deactivate' );
// Include files and call trustedlogin_connector() function.
if ( is_readable( $path . 'vendor/autoload.php' ) ) {
	include_once $path . 'vendor/autoload.php';
	// Include admin init file
	include_once __DIR__ . '/src/trustedlogin-settings/init.php';

	// This will initialize the plugin
	$plugin = trustedlogin_connector();

	// Maybe register error handler
	// @phpstan-ignore-next-line
	if ( TRUSTEDLOGIN_DEBUG || $plugin->getSettings()->isErrorLogggingEnabled() ) {
		\TrustedLogin\Vendor\ErrorHandler::register();
	}

	/**
	 * Runs when plugin is ready.
	 *
	 * @deprecated 1.1 Use "trustedlogin_connector" action instead.
	 *
	 * @param TrustedLogin\Vendor\Plugin $plugin
	 */
	do_action_deprecated( 'trustedlogin_vendor', array( $plugin ), '1.1', 'trustedlogin_connector' );

	/**
	 * Runs when plugin is ready.
	 *
	 * @since 1.1
	 *
	 * @param TrustedLogin\Vendor\Plugin $plugin
	 */
	do_action( 'trustedlogin_connector', $plugin );

	// Add REST API endpoints
	add_action( 'rest_api_init', array( $plugin, 'restApiInit' ) );

	// Handle access key login if requests.
	add_action( 'template_redirect', array( \TrustedLogin\Vendor\MaybeRedirect::class, 'handle' ) );

	// Handle the "Reset All" button in UI
	add_action( 'admin_init', array( \TrustedLogin\Vendor\MaybeRedirect::class, 'adminInit' ) );

	$return_screen = new \TrustedLogin\Vendor\ReturnScreen(
		trustedlogin_connector()->getSettings()
	);

	/**
	 * Handle the request to log in to client sites from help desks.
	 *
	 * This request will be validated by {@see \TrustedLogin\Vendor\ReturnScreen::shouldHandle()}.
	 *
	 * The reason for this is to not pass any details about the  all GET parameters from the URL.
	 */
	add_action( 'admin_init', array( $return_screen, 'callback' ) );
} else {
	error_log(
		sprintf(
		// translators: %s is the error message.
			esc_html__( 'Cannot load TrustedLogin Connector plugin: %s', 'trustedlogin-connector' ),
			esc_html__( 'Autoloader not found.', 'trustedlogin-connector' )
		)
	);

	return;
}

/**
 * Deactivation function.
 *
 * @since 1.1
 * @return void
 */
function trustedlogin_connector_deactivate() {
	delete_option( 'tl_permalinks_flushed' );
	delete_option( 'trustedlogin_vendor_config' );
}

/**
 * Deactivation function.
 *
 * @deprecated 1.1 Use {@see trustedlogin_connector_deactivate()} instead.
 */
function trustedlogin_vendor_deactivate() {
	_deprecated_function( __FUNCTION__, '1.1', 'trustedlogin_connector_deactivate' );
	trustedlogin_connector_deactivate();
}


/**
 * Accessor for main plugin container.
 *
 * @return \TrustedLogin\Vendor\Plugin;
 */
function trustedlogin_connector() {
	/** @var \TrustedLogin\Vendor\Plugin */
	static $trustedlogin_connector;

	if ( $trustedlogin_connector ) {
		return $trustedlogin_connector;
	}

	$trustedlogin_connector = new \TrustedLogin\Vendor\Plugin(
		new \TrustedLogin\Vendor\Encryption()
	);

	return $trustedlogin_connector;
}

/**
 * Accessor for main plugin container.
 *
 * @deprecated 1.1 Use {@see trustedlogin_connector()} instead.
 *
 * @return \TrustedLogin\Vendor\Plugin;
 */
function trustedlogin_vendor() {
	_deprecated_function( __FUNCTION__, '1.1', 'trustedlogin_connector()' );

	return trustedlogin_connector();
}

/**
 * Get data to set window.tlVendor object in the dashboard.
 *
 * @since 1.1.0
 *
 * @param SettingsApi $settingsApi
 *
 * @return array
 */
function trustedlogin_connector_prepare_data( SettingsApi $settingsApi ) {
	$accessKey = AccessKeyLogin::fromRequest( true );
	$accountId = AccessKeyLogin::fromRequest( false );
	$helpdesk  = $settingsApi->toArray()['teams'][0]['helpdesk'][0] ?? 'helpscout';

	$data = array(
		'resetAction'   => esc_url_raw( Reset::actionUrl() ),
		'roles'         => wp_roles()->get_names(),
		'onboarding'    => Onboarding::hasOnboarded() ? 'COMPLETE' : '0',
		'accessKey'     => array(
			AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
			AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
			AccessKeyLogin::REDIRECT_ENDPOINT     => true,
			'action'                              => AccessKeyLogin::ACCESS_KEY_ACTION_NAME,
			Factory::PROVIDER_KEY                 => $helpdesk,
			AccessKeyLogin::NONCE_NAME            => wp_create_nonce( AccessKeyLogin::NONCE_ACTION ),
		),
		'settings'      => $settingsApi->toResponseData(),
		/** @see https://github.com/trustedlogin/trustedlogin-connector/issues/131 Pass full log path to the app. */
		'log_file_name' => trustedlogin_connector()->getLogFileName( false ),
	);

	// Check if we can preset redirectData in form
	if ( ! empty( $accessKey ) && ! empty( $accountId ) ) {
		$handler = new AccessKeyLogin();
		// Check if request is authorized
		if ( $handler->verifyGrantAccessRequest( false ) ) {
			$parts = $handler->handle(
				array(
					AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
					AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
				)
			);
			if ( ! is_wp_error( $parts ) ) {
				// Send redirectData to AccessKeyForm.js
				$data['redirectData'] = $parts;
			}
			// Please do not set $data['redirectData'] otherwise.
		}
	}

	return $data;
}

/**
 * @deprecated 1.1 Use {@see trustedlogin_connector_prepare_data()} instead.
 *
 * @param SettingsApi $settingsApi
 *
 * @return array
 */
function trusted_login_vendor_prepare_data( SettingsApi $settingsApi ) {
	_deprecated_function( __FUNCTION__, '1.1', 'trustedlogin_connector_prepare_data()' );

	return trustedlogin_connector_prepare_data( $settingsApi );
}
