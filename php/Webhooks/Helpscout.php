<?php

namespace TrustedLogin\Vendor\Webhooks;

use TrustedLogin\Vendor\Helpers;
use TrustedLogin\Vendor\AccessKeyLogin;

class Helpscout extends Webhook {


	/**
	 * Get slug for this webhook.
	 *
	 * @return string
	 */
	public static function getProviderName() {
		return 'helpscout';
	}

	/**
	 * Get name for this webhook with capitals.
	 *
	 * @return string
	 */
	public static function getProviderNameCapitalized() {
		return 'HelpScout';
	}

	/**
	 * Generates the output for the Help Scout widget.
	 *
	 * Checks the `$_SERVER` array for the signature and verifies the source before checking for licenses matching to users email.
	 *
	 * @param mixed|null $data The data sent to the webhook. If null, php://input is used.
	 *
	 * @return array The response array.
	 */
	public function webhookEndpoint( $data = null ): array {

		// Get the signature from headers.
		$signature = $this->get_signature_from_headers();

		// If no data was passed in, we grab it from the input.
		$data = is_null( $data ) ? file_get_contents( 'php://input' ) : $data;

		// If there's no data or if the request cannot be verified, we return an error.
		if ( ! $data || ! $this->verify_request( $data, $signature ) ) {
			return $this->build_error_message( 403, 'Unauthorized.', 'Verify your site\'s TrustedLogin Settings match the Help Scout widget settings.' );
		}

		$account_id = Helpers::get_post_or_get( AccessKeyLogin::ACCOUNT_ID_INPUT_NAME, 'sanitize_text_field' );

		// If there's no account_id, we return an error.
		if ( ! $account_id ) {
			return $this->build_error_message( 401, 'Missing Account ID.', 'Verify your site\'s TrustedLogin Settings match the Help Scout widget settings.', 'missing_account_id' );
		}

		// Decode the data from JSON.
		$data_obj = json_decode( $data, false );

		// Extract customer emails from data.
		$customer_emails = $this->extract_customer_emails( $data_obj );

		// If there's no customer email, we return an error.
		if ( ! $customer_emails ) {
			return $this->build_error_message( 400, 'Unable to Process.', 'The help desk sent corrupted customer data. Please try refreshing the page.' );
		}

		// Get response for the widget and return it.
		$return_html = $this->get_widget_response( $customer_emails, (int) $account_id );

		return array(
			'html'   => $return_html,
			'status' => 200,
		);
	}

