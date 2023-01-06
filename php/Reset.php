<?php
namespace TrustedLogin\Vendor;
use TrustedLogin\Vendor\Status\Onboarding;

class Reset {


    const ACTION_NAME = 'tl_reset';

    const NONCE_ACTION = 'tl_reset_nonce';

    /**
     * Clear ALL data added by Trusted Login
     *
     * @param Plugin $plugin
     * @return Plugin
     */
    public function resetAll(Plugin $plugin){
       $plugin->getSettings()->reset()->save();
       Onboarding::reset();
       ConnectionService::deleteSavedTokens();
       $plugin->getEncryption()->deleteKeys();
       return $plugin;
    }

    /**
     * Get URL for resetting all data
     *
     * @return string
     */
    public static function actionUrl(){
        return add_query_arg(
            [
                'action' => self::ACTION_NAME,
                '_wpnonce' => wp_create_nonce(self::NONCE_ACTION),
                'page' => MenuPage::PARENT_MENU_SLUG
            ],
            admin_url( 'admin.php')
        );
    }
}
