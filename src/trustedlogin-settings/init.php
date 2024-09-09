<?php
/**
 * Initialize the TrustedLogin Connector plugin.
 *
 * @package TrustedLogin\Connector
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

use TrustedLogin\Vendor\Status\Onboarding;
use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\AccessKeyLogin;

add_action( 'init', 'initialize_trustedlogin_connector' );

/**
 * Initialize the TrustedLogin Connector plugin.
 *
 * @since 1.3
 */
function initialize_trustedlogin_connector() {

	// Add main menu page.
    new MenuPage(
        //Do not pass args, would make it a child page.
    );

	$hasOnboarded = Onboarding::hasOnboarded();

    /**
     *  Add (sub)menu pages.
     */
    if( $hasOnboarded ){
         //Add settings submenu page
         new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Settings', 'trustedlogin-connector'),
            'settings',
            false
        );

        // Add access key submenu page.
        new MenuPage(
            MenuPage::SLUG_TEAMS,
            __('Teams', 'trustedlogin-connector'),
            'teams',
            false
        );

        // Add helpdesks submenu page.
        new MenuPage(
            MenuPage::SLUG_HELPDESKS,
            __('Help Desks', 'trustedlogin-connector'),
            'integrations',
            false
        );

	    $hasConnectedTeam = SettingsApi::fromSaved()->hasConnectedTeam();

	    if ( $hasConnectedTeam ) {
	        // Add access key submenu page.
	        new MenuPage(
	            MenuPage::SLUG_ACCESS_KEY,
	            __('Access Key Log-In', 'trustedlogin-connector'),
	            'teams/access_key',
	            true
	        );
	    }
    } else {
        // Add onboarding submenu page.
        new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Onboarding', 'trustedlogin-connector'),
            'onboarding',
            false
        );
    }
}

//  Register assets for TrustedLogin Settings.
add_action( 'admin_enqueue_scripts', 'register_trustedlogin_connector_assets' );

/**
 * Register assets for TrustedLogin Settings.
 *
 * @since 1.3
 */
function register_trustedlogin_connector_assets() {

	$adminPageFilePath = '/wpbuild/admin-page-trustedlogin-settings.asset.php';

	/**
	 * Register assets
	 */
	// This needs to be done once, not once per menu.
	if ( ! is_readable( dirname( __FILE__, 3 ) . $adminPageFilePath ) ) {
		return;
	}

	$assets       = include dirname( __FILE__, 3 ) . $adminPageFilePath;
	$jsUrl        = plugins_url( '/wpbuild/admin-page-trustedlogin-settings.js', dirname( __FILE__, 2 ) );
	$cssUrl       = plugins_url( '/trustedlogin-dist.css', dirname( __FILE__, 1 ) );
	$dependencies = $assets['dependencies'];

	wp_register_script(
		MenuPage::ASSET_HANDLE,
		$jsUrl,
		$dependencies,
		$assets['version'],
		false
	);
	$settingsApi = SettingsApi::fromSaved();
	$data        = trustedlogin_connector_prepare_data( $settingsApi );
	$accessKey   = isset( $data[ AccessKeyLogin::ACCESS_KEY_INPUT_NAME ] )
		? sanitize_text_field( $data[ AccessKeyLogin::ACCESS_KEY_INPUT_NAME ] ) : '';
	$accountId   = isset( $data[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ] ) ? sanitize_text_field( $data[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ] ) : '';
	// Check if we can preset redirectData in form.
	if ( ! empty( $accessKey ) && ! empty( $accountId ) ) {
		$handler = new AccessKeyLogin();
		// Check if request is authorized.
		if ( $handler->verifyGrantAccessRequest( false ) ) {
			$parts = $handler->handle( [
				AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
				AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
			] );
			if ( ! is_wp_error( $parts ) ) {
				// Send redirectData to AccessKeyForm.js.
				$data['redirectData'] = $parts;
			}
			// Please do not set $data['redirectData'] otherwise.
		}

	}

	if ( isset( $_GET['error'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$error = sanitize_text_field( wp_unslash( $_GET['error'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		switch ( $error ) {
			case 'nonce':
				$error = __( 'Nonce is invalid', 'trustedlogin-connector' );
				break;
			case AccessKeyLogin::ERROR_NO_ACCOUNT_ID:
				$error = __( 'No account matching that ID found', 'trustedlogin-connector' );
				break;
			case 'invalid_secret_keys':
				$error = __( 'Invalid secret keys', 'trustedlogin-connector' );
				break;

			case AccessKeyLogin::ERROR_NO_SECRET_IDS_FOUND :
				$error = __( 'No secret keys found', 'trustedlogin-connector' );
				break;
			default:
				$error = str_replace( '_', ' ', $error );
				$error = ucwords( $error );
				break;

		}
		$data['errorMessage'] = $error;
	}

	wp_localize_script( MenuPage::ASSET_HANDLE, 'tlVendor', $data );
	wp_register_style(
		MenuPage::ASSET_HANDLE,
		$cssUrl,
		[],
		md5_file( dirname( __FILE__, 2 ) . '/trustedlogin-dist.css' )
	);
}