	/**
	 * Get HTML for the Help Scout widget.
	 *
	 * @param array $customer_emails List of customer emails.
	 * @param int   $account_id Account ID.
	 *
	 * @return string The HTML response.
	 */
	protected function get_widget_response( array $customer_emails, int $account_id ): string {
		// Get licenses by customer emails
		$licenses = $this->getLicensesByEmails( $customer_emails );

		// Get API Handler
		$saas_api = trustedlogin_connector()->getApiHandler( $account_id );

		/**
		 * Filter: Allows for changing the html output of the wrapper html elements.
		 *
		 * @param string $html
		 */
		$html_template = apply_filters(
			'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/wrapper',
			'<ul class="c-sb-list c-sb-list--two-line">%1$s</ul>' .
			'<a href="' . esc_url( admin_url( 'admin.php?page=' . AccessKeyLogin::PAGE_SLUG ) ) . '"><i class="icon-gear"></i>' . esc_html__( 'Go to Access Key Log-In', 'trustedlogin-connector' ) . '</a>'
		);

		/**
		 * @deprecated 1.1
		 */
		$html_template = apply_filters_deprecated( 'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/wrapper', array( $html_template ), '1.1', 'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/wrapper' );

		/**
		 * Filter: Allows for changing the html output of the individual items html elements.
		 *
		 * @param string $html
		 */
		$item_template = apply_filters(
			'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/item',
			'<li class="c-sb-list-item"><span class="c-sb-list-item__label">%4$s <span class="c-sb-list-item__text"><a href="%1$s" target="_blank" title="%3$s"><i class="icon-pointer"></i> %2$s</a></span></span></li>'
		);

		/**
		 * @deprecated 1.1
		 */
		$item_template = apply_filters_deprecated( 'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/item', array( $item_template ), '1.1', 'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/item' );

		/**
		 * Filter: Allows for changing the html output of the html elements when no items found.
		 *
		 * @param string $html
		 */
		$no_items_template = apply_filters(
			'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/no-items',
			'<li class="c-sb-list-item">%1$s</li>'
		);

		/**
		 * @deprecated 1.1
		 */
		$no_items_template = apply_filters_deprecated( 'trustedlogin/vendor/helpdesk/' . $this->getProviderName() . '/template/no-items', array( $no_items_template ), '1.1', 'trustedlogin/connector/helpdesk/' . $this->getProviderName() . '/template/no-items' );

		// Define the API endpoint
		$endpoint = 'accounts/' . $account_id . '/sites/';

		// Prepare search keys for the API call
		$data = $this->prepare_search_keys( $licenses );

		// If there are any search keys, make the API call
		if ( ! empty( $data['searchKeys'] ) ) {

			/**
			 * Expected result
			 *
			 * @var array|\WP_Error $response [
			 *   "<license_key>" => [ <secrets> ]
			 * ]
			 */
			$response = $saas_api->call( $endpoint, $data, 'POST' );

			// If the API call returns an error, get the error message
			if ( true === $response ) {
				$item_html = '';
			} elseif ( is_wp_error( $response ) ) {
				$item_html = $response->get_error_message();
			} else {
				// Generate item HTML for each secret in the response
				$item_html = $this->generate_item_html( (array) $response, $item_template, $data['statuses'], $account_id );
			}

			$this->log( 'item_html: ' . $item_html, __METHOD__ );
		} else {
			array_walk( $customer_emails, 'sanitize_email' );
			$this->log( 'No license keys found for email ' . implode( ',', $customer_emails ), __METHOD__ );
		}

		// If no item HTML was generated, use the no items template
		if ( empty( $item_html ) ) {
			$item_html = sprintf(
				$no_items_template,
				esc_html__( 'No TrustedLogin sessions authorized for this user.', 'trustedlogin-connector' )
			);
		}

		// Return the final HTML response
		return sprintf( $html_template, $item_html );
	}

	/**
	 * Extracts the Help Scout signature from headers.
	 *
	 * @since 0.15.0
	 *
	 * @return string|null The signature or null if not found.
	 */
	private function get_signature_from_headers(): ?string {
		// Create the provider name in uppercase.
		$provider_name = strtoupper( $this->getProviderName() );

		// Get the provider name with capitals.
		$provider_name_capitalized = $this->getProviderNameCapitalized();

		// Check different locations for the signature, return when found.
		if ( isset( $_SERVER[ "X-{$provider_name}-SIGNATURE" ] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER[ "X-{$provider_name}-SIGNATURE" ] ) );
		}

