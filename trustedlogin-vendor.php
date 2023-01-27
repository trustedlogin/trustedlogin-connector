<?php
/**
 * Plugin Name: TrustedLogin Support Plugin
 * Plugin URI: https://www.trustedlogin.com
 * Description: Authenticate support team members to securely log them in to client sites via TrustedLogin
 * Version: 0.13.0
 * Requires PHP: 7.1
 * Author: Katz Web Services, Inc.
 * Author URI: https://www.trustedlogin.com
 * Text Domain: trustedlogin-vendor
 * License: GPL v2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Copyright: © 2020 Katz Web Services, Inc.
 */

use TrustedLogin\Vendor\ErrorHandler;
use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\ConnectionService;
use TrustedLogin\Vendor\Encryption;
use TrustedLogin\Vendor\MaybeRedirect;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\ReturnScreen;
use TrustedLogin\Vendor\Services\RemoteSession;
use TrustedLogin\Vendor\SettingsApi;

if (!defined('ABSPATH')) {
    exit;
}
// Exit if accessed directly

define( 'TRUSTEDLOGIN_PLUGIN_VERSION', '0.13.0' );
define( 'TRUSTEDLOGIN_PLUGIN_FILE', __FILE__ );
if( ! defined( 'TRUSTEDLOGIN_API_URL')){
	define( 'TRUSTEDLOGIN_API_URL', 'https://app.trustedlogin.com/api/v1/' );
}
//Set this to true, in wp-config.php to log all PHP errors/warnings/notices to trustedlogin.log
// Code: define( 'TRUSTEDLOGIN_DEBUG', true );
if( ! defined( 'TRUSTEDLOGIN_DEBUG') ){
	define( 'TRUSTEDLOGIN_DEBUG', false );
}


/** @define "$path" "./" */
$path = plugin_dir_path(__FILE__);

/**
 * Initialization plugin
 */
//Set register deactivation hook
register_deactivation_hook( __FILE__, 'trustedlogin_vendor_deactivate' );
//Include files and call trustedlogin_vendor
if( file_exists( $path . 'vendor/autoload.php' ) ){
	include_once $path . 'vendor/autoload.php';
	//Include admin init file
	include_once dirname( __FILE__ ) . '/src/trustedlogin-settings/init.php';

	//Maybe register error handler
	if( TRUSTEDLOGIN_DEBUG ){
		\TrustedLogin\Vendor\ErrorHandler::register();
	}

	//This will initialize the plugin
	$plugin = trustedlogin_vendor();

	/**
	 * Runs when plugin is ready.
	 *
	 * @var TrustedLogin\Vendor\Plugin $plugin
	 */
	do_action( 'trustedlogin_vendor', $plugin );

    //Add REST API endpoints
	add_action( 'rest_api_init', [$plugin, 'restApiInit']);
    //Handle access key login if requests.
	add_action( 'template_redirect',[MaybeRedirect::class, 'handle']);
	//Handle the "Reset All" button in UI
	add_action( 'admin_init',[MaybeRedirect::class, 'adminInit']);
	if( file_exists(__DIR__. "/build/index.html")){
		//Handle webhook/helpdesk return
		add_action( 'admin_init',[
			new ReturnScreen(
				file_get_contents(__DIR__. "/build/index.html"),
				trustedlogin_vendor()->getSettings()
			),
			'callback'
		]);
	}
	add_action( 'admin_init',[ConnectionService::class, 'listen']);
	add_action('admin_init', [RemoteSession::class, 'listen']);

}else{
	throw new \Exception('Autoloader not found.');
}

/**
 * Deactivation function
 */
function trustedlogin_vendor_deactivate() {
	delete_option( 'tl_permalinks_flushed' );
	delete_option( 'trustedlogin_vendor_config' );
}


/**
 * Accesor for main plugin container
 *
 * @return Plugin
 */
function trustedlogin_vendor(){
	/** @var Plugin */
	static $trustedlogin_vendor;
	if( ! $trustedlogin_vendor ){
		$trustedlogin_vendor = new Plugin(
			new Encryption()
		);
	}
	return $trustedlogin_vendor;
}


/**
 * Get data to set window.tlVendor in client with
 */
function trusted_login_vendor_prepare_data(SettingsApi $settingsApi,$initalView = null){

	$accessKey = AccessKeyLogin::fromRequest(true);
	$accountId = AccessKeyLogin::fromRequest(false);
	$connectTokens = ConnectionService::savedTokens();
	$exchangeToken = ConnectionService::savedExchangeToken();
	$connectNonce = ConnectionService::makeNonce();
	$data = [
		'resetAction' => esc_url_raw(\TrustedLogin\Vendor\Reset::actionUrl()),
		'roles' => wp_roles()->get_names(),
		'onboarding' => \TrustedLogin\Vendor\Status\Onboarding::hasOnboarded() ? 'COMPLETE' : '0',
		'accessKey' => [
			AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
			AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
			AccessKeyLogin::REDIRECT_ENDPOINT => true,
			'action'   => AccessKeyLogin::ACCESS_KEY_ACTION_NAME,
			\TrustedLogin\Vendor\Webhooks\Factory::PROVIDER_KEY => 'helpscout',
			AccessKeyLogin::NONCE_NAME => wp_create_nonce( AccessKeyLogin::NONCE_ACTION ),
		],
		'settings' => $settingsApi->toResponseData(),
		'connect' => [
			'login' => esc_url_raw(
				add_query_arg(
					'redirect',
					urlencode(ConnectionService::makeCallbackUrl($connectNonce)),
					sprintf('https://php8.trustedlogin.dev/connect/%s', $connectNonce)
				)
			),
			'exchangeToken' => $exchangeToken,
			'tokens' => $connectTokens,
			'callback' => esc_url_raw(
				ConnectionService::makeCallbackUrl()
			),
			'exchange' => ConnectionService::getExchangeRoute(),
		]
	];

	//Check if we can preset redirectData in form
	if( ! empty($accessKey) && ! empty($accountId) ){
		$handler = new AccessKeyLogin();
		//Check if request is authorized
		if( $handler->verifyGrantAccessRequest(false) ){
			$parts = $handler->handle([
				AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
				AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
			]);
			if( ! is_wp_error($parts) ){
				//Send redirectData to AccessKeyForm.js
				$data['redirectData'] = $parts;
			}
			//Please do not set $data['redirectData'] otherwise.
		}

	}

	//Add data by intialView
	//This is new, need to use this for more views
	if( in_array($initalView, ['session','teams','account'])){
		$service = new RemoteSession(trustedlogin_vendor());
		$data['session'] = $service->toArray();
		$service = new RemoteSession(trustedlogin_vendor());
		$data['hasToken'] = $service->hasAppToken();
		setcookie( 'tl_test2', 'tl_test_value2', 600000 + time(), COOKIEPATH, COOKIE_DOMAIN, true, true );
	}

	return $data;
}
