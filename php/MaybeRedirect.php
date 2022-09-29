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
class MaybeRedirect
{

	use Logger, VerifyUser;
	const REDIRECT_KEY = 'tl_redirect';

	/**
	 * Handle the "Reset All" button in UI
	 *
	 * @uses "admin_init" action
	 */
	public static function adminInit(){

		if( ! isset($_REQUEST['action']) || Reset::ACTION_NAME !== $_REQUEST['action'] ) {
			return;
		}

		if( ! wp_verify_nonce( $_REQUEST['_wpnonce'], Reset::NONCE_ACTION )){
			wp_safe_redirect(
				add_query_arg( [
					'page' => 'trustedlogin-settings',
					'error' => 'nonce'
				], admin_url() )
			);
			exit;
		}

		//Reset all data
		(new Reset())->resetAll(
			\trustedlogin_vendor()
		);

		wp_safe_redirect(
			add_query_arg( [
				'page' => 'trustedlogin-settings',
				'success' => 'reset'
			], admin_url() )
		);
		exit;
	}

	/**
	 * Checks if the specified attributes are set has a valid access_key before checking if we can redirect support agent.
	 *
	 * @uses "template_redirect" action
	 * @since 1.0.0
	 */
	public static function handle()
	{
		//Access key redirect
		if ( ! isset($_REQUEST[ AccessKeyLogin::REDIRECT_ENDPOINT ])) {
			return;
		}

		if( isset($_REQUEST['action']) && Webhook::WEBHOOK_ACTION == $_REQUEST['action']){
			$provider = $_REQUEST[Factory::PROVIDER_KEY];
			if( ! in_array($provider, Factory::getProviders())){
				//$this->log( 'Unknown provider: ' . $provider,__METHOD__ );
				return;
			}
			if( ! IsIntegrationActive::check($provider)){
				//$this->log( 'Integration not active: ' . $provider,__METHOD__ );
				return;
			}
			$accountId = $_REQUEST[AccessKeyLogin::ACCOUNT_ID_INPUT_NAME];

			try {
				$team  = SettingsApi::fromSaved()->getByAccountId($accountId);
				$webhook = Factory::webhook( $team );
				$r = $webhook->webhookEndpoint();
				if( 200 === $r['status']){
					wp_send_json($r);
				}else{
					wp_send_json($r,$r['status']);
				}
			} catch (\Throwable $th) {
				wp_send_json( ['message' => $th->getMessage()],404);
			}
			exit;
		}

		$handler = new AccessKeyLogin();
		$parts = $handler->handle();

		if( is_array($parts) ){
			wp_send_json_success($parts);
			exit;
		}

		wp_safe_redirect(
			add_query_arg( [
				'page' => 'trustedlogin-settings',
				'error' => $parts->get_error_code()
			], admin_url() )
		);
		exit;
	}
}