		if ( isset( $_SERVER[ "HTTP_X_{$provider_name}_SIGNATURE" ] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER[ "HTTP_X_{$provider_name}_SIGNATURE" ] ) );
		}

		if ( function_exists( 'apache_request_headers' ) ) {
			$headers = apache_request_headers();

			if ( isset( $headers[ "X-{$provider_name_capitalized}-Signature" ] ) ) {
				return sanitize_text_field( wp_unslash( $headers[ "X-{$provider_name_capitalized}-Signature" ] ) );
			}
		}

		// If we couldn't find the signature, we return null.
		return null;
	}

	/**
	 * Constructs an error response.
	 *
	 * @since 0.15.0
	 *
	 * @param int         $status HTTP status code.
	 * @param string      $errorMessage Error message text.
	 * @param string      $instruction Instruction text for user.
	 * @param string|null $extraMessage Optional extra message.
	 *
	 * @return array An associative array containing the error message.
	 */
	private function build_error_message( int $status, string $errorMessage, string $instruction, ?string $extraMessage = null ): array {
		// Generate the HTML error message.
		$error_text  = '<p class="red">' . esc_html( $errorMessage ) . '</p>';
		$error_text .= '<p>' . esc_html( $instruction ) . '</p>';

		// Prepare the response array.
		$response = array(
			'html'   => $error_text,
			'status' => $status,
		);

		// If there's an extra message, we add it to the response.
		if ( $extraMessage ) {
			$response['message'] = $extraMessage;
		}

		return $response;
	}

	/**
	 * Extracts customer emails from the data object.
	 *
	 * @since 0.15.0
	 *
	 * @param mixed $data_obj Data object.
	 *
	 * @return array|false The emails if found, false otherwise.
	 */
	private function extract_customer_emails( $data_obj ) {
		// Try to extract emails from different parts of the data.
		if ( isset( $data_obj->customer->emails ) && is_array( $data_obj->customer->emails ) ) {
			return $data_obj->customer->emails;
		} elseif ( isset( $data_obj->customer->email ) ) {
			return array( $data_obj->customer->email );
		}

		// If no emails were found, return false.
		return false;
	}

	/**
	 * Prepare search keys for the API call.
	 *
	 * @since 0.15.0
	 *
	 * @param array $licenses {
	 *   List of licenses.
	 *      @type object $license {
	 *          @type string $key License key.
	 *          @type string $status License status.
	 *      }
	 * }
	 *
	 * @return array Array with 'searchKeys' and 'statuses'.
	 */
	private function prepare_search_keys( array $licenses ): array {
		// Initialize the data array and statuses array
		$data     = array( 'searchKeys' => array() );
		$statuses = array();

		// Loop through licenses
		foreach ( $licenses as $license ) {
			// Hash the license key
			$license_hash = hash( 'sha256', $license->key );

			// Add the hashed license key to the searchKeys array if it's not already there
			if ( ! in_array( $license_hash, $data['searchKeys'], true ) ) {
				$data['searchKeys'][] = $license_hash;
			}

			// Add the license status to the statuses array
			$statuses[ $license_hash ] = $license->status;
		}

		// Add the statuses array to the data array
		$data['statuses'] = $statuses;

		// Return the data array
		return $data;
	}

	/**
	 * Generate item HTML for each secret in the response.
	 *
	 * @param array  $response API response.
	 * @param string $item_template Item template.
	 * @param array  $statuses Array of statuses.
	 * @param int    $account_id Account ID.
	 *
	 * @return string Item HTML.
	 */
	private function generate_item_html( array $response, string $item_template, array $statuses, int $account_id ): string {
		// Initialize the item HTML string
		$item_html = '';

		// Loop through the response array
		foreach ( $response as $key => $secrets ) {
			// Continue to the next iteration if the current value is not an array
			if ( ! is_array( $secrets ) ) {
				continue;
			}

			// Reverse the order of the secrets array
			$secrets_reversed = array_reverse( $secrets, true );

			// Loop through the reversed secrets array
			foreach ( $secrets_reversed as $secret ) {
				// Generate a URL with the account ID and access key as query parameters
				$url = add_query_arg(
					array(
						AccessKeyLogin::ACCOUNT_ID_INPUT_NAME => $account_id,
						AccessKeyLogin::ACCESS_KEY_INPUT_NAME => $key,
					),
					admin_url( 'admin.php?page=' . AccessKeyLogin::PAGE_SLUG )
				);

				// Generate the item HTML and append it to the item HTML string
				$item_html .= sprintf(
					$item_template,
					esc_url( $url ),
					esc_html__( 'Access Website', 'trustedlogin-connector' ),
					// translators: %s is replaced with the access key.
					sprintf( esc_html__( 'Access Key: %s', 'trustedlogin-connector' ), $key ),
					// translators: %s is replaced with the license status.
					sprintf( esc_html__( 'License is %s', 'trustedlogin-connector' ), ucwords( esc_html( $statuses[ $key ] ) ) )
				);
			}
		}

		// Return the item HTML string
		return $item_html;
	}

	/**
	 * Verifies the source of the Widget request is from Help Scout
	 *
	 * @since 0.1.0
	 *
	 * @param string $data provided via `PHP://input`.
	 * @param string $signature provided via `$_SERVER` attribute.
	 *
	 * @return bool Whether the calculated hash matches the signature provided.
	 */
	public function verify_request( $data, $signature = null ) {

		if ( ! $signature ) {
			return false;
		}

		return hash_equals(
			$signature,
			$this->makeSignature(
				is_array( $data ) ? wp_json_encode( $data ) : $data
			)
		);
	}
}
