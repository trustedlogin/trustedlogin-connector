<?php
namespace TrustedLogin\Vendor\Services;

use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 * Handles remote session management for tl app
 */
class RemoteSession
{

	use Logger;

	/**
	 * Nonce action
	 *
	 * @since 0.18.0
	 */
	const NONCE_ACTION = 'tl_session';

	/**
	 * Query arg for the nonce
	 * @since 0.18.0
	 */
	const NONCE_QUERY_ARG = 'tl_session_nonce';

	/**
	 * Query arg for the token
	 * @since 0.18.0
	 */
	const TOKEN_QUERY_ARG = 'tl_account_token';

	const COOKIE_APP_TOKEN = 'tl_remote_token';

	const LOGOUT_QUERY_ARG = 'tl_logout';

	/**
	 * @var Plugin
	 * @since 0.18.0
	 */
	protected $plugin;

	/**
	 * @var string
	 * @since 0.18.0
	 */
	protected $apiUrl;

	/**
	 * @var bool
	 * @since 0.18.0
	 * @todo base this on a constant
	 */
	protected $isDev = true;

	/**
	 * ConnectionService constructor.
	 *
	 * @param Plugin $plugin
	 * @since 0.18.0
	 */
	public function __construct(Plugin $plugin)
	{
		$this->plugin = $plugin;
		//No slash at end!
		$this->apiUrl = 'https://php8.trustedlogin.dev';
		//TRUSTEDLOGIN_API_URL;
	}

	/**
	 *
	 *
	 * @uses "admin_init" hook
	 * @since 0.18.0
	 *
	 */
	public static function listen(){

		//@todo can we use POST to prevent logging?
		if( isset($_REQUEST[static::NONCE_QUERY_ARG]) && isset( $_REQUEST[static::TOKEN_QUERY_ARG])){
			$nonce = sanitize_text_field( $_REQUEST[static::NONCE_QUERY_ARG]);
			$token = sanitize_text_field( $_REQUEST[static::TOKEN_QUERY_ARG]);

			$service = new static(\trustedlogin_vendor());
			if( ! wp_verify_nonce($nonce,static::NONCE_ACTION)){
				wp_die(__('Invalid nonce', 'trustedlogin-vendor'));
			}
			if( $service->hasAppToken()){
				$service->clearCookie();
			}
			//Not doing token encoding yet, this is simpler.
			$service->setCookie($token);
			//What should happen is:
			//1. User clicks button
			//2. User is redirected to tl app
			//3. User logs in
			//4. tl app makes API call to tl vendor rest api validates nonce and returns encrypted:
			//{nonce,token,WP_SALT}
			//5. tl app redirects back with nonce and encyrpted token.
			//6. tl vendor decrypts token and puts it in  a cookie, after validating nonce.

			\wp_redirect(add_query_arg([
				'success' => true,
				'error' => false,
				'page' => MenuPage::SLUG_ACCOUNT
			], \admin_url('admin.php')));
			exit;
		}
		//listen for logout
		if( isset($_REQUEST[static::LOGOUT_QUERY_ARG])){
			$service = new static(\trustedlogin_vendor());
			$service->clearCookie();
			wp_remote_get(
				$service->apiUrl('/logout/remote'),
				[
					'blocking' => true,
					'headers' => [
						'content-type' => 'application/json',
						'Authorization' => 'Bearer ' . $service->getAppToken(),
					],
				]
			);

			wp_safe_redirect(add_query_arg([
				'page' => MenuPage::SLUG_ACCOUNT
			], \admin_url('admin.php')));
			exit;
		}
	}

	/**
	 * Check if app token in cookies
	 *
	 * @since 0.18.0
	 * @return bool
	 */
	public function hasAppToken(){
		return isset($_COOKIE[static::COOKIE_APP_TOKEN]);
	}

	/**
	 * Get the app token from cookies
	 */
	public function getAppToken(){
		//check if set, return WP_Error if not
		if( ! $this->hasAppToken() ){
			return new \WP_Error(
				'tl_no_app_token',
				__('No app token found', 'trustedlogin')
			);
		}
		return $_COOKIE[static::COOKIE_APP_TOKEN];
	}

