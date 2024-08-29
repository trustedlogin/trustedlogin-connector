<?php

namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\MenuPage;

/**
 * When returning from webhook/helpdesk:
 * Try to validate access key, if valid, return the mini-app.
 */
class ReturnScreen {


	/**
	 * The relative path to the template HTML file.
	 *
	 * @since 1.1
	 */
	const TEMPLATE_RELATIVE_PATH = '/build/index.html';

	/**
	 * @var string The template HTML for the redirection form.
	 */
	protected $template;

	protected $settings;
	public function __construct( SettingsApi $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get the template HTML for the redirection form.
	 *
	 * @since 1.1
	 *
	 * @return string The template HTML, if found. Otherwise, an empty string.
	 */
	private function getTemplate(): string {

		if ( ! empty( $this->template ) ) {
			return $this->template;
		}

		$template_path = dirname( TRUSTEDLOGIN_PLUGIN_FILE ) . self::TEMPLATE_RELATIVE_PATH;

		if ( ! is_readable( $template_path ) ) {
			return '';
		}

		global $wp_filesystem;

		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$this->template = $wp_filesystem->get_contents( $template_path );

		return $this->template;
	}

	/**
	 * Should we attempt to handle this request?
	 *
	 * @return bool
	 */
	public function shouldHandle() {
		return ! empty(
			AccessKeyLogin::fromRequest( true )
		) && ! empty(
			AccessKeyLogin::fromRequest( false )
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

		$html = $this->getTemplate();

		// There is no template, so we cannot continue.
		if ( '' === $html ) {
			wp_die(
				sprintf(
				// translators: %s is the replaced by the error message.
					esc_html__( 'Cannot load TrustedLogin Connector plugin: %s', 'trustedlogin-connector' ),
					esc_html__( 'A required template was not found. Please re-install the plugin.', 'trustedlogin-connector' )
				),
				esc_html__( 'Template not found.', 'trustedlogin-connector' ),
				424
			);
		}

		// Make URLs absolute and correct
		$plugin_dir_url = plugin_dir_url( TRUSTEDLOGIN_PLUGIN_FILE );

		$replacements = array(
			'/tlfavicon.ico'             => $plugin_dir_url . 'build/tlfavicon.ico', // Fix favicon src.
			'/static/js'                 => $plugin_dir_url . 'build/static/js', // Fix script source.
			'/src/trustedlogin-dist.css' => $plugin_dir_url . 'src/trustedlogin-dist.css', // Fix style source.
		);

		// Place the window.tlVendor object in the HTML.
		$replacements['<script></script>'] = '<script>window.tlVendor=' . wp_json_encode( $data ) . ';</script>';

		echo strtr( $html, $replacements ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		exit;
	}
}
