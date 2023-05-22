<?php

namespace TrustedLogin\Vendor\Webhooks;

use TrustedLogin\Vendor\AccessKeyLogin;

class Helpscout extends Webhook{

    /**
     * Get slug for this webhook.
     *
     * @return string
     */
    public static function getProviderName(){
        return 'helpscout';
    }

    /**
	 * Generates the output for the helpscout widget.
	 *
	 * Checks the `$_SERVER` array for the signature and verifies the source before checking for licenses matching to users email.
	 *
	 * @param array|null $data The data sent to the webhook. If null, php://input is used
	 * @uses self::verify_request()
	 *
	 * @return array
	 */
	public function webhookEndpoint($data = null ) {

		$signature = null;

		if ( isset( $_SERVER['X-HELPSCOUT-SIGNATURE'] ) ) {
			$signature = $_SERVER['X-HELPSCOUT-SIGNATURE'];
		} elseif ( isset( $_SERVER['HTTP_X_HELPSCOUT_SIGNATURE'] ) ) {
			$signature = $_SERVER['HTTP_X_HELPSCOUT_SIGNATURE'];
		} elseif ( function_exists( 'apache_request_headers' ) ) {
			$headers = apache_request_headers();
			if ( isset( $headers['X-HelpScout-Signature'] ) ) {
				$signature = $headers['X-HelpScout-Signature'];
			}
		}

		$data = is_null($data ) ? file_get_contents( 'php://input' ) : $data;

		if ( ! $data || ! $this->verify_request( $data, $signature ) ) {
			$error_text  = '<p class="red">' . esc_html__( 'Unauthorized.', 'trustedlogin-vendor' ) . '</p>';
			$error_text .= '<p>' . esc_html__( 'Verify your site\'s TrustedLogin Settings match the Help Scout widget settings.', 'trustedlogin-vendor' ) . '</p>';
			return [ 'html' => $error_text, 'status' => 403 ];
		}

		$account_id = isset( $_REQUEST[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ] ) ? $_REQUEST[ AccessKeyLogin::ACCOUNT_ID_INPUT_NAME ] : null;

		$data_obj = json_decode( $data, false );

		if( ! $account_id ){
            $error_text  = '<p class="red">' . esc_html__( 'Missing Account ID.', 'trustedlogin-vendor' ) . '</p>';
			$error_text .= '<p>' . esc_html__( 'Verify your site\'s TrustedLogin Settings match the Help Scout widget settings.', 'trustedlogin-vendor' ) . '</p>';
			return [
				'html' => $error_text,
				'status' => 401,
				'message' => 'missing_account_id'
		 	];
        }
		if ( isset( $data_obj->customer->emails ) && is_array( $data_obj->customer->emails ) ) {
			$customer_emails = $data_obj->customer->emails;
		} elseif ( isset( $data_obj->customer->email ) ) {
			$customer_emails = [ $data_obj->customer->email ];
		} else {
			$customer_emails = false;
		}

		if ( is_null( $data_obj ) || ! $customer_emails ) {
			$error_text  = '<p class="red">' . esc_html__( 'Unable to Process.', 'trustedlogin-vendor' ) . '</p>';
			$error_text .= '<p>' . esc_html__( 'The help desk sent corrupted customer data. Please try refreshing the page.', 'trustedlogin-vendor' ) . '</p>';
			return [
				'html' => $error_text,
				'status' =>  400
			];
		}

		$return_html = $this->get_widget_response( $customer_emails,$account_id );

		return [  'html' => $return_html, 'status' => 200 ];

	}

