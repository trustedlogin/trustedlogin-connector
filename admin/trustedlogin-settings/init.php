<?php
//Register assets for TrustedLogin Settings

use TrustedLogin\Vendor\Status\Onboarding;
use TrustedLogin\Vendor\Reset;
use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\Webhooks\Factory;

add_action('init', function () {
    $hasOnboarded = Onboarding::hasOnboarded();
    /**
     * Register assets
     */
    // This needs to be done once, not once per menu.
    if( file_exists(dirname(__FILE__, 3). "/build/admin-page-trustedlogin-settings.asset.php" ) ){
        $assets = include dirname(__FILE__, 3). "/build/admin-page-trustedlogin-settings.asset.php";
        $dependencies = $assets['dependencies'];
        wp_register_script(
            MenuPage::ASSET_HANDLE,
            plugins_url("/build/admin-page-trustedlogin-settings.js", dirname(__FILE__, 2)),
            $dependencies,
            $assets['version']
        );
        $settingsApi = SettingsApi::fromSaved();

        $accessKey = isset($_REQUEST[AccessKeyLogin::ACCESS_KEY_INPUT_NAME])
            ? sanitize_text_field($_REQUEST[AccessKeyLogin::ACCESS_KEY_INPUT_NAME]) : '';
        $accountId = isset($_REQUEST[AccessKeyLogin::ACCOUNT_ID_INPUT_NAME]) ? sanitize_text_field($_REQUEST[AccessKeyLogin::ACCOUNT_ID_INPUT_NAME]) : '';

        $data = [
            'resetAction' => esc_url_raw(Reset::actionUrl()),
            'roles' => wp_roles()->get_names(),
            'onboarding' => Onboarding::hasOnboarded() ? 'COMPLETE' : '0',
            'accessKey' => [
                AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $accountId,
                AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $accessKey,
                AccessKeyLogin::REDIRECT_ENDPOINT => true,
                'action'   => AccessKeyLogin::ACCESS_KEY_ACTION_NAME,
                Factory::PROVIDER_KEY => 'helpscout',
                AccessKeyLogin::NONCE_NAME => wp_create_nonce( AccessKeyLogin::NONCE_ACTION ),
            ],
            'settings' => $settingsApi->toResponseData(),
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

        if( isset($_GET['error'])){
            $error = sanitize_text_field($_GET['error']);
            switch($error){
                case 'nonce':
                    $error = __('Nonce is invalid', 'trustedlogin-vendor');
                break;
            }
            $data['errorMessage'] = $error;
        }

        wp_localize_script(MenuPage::ASSET_HANDLE,'tlVendor', $data);
        wp_register_style(
            MenuPage::ASSET_HANDLE,
            plugins_url("/trustedlogin-dist.css", dirname(__FILE__, 1)),
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
            'settings'
        );

        //Add access key submenu page
        new MenuPage(
            MenuPage::SLUG_TEAMS,
            __('Teams', 'trustedlogin-vendor'),
            'teams'
        );

        //Add helpdesks submenu page
        new MenuPage(
            MenuPage::SLUG_HELPDESKS,
            __('Help Desks', 'trustedlogin-vendor'),
            'integrations'
        );

        //Add access key submenu page
        new MenuPage(
            MenuPage::SLUG_ACCESS_KEY,
            __('Access Key Log-In', 'trustedlogin-vendor'),
            'teams/access_key'
        );
    }else{
        //Add onboarding submenu page
        new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Onboarding', 'trustedlogin-vendor'),
            'onboarding'
        );
    }

});
