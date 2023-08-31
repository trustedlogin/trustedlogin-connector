<?php
//Register assets for TrustedLogin Settings

use TrustedLogin\Vendor\Status\Onboarding;
use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\AccessKeyLogin;

add_action('init', function () {
    $hasOnboarded = Onboarding::hasOnboarded();
	$settings = SettingsApi::fromSaved();
	$hasConnectedTeam = $settings->hasConnectedTeam();

    /**
     * Register assets
     */
    // This needs to be done once, not once per menu.
    if( file_exists(dirname(__FILE__, 3). "/wpbuild/admin-page-trustedlogin-settings.asset.php" ) ){
        $assets = include dirname(__FILE__, 3). "/wpbuild/admin-page-trustedlogin-settings.asset.php";
        $jsUrl = plugins_url("/wpbuild/admin-page-trustedlogin-settings.js", dirname(__FILE__, 2));
        $cssUrl = plugins_url("/trustedlogin-dist.css", dirname(__FILE__, 1));
        $dependencies = $assets['dependencies'];

        wp_register_script(
            MenuPage::ASSET_HANDLE,
            $jsUrl,
            $dependencies,
            $assets['version']
        );
        $settingsApi = SettingsApi::fromSaved();
        $data = trusted_login_vendor_prepare_data($settingsApi);
        $accessKey = isset($data[AccessKeyLogin::ACCESS_KEY_INPUT_NAME])
        ? sanitize_text_field($data[AccessKeyLogin::ACCESS_KEY_INPUT_NAME]) : '';
        $accountId = isset($data[AccessKeyLogin::ACCOUNT_ID_INPUT_NAME]) ? sanitize_text_field($data[AccessKeyLogin::ACCOUNT_ID_INPUT_NAME]) : '';
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

        if( isset($_GET['error'])){
            $error = sanitize_text_field($_GET['error']);
            switch($error){
                case 'nonce':
                    $error = __('Nonce is invalid', 'trustedlogin-vendor');
                break;
                case AccessKeyLogin::ERROR_NO_ACCOUNT_ID:
                    $error = __('No account matching that ID found', 'trustedlogin-vendor');
                    break;
                case 'invalid_secret_keys':
                    $error = __('Invalid secret keys', 'trustedlogin-vendor');
                    break;

                case AccessKeyLogin::ERROR_NO_SECRET_IDS_FOUND :
                    $error = __('No secret keys found', 'trustedlogin-vendor');
                    break;
                default:
                    $error = str_replace('_', ' ', $error);
                    $error = ucwords($error);
                    break;

            }
            $data['errorMessage'] = $error;
        }

        wp_localize_script(MenuPage::ASSET_HANDLE,'tlVendor', $data);
        wp_register_style(
            MenuPage::ASSET_HANDLE,
            $cssUrl,
            [],
            md5_file(dirname(__FILE__, 2)."/trustedlogin-dist.css")
        );


    }

    // Add main menu page
    new MenuPage(
        //Do not pass args, would make it a child page.
    );

    /**
     * Add (sub)menu pages
     */
    if( $hasOnboarded ){
         //Add settings submenu page
         new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Settings', 'trustedlogin-vendor'),
            'settings',
            false
        );

        //Add access key submenu page
        new MenuPage(
            MenuPage::SLUG_TEAMS,
            __('Teams', 'trustedlogin-vendor'),
            'teams',
            false
        );

        //Add helpdesks submenu page
        new MenuPage(
            MenuPage::SLUG_HELPDESKS,
            __('Help Desks', 'trustedlogin-vendor'),
            'integrations',
            false
        );

	    if ( $hasConnectedTeam ) {
	        //Add access key submenu page
	        new MenuPage(
	            MenuPage::SLUG_ACCESS_KEY,
	            __('Access Key Log-In', 'trustedlogin-vendor'),
	            'teams/access_key',
	            true
	        );
	    }
    } else {
        //Add onboarding submenu page
        new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Onboarding', 'trustedlogin-vendor'),
            'onboarding',
            false
        );
    }

});