    /**
     * Get HTML for the helpscout widget.
     *
	 * @param array $customer_emails
	 *
	 * @return string
	 */
	protected function get_widget_response( $customer_emails,$account_id ) {

		$licenses = $this->getLicensesByEmails( $customer_emails );

        $saas_api = trustedlogin_vendor()->getApiHandler( $account_id );

		$item_html = '';

		/**
		 * Filter: Allows for changing the html output of the wrapper html elements.
		 *
		 * @param string $html
		 */
		$html_template = apply_filters(
			'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/wrapper',
			'<ul class="c-sb-list c-sb-list--two-line">%1$s</ul>'.
			'<a href="' . esc_url( admin_url( 'admin.php?page=' . AccessKeyLogin::PAGE_SLUG ) ) . '"><i class="icon-gear"></i>' . esc_html__( 'Go to Access Key Log-In', 'trustedlogin-vendor' ) . '</a>'
		);

		/**
		 * Filter: Allows for changing the html output of the individual items html elements.
		 *
		 * @param string $html
		 */
		$item_template = apply_filters(
			'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/item',
			'<li class="c-sb-list-item"><span class="c-sb-list-item__label">%4$s <span class="c-sb-list-item__text"><a href="%1$s" target="_blank" title="%3$s"><i class="icon-pointer"></i> %2$s</a></span></span></li>'
		);

		/**
		 * Filter: Allows for changing the html output of the html elements when no items found.
		 *
		 * @param string $html
		 */
		$no_items_template = apply_filters(
			'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/no-items',
			'<li class="c-sb-list-item">%1$s</li>'
		);

		$endpoint = 'accounts/' . $account_id . '/sites/';
		$method   = 'POST';
		$data     = [ 'searchKeys' => [] ];

		$statuses = [];

		foreach ( $licenses as $license ) {

			// We look up the licenses by their hash, not plaintext
			$license_hash = hash( 'sha256', $license->key );

			if ( ! in_array( $license_hash, $data['searchKeys'], true ) ) {
				$data['searchKeys'][]      = $license_hash;
			}

			$statuses[ $license_hash ] = $license->status;
		}

		if ( ! empty( $data['searchKeys'] ) ) {

			/**
			 * Expected result
			 *
			 * @var array|\WP_Error $response [
			 *   "<license_key>" => [ <secrets> ]
			 * ]
			 */
			$response = $saas_api->call( $endpoint, $data, $method );

			if ( is_wp_error( $response ) ) {
				$item_html = $response->get_error_message();
			} else {
				$this->log( 'Response: ', __METHOD__,[
					'response' => $response
				] );

				if ( is_array( $response ) ) {
					foreach ( $response as $key => $secrets ) {

						if ( ! is_array( $secrets ) ) {
							continue;
						}

						$secrets_reversed = array_reverse( $secrets, true );

						foreach ( $secrets_reversed as $secret ) {

							$url = add_query_arg( [
								AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $account_id,
								AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $key,
							], admin_url( 'admin.php?page=' . AccessKeyLogin::PAGE_SLUG ) );

							$item_html .= sprintf(
								$item_template,
								esc_url( $url ),
								esc_html__( 'Access Website', 'trustedlogin-vendor' ),
								sprintf( esc_html__( 'Access Key: %s', 'trustedlogin-vendor' ), $key ),
								sprintf( esc_html__( 'License is %s', 'trustedlogin-vendor' ), ucwords( esc_html( $statuses[ $key ] ) ) )
							);
						}
					}
				}
			}

			$this->log( 'item_html: ' . $item_html, __METHOD__ );

		} else {
			array_walk($customer_emails,'sanitize_email');
			$this->log( 'No license keys found for email ' . implode(',',$customer_emails), __METHOD__ );

		}

		if ( empty( $item_html ) ) {
			$item_html = sprintf(
				$no_items_template,
				esc_html__( 'No TrustedLogin sessions authorized for this user.', 'trustedlogin-vendor' )
			);
		}

		return sprintf( $html_template, $item_html );
	}

    /**
	 * Verifies the source of the Widget request is from Helpscout
	 *
	 * @since 0.1.0
	 *
	 * @param string $data provided via `PHP://input`.
	 * @param string $signature provided via `$_SERVER` attribute.
	 *
	 * @return bool  if the calculated hash matches the signature provided.
	 */
	public function verify_request( $data, $signature = null ) {
		return hash_equals( $signature, $this->makeSignature(
            is_array($data) ? json_encode($data) : $data
        ) );
	}

}
