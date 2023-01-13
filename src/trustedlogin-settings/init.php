<?php
//Register assets for TrustedLogin Settings

use TrustedLogin\Vendor\Status\Onboarding;
use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\AccessKeyLogin;


add_action('init', function () {
    $hasOnboarded = Onboarding::hasOnboarded();
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
    //Add connect always for now
    //@todo: Only add if not connected
    new MenuPage(
        MenuPage::SLUG_CONNECT,
        __('Connect', 'trustedlogin-vendor'),
        'connect'
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

        //Activity log
        new MenuPage(
            MenuPage::SLUG_ACTIVITY_LOG,
            __('Activity Log', 'trustedlogin-vendor'),
            'activity_log'
        );

        //Account page
        new MenuPage(
            MenuPage::SLUG_ACCOUNT,
            __('Account', 'trustedlogin-vendor'),
            'account'
        );
    }else{
        //Getting Started
          new MenuPage(
            MenuPage::SLUG_GETTING_STARTED,
            __('Getting Started', 'trustedlogin-vendor'),
            'getting_started'
        );
        //Add onboarding submenu page
        new MenuPage(
            MenuPage::SLUG_SETTINGS,
            __('Onboarding', 'trustedlogin-vendor'),
            'onboarding'
        );

    }
    //session page
    new MenuPage(
        MenuPage::SLUG_SESSION,
        __('Login or Logout', 'trustedlogin-vendor'),
        'session'
    );

});
