<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Contracts\SendsApiRequests as ApiSend;
use TrustedLogin\Vendor\Endpoints\SignatureKey;
use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\TeamSettings;

class Plugin {

	use Logger;

	/**
	 * @var Encryption
	 */
	protected $encryption;

	/**
	 * @var ApiSend
	 */
	protected $apiSender;

	/**
	 * @var SettingsApi
	 */
	protected $settings;

	/**
	 * @param Encryption $encryption
	 */
	public function __construct( Encryption $encryption ) {
		$this->encryption = $encryption;
		$this->apiSender  = new \TrustedLogin\Vendor\ApiSend();
		$this->settings   = SettingsApi::fromSaved();
	}



	/**
	 * Add REST API endpoints
	 *
	 * @uses "rest_api_init" action
	 */
	public function restApiInit() {
		( new \TrustedLogin\Vendor\Endpoints\Settings() )
			->register( true );
		( new \TrustedLogin\Vendor\Endpoints\GlobalSettings() )
			->register( true );
		( new \TrustedLogin\Vendor\Endpoints\ResetTeam() )
			->register( true, false );
		( new \TrustedLogin\Vendor\Endpoints\PublicKey() )
			->register( false );
		( new SignatureKey() )
			->register( false );
		( new \TrustedLogin\Vendor\Endpoints\ResetEncryption() )
			->register( true, false );
		( new \TrustedLogin\Vendor\Endpoints\AccessKey() )
			->register( true, false );
		( new \TrustedLogin\Vendor\Endpoints\Logging() )
			->register( true, true );
	}

	/**
	 * Get the settings API object
	 *
	 * @return SettingsApi
	 */
	public function getSettings() {
		return $this->settings;
	}

	/**
	 * Get the encryption API
	 *
	 * @return Encryption
	 */
	public function getEncryption() {
		return $this->encryption;
	}


	/**
	 * Get the encyption public key
	 *
	 * @return string|\WP_Error
	 */
	public function getPublicKey() {
		return $this->encryption
			->getPublicKey();
	}

	/**
	 * Get the encyption signature key
	 *
	 * @return string|\WP_Error
	 */
	public function getSignatureKey() {
		return $this->encryption
			->getPublicKey( 'sign_public_key' );
	}


	/**
	 * Get API Handler by account id
	 *
	 * @param int               $accountId Account ID, which must be saved in settings, to get handler for.
	 * @param string            $apiUrl Optional. URL override for TrustedLogin API.
	 * @param null|TeamSettings $team Optional. TeamSettings  to use.
	 *
	 * @return ApiHandler
	 */
	public function getApiHandler( $accountId, $apiUrl = '', $team = null ) {
		if ( ! $team ) {
			$team = SettingsApi::fromSaved()->getByAccountId( $accountId );
		}

		return new ApiHandler(
			array(
				'private_key' => $team->get( 'private_key' ),
				'public_key'  => $team->get( 'public_key' ),
				'debug_mode'  => $team->get( 'debug_enabled' ),
				'api_url'     => $apiUrl ?: $this->getApiUrl(),
			),
			$this->apiSender
		);
	}

	/**
	 * Verify team credentials
	 *
	 * @return bool
	 */
	public function verifyAccount( TeamSettings $team ) {
		$handler = new ApiHandler(
			array(
				'private_key' => $team->get( 'private_key' ),
				'public_key'  => $team->get( 'public_key' ),
				'debug_mode'  => $team->get( 'debug_enabled' ),
				'api_url'     => $this->getApiUrl(),
			),
			$this->apiSender
		);

		return ! is_wp_error(
			$handler->verify(
				$team->get( 'account_id' )
			)
		);
	}

	/**
	 * Returns the API URL after passing it through a filter.
	 *
	 * @return string
	 */
	public function getApiUrl() {
		return (string) apply_filters( 'trustedlogin/api-url/saas', TRUSTEDLOGIN_API_URL );
	}

	/**
	 * Set the apiSender instance
	 *
	 * @param ApiSend $apiSender
	 * @return $this
	 */
	public function setApiSender( ApiSend $apiSender ) {
		$this->apiSender = $apiSender;
		return $this;
	}
}
