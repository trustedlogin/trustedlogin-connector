<?php
namespace TrustedLogin\Vendor;

/**
 * Create a menu page.
 *
 * Creates parent and child pages.
 */
class MenuPage {

    //@todo make this just "trustedlogin"
    const PARENT_MENU_SLUG= 'trustedlogin-settings';

    const SLUG_ACCESS_KEY = 'trustedlogin_access_key_login';

    const SLUG_TEAMS = 'trustedlogin-teams';

    const SLUG_SETTINGS = 'trustedlogin-settings';

    const SLUG_HELPDESKS = 'trustedlogin-helpdesks';

    const SLUG_CONNECT = 'trustedlogin-connect';


    const ASSET_HANDLE = 'trustedlogin-settings';

    /**
     * ID of root element for React app
     *
     * @var string
     */
    const REACT_ROOT_ID = 'trustedlogin-settings';

     /**
     * @var string
     */
    protected $name;

    /**
     * @var string
     */
    protected $childSlug;

    /**
     * @var string
     */
    protected $initialView;

    /**
     * @param string|null $childSlug Optional slug for the child page. If null, parent page is created.
     * @param string|null $name Optional name for the menu page.
     * @param string|null $initialView Optional, passed to ViewProvider's initialView prop.
     */
    public function __construct( $childSlug = null, $name = null, $initialView = null ) {
        $this->childSlug = $childSlug;
        $this->childName = $name;
        $this->initialView = $initialView;
        add_action('admin_menu', [$this, 'addMenuPage'],25);
        add_action( 'admin_enqueue_scripts',[$this,'enqueueAssets'] );
    }

    /**
     * Check if assets should be enqueued.
     *
     * @param string
     * @return bool
     */
    public function shouldEnqueueAssets($page){

        if ("toplevel_page_" . MenuPage::ASSET_HANDLE == $page) {

            return true;
        }

        if( in_array(
            //trustedlogin_page_trustedlogin_access_key_login
            str_replace( 'trustedlogin_page_', '', $page ), [
            self::SLUG_TEAMS,
            self::SLUG_HELPDESKS,
            self::SLUG_SETTINGS,
            self::SLUG_ACCESS_KEY,
            self::PARENT_MENU_SLUG,
            self::SLUG_CONNECT
        ])){
            return true;
        }
        return false;
    }

    /**
     * @uses "admin_menu"
     */
    public function addMenuPage(){
        $name = $this->childName ?? __('TrustedLogin', 'trustedlogin-vendor');
        if( $this->childSlug ){
            add_submenu_page(
                self::PARENT_MENU_SLUG,
                $name,
                $name,
                'manage_options',
                $this->childSlug,
                [$this, 'renderPage']
            );
        }else{
            //Top level page
            add_menu_page(
                $name,
                $name,
                'manage_options',
                self::PARENT_MENU_SLUG,
                [$this, 'renderPage'],
                'data:image/svg+xml;base64,PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxODAgMjAwIiB2aWV3Qm94PSIwIDAgMTgwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTMzLjYgNzF2LTUuOWguMXYtMjEuNWMwLTI0LTE5LjYtNDMuNi00My42LTQzLjYtMjQuMiAwLTQzLjcgMTkuNi00My43IDQzLjZ2MTMgOC41IDUuOWMtMTIgMS44LTE5LjUgNC4zLTE5LjUgN3Y0OWg1MS42di04LjljMC0yLjMgMS42LTMuMyAzLjYtMi4xbDI1LjYgMTQuOWMyIDEuMiAyIDMgMCA0LjJsLTI1LjYgMTQuOWMtMiAxLjItMy42LjItMy42LTIuMXYtOC45aC01MS42djExLjVjMCAzNC45IDQzIDQ5LjcgNjMuMiA0OS43czYzLjItMTQuOCA2My4yLTQ5Ljd2LTcyLjVjLS4xLTIuNy03LjctNS4yLTE5LjctN3ptLTY4LjYtNy44Yy4xIDAgLjEgMCAwIDBsLjEtMTkuNmMwLTEzLjggMTEuMS0yNC45IDI0LjktMjQuOSAxMy43IDAgMjQuOSAxMS4xIDI0LjkgMjQuOXYxM2gtLjF2MTIuNGMtNy42LS41LTE2LS44LTI0LjgtLjgtOC45IDAtMTcuMy4zLTI1IC44em0yNS4xIDExNmMtMjAuOCAwLTM4LjUtMTMuOS00NC4zLTMyLjhoMTMuNGM1LjMgMTEuOSAxNy4xIDIwLjIgMzAuOSAyMC4yIDE4LjYgMCAzMy43LTE1LjEgMzMuNy0zMy43cy0xNS4xLTMzLjctMzMuNy0zMy43Yy0xMy44IDAtMjUuNiA4LjMtMzAuOSAyMC4yaC0xMy41YzUuOC0xOC45IDIzLjUtMzIuOCA0NC4zLTMyLjggMjUuNiAwIDQ2LjMgMjAuOCA0Ni4zIDQ2LjNzLTIwLjggNDYuMy00Ni4yIDQ2LjN6IiBmaWxsPSIjMDEwMTAxIi8+PC9zdmc+'
            );
        }

    }

    /**
     * @uses "admin_enqueue_scripts"
     */
    public function enqueueAssets($hook){
        //@see https://github.com/trustedlogin/vendor/issues/116
        if (!$this->shouldEnqueueAssets($hook)) {
            return;
        }
        //Remove admin notices added correctly
        //see: https://github.com/trustedlogin/vendor/issues/35
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        if( isset(
            $_REQUEST[MaybeRedirect::REDIRECT_KEY]
        ) ){
            return;
        }
        //Enqueue assets
        wp_enqueue_script(MenuPage::ASSET_HANDLE);
        wp_enqueue_style(MenuPage::ASSET_HANDLE);
    }

    /**
     * Render callback for admin page
     */
    public function renderPage(){
        if( $this->initialView){
            printf(
                '<script>window.tlInitialView = "%s"</script>',
                esc_attr($this->initialView)
            );
        }
        //React root
        printf( '<div id="%s"></div>',self::REACT_ROOT_ID)  ;
    }

}
