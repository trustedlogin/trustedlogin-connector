<?php
/**
 * Plugin Name: TrustedLogin Support Plugin
 * Plugin URI: https://www.trustedlogin.com
 * Description: Authenticate support team members to securely log them in to client sites via TrustedLogin
 * Version: 0.11.0
 * Requires PHP: 7.1
 * Author: Katz Web Services, Inc.
 * Author URI: https://www.trustedlogin.com
 * Text Domain: trustedlogin-vendor
 * License: GPL v2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Copyright: © 2020 Katz Web Services, Inc.
 */

use TrustedLogin\Vendor\ErrorHandler;

if (!defined('ABSPATH')) {
    exit;
}
// Exit if accessed directly

define( 'TRUSTEDLOGIN_PLUGIN_VERSION', '0.11.0' );
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
	add_action( 'template_redirect',[\TrustedLogin\Vendor\MaybeRedirect::class, 'handle']);
	//Handle the "Reset All" button in UI
	add_action( 'admin_init',[\TrustedLogin\Vendor\MaybeRedirect::class, 'adminInit']);


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
 * @return \TrustedLogin\Vendor\Plugin;
 */
function trustedlogin_vendor(){
	/** @var \TrustedLogin\Vendor\Plugin */
	static $trustedlogin_vendor;
	if( ! $trustedlogin_vendor ){
		$trustedlogin_vendor = new \TrustedLogin\Vendor\Plugin(
			new \TrustedLogin\Vendor\Encryption()
		);
	}
	return $trustedlogin_vendor;
}
