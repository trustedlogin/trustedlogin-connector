<?php

namespace TrustedLogin\Vendor\Webhooks;

use TrustedLogin\Vendor\TeamSettings;
use TrustedLogin\Vendor\AccessKeyLogin;
use TrustedLogin\Vendor\Webhooks\Helpscout;

class Factory {



	const PROVIDER_KEY = 'provider';

	public static function webhook( TeamSettings $teamSettings ) {

		$type = $teamSettings->getHelpdesks()[0];
		switch ( $type ) {
			case 'helpscout':
				return new HelpScout( $teamSettings->getHelpdeskData( $type )['secret'] );
			case 'freescout':
				return new Freescout( $teamSettings->getHelpdeskData( $type )['secret'] );
			default:
				throw new \Exception( 'Unknown webhook type' );
		}
	}

	public static function getProviders() {
		return array(
			'helpscout',
			'freescout',
		);
	}


	/**
	 * Builds a URL for helpdesk request and redirect actions.
	 *
	 * @since 1.0.0
	 *
	 * @param string $action What action the link should do. eg 'support_redirect'.
	 * @param string $account_id What account ID link is for.
	 * @param string $provider Slug of helpdesk
	 * @param string $access_key (Optional) The key for the access being requested.
	 *
	 * @return string|\WP_Error The url with GET variables.
	 */
	public static function actionUrl( $action, $account_id, $provider, $access_key = '' ) {

		if ( empty( $action ) ) {
			return new \WP_Error( 'variable-missing', 'Cannot build helpdesk action URL without a specified action' );
		}

		$args = array(
			AccessKeyLogin::REDIRECT_ENDPOINT     => true,
			'action'                              => $action,
			self::PROVIDER_KEY                    => $provider,
			AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $account_id,
			AccessKeyLogin::NONCE_NAME            => wp_create_nonce( AccessKeyLogin::NONCE_ACTION ),
		);

		if ( $access_key ) {
			$args[ AccessKeyLogin::ACCESS_KEY_INPUT_NAME ] = $access_key;
		}
		foreach ( $args as $key => $value ) {
			$args[ $key ] = urlencode( $value );
		}

		$url = add_query_arg( $args, get_home_url() );
		return $url;
	}
}
