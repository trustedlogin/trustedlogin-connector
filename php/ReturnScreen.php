<?php

namespace TrustedLogin\Vendor;
use TrustedLogin\Vendor\MenuPage;

/**
 * When returning from webhook/helpdesk:
 * Try to validate access key, if valid, return the mini-app.
 */
class ReturnScreen {
    protected $template;
    protected $settings;
    public function __construct(string $template,SettingsApi $settings){
        $this->template = $template;
        $this->settings = $settings;
    }

    /**
     * Should we attempt to handle this request?
     *
     * @return bool
     */
    public function shouldHandle(){
        return ! empty(
            AccessKeyLogin::fromRequest(true)
        ) && ! empty(
            AccessKeyLogin::fromRequest(false)
        );
    }
    /**
     * Return the HTML for the return screen.
     *
     * @uses "admin_init"
     */
    public function callback() {
	    if ( ! $this->shouldHandle() ) {
		    return;
	    }

	    $data = trustedlogin_connector_prepare_data( $this->settings );

	    if ( ! isset( $data['redirectData'] ) ) {
		    return;
	    }

	    $html = $this->template;

	    //Put window.tlVendor in the HTML.
	    $html = str_replace(
		    '<script></script>',
		    sprintf( '<script>window.tlVendor=%s;</script>', wp_json_encode( $data ) ),
		    $html
	    );

	    //Make URLs absolute and correct
	    $plugin_dir_url = plugin_dir_url( TRUSTEDLOGIN_PLUGIN_FILE );

	    $replacements = [
		    '/tlfavicon.ico'             => $plugin_dir_url . 'build/tlfavicon.ico', // Fix favicon src
		    '/static/js'                 => $plugin_dir_url . 'build/static/js', // Fix script source
		    '/src/trustedlogin-dist.css' => $plugin_dir_url . 'src/trustedlogin-dist.css', // Fix style source
	    ];

	    echo strtr( $html, $replacements ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

	    exit;
    }

}