	/**
	 * To array of data to send to React app for session
	 *
	 * @since 0.18.0
	 */
	public function toArray(){
		$nonce = $this->makeNonce();
		return [
			'hasAppToken' => $this->hasAppToken(),
			'loginUrl' => add_query_arg([
				static::NONCE_QUERY_ARG => $nonce,
				'tl_login' => true,
			], $this->apiUrl('/login')),
			'startLogout' => add_query_arg([
				static::LOGOUT_QUERY_ARG => true,
				static::NONCE_QUERY_ARG => $nonce,
				'page' => MenuPage::SLUG_ACCOUNT,
			], admin_url('admin.php')),
			'logoutUrl' => $this->apiUrl('/logout/remote'),
			'callbackUrl' => urlencode($this->getCallbackUrl($nonce)),
			'nonce' => $nonce,
		];
	}



	/**
	 * Create nonce
	 *
	 * @since 0.18.0
	 *
	 * @return string
	 */
	public static function makeNonce(){
		return wp_create_nonce(static::NONCE_ACTION);
	}

	/**
	 * Take Laravel token and wp nonce and encrypt them
	 *
	 * @since 0.18.0
	 * @param string $nonce
	 * @param string $token
	 * @return string
	 */
	public function encryptToken(string $nonce,string $token ){
		$encoded = json_encode([
			'nonce' => $nonce,
			'token' => $token,
			'salt' => WP_SALT,
		]);
		$encrypted = $this->plugin->getEncryption()->encrypt($encoded);

		return $encrypted;
	}

	/**
	 * Decrypt token from app then: validate nonce, set cookie
	 *
	 * @since 0.18.0
	 * @param string $encrypted
	 * @param string $nonce
	 * @return true|\WP_Error True if succesful, WP_Error if not.
	 */
	public function validate(string $encrypted,string $nonce){
		try {
			//decrypt
			$decrypted = $this->plugin->getEncryption()->decrypt($encrypted);
			//decode
			try {
				$decoded = json_decode($decrypted,true);
				//Check has nonce, token, salt
				if( !isset($decoded['nonce']) || !isset($decoded['token']) || !isset($decoded['salt'])){
					return new \WP_Error('invalid_decrypted_data','Invalid decrypted data');
				}
				//Is it the same nonce we originally set
				if( ! hash_equals($nonce,$decoded['nonce'])){
					return new \WP_Error('invalid_nonce','Invalid nonce');
				}
				//Validate nonce
				if( !wp_verify_nonce($decoded['nonce'],static::NONCE_ACTION)){
					return new \WP_Error('invalid_nonce','Invalid nonce');
				}
				//Put token in a cookie
				$this->setCookie($decoded['token']);
				return true;
			} catch (\Throwable $th) {
				//throw $th;
			}
		} catch (\Throwable $th) {
			//throw $th;
		}
		$decrypted = $this->plugin->getEncryption()->decrypt($encrypted);
	}


	/**
	 * Set the app token in cookies
	 *
	 * @since 0.18.0
	 * @param string $value
	 */
	public function setCookie(string $value){
		\setcookie(
			static::COOKIE_APP_TOKEN,
			$value,
			time() + (86400 * 30),
			COOKIEPATH,
			COOKIE_DOMAIN,
			true,
			true
		);
	}

	/**
	 * Clear the app token from cookies
	 *
	 * @since 0.18.0
	 */
	public function clearCookie(){
		\setcookie(
			static::COOKIE_APP_TOKEN,
			'',
			time() - 3600,
			COOKIEPATH,
			COOKIE_DOMAIN,
			true,
			true
		);
	}


	/**
	 * Get the URL for remote app to return to
	 *
	 * @since 0.18.0
	 * @return string
	 */
	protected function getCallbackUrl(string $nonce){
		return \add_query_arg(
			[
				'success' => true,
				'error' => false,
				static::NONCE_QUERY_ARG => $nonce,
				'page' => MenuPage::SLUG_SESSION,
			],
			\admin_url('admin.php')
		);
	}



	public function apiUrl(string $endpoint = ''){
		return $this->apiUrl . $endpoint;
	}
}
