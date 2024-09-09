<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Status\IsIntegrationActive;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Traits\VerifyUser;
use TrustedLogin\Vendor\Webhooks\Factory;
use TrustedLogin\Vendor\Webhooks\Webhook;

/**
 * Checks for support redirect logins and tries to handle them.
 */
class MaybeRedirect {


	use Logger;
	use VerifyUser;

	const REDIRECT_KEY = 'tl_redirect';

	/**
	 * Handle the "Reset All" button in UI
	 *
	 * @uses "admin_init" action
	 */
	public static function adminInit() {

		$action = Helpers::get_post_or_get( 'action' );

		if ( Reset::ACTION_NAME !== $action ) {
			return;
		}

		$nonce = Helpers::get_post_or_get( '_wpnonce', 'sanitize_text_field' );

		if ( ! $nonce || ! wp_verify_nonce( $nonce, Reset::NONCE_ACTION ) ) {
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'  => 'trustedlogin-settings',
						'error' => 'nonce',
					),
					admin_url()
				)
			);
			exit;
		}

		// Reset all data
		( new Reset() )->resetAll(
			\trustedlogin_connector()
		);

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'trustedlogin-settings',
					'success' => 'reset',
				),
				admin_url()
			)
		);
		exit;
	}

	/**
	 * Checks if the specified attributes are set has a valid access_key before checking if we can redirect support agent.
	 *
	 * @uses "template_redirect" action
	 * @since 1.0.0
	 */
	public static function handle() {

		// Access key redirect.
		if ( ! Helpers::get_post_or_get( AccessKeyLogin::REDIRECT_ENDPOINT ) ) {
			return;
		}

		if ( Webhook::WEBHOOK_ACTION === Helpers::get_post_or_get( 'action' ) ) {
			$provider = Helpers::get_post_or_get( Factory::PROVIDER_KEY );

			if ( ! in_array( $provider, Factory::getProviders(), true ) ) {
				return;
			}

			if ( ! IsIntegrationActive::check( $provider ) ) {
				return;
			}

			$accountId = Helpers::get_post_or_get( AccessKeyLogin::ACCOUNT_ID_INPUT_NAME, 'sanitize_text_field' );

			try {
				$team    = SettingsApi::fromSaved()->getByAccountId( $accountId );
				$webhook = Factory::webhook( $team );
				$r       = $webhook->webhookEndpoint();
				if ( 200 === $r['status'] ) {
					wp_send_json( $r );
				} else {
					wp_send_json( $r, $r['status'] );
				}
			} catch ( \Throwable $th ) {
				wp_send_json( array( 'message' => $th->getMessage() ), 404 );
			}
		}

		$handler = new AccessKeyLogin();
		$parts   = $handler->handle();

		if ( is_array( $parts ) ) {
			wp_send_json_success( $parts );
		}

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'  => 'trustedlogin-settings',
					'error' => $parts->get_error_code(),
				),
				admin_url()
			)
		);
		exit;
	}
}
