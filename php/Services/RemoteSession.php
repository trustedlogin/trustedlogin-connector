<?php
namespace TrustedLogin\Vendor\Services;

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
	const TOKEN_QUERY_ARG = 'tl_session_token';

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
	 * Get the URL for the redirect to callback
	 *
	 * @since 0.18.0
	 *
	 * @return string
	 */
	public static function makeCallbackUrl(string $nonce = null ){
		if( is_null($nonce)){
			$nonce = static::makeNonce();
		}
		return \add_query_arg(
			[
				static::NONCE_QUERY_ARG => $nonce,
			],
			\admin_url()
		);
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
	 *
	 *
	 * @uses "admin_init" hook
	 * @since 0.18.0
	 *
	 */
	public static function listen(){


		if( isset($_REQUEST[static::NONCE_QUERY_ARG]) && isset( $_REQUEST[static::TOKEN_QUERY_ARG])){
			$nonce = $_REQUEST[static::NONCE_QUERY_ARG];
			$token = $_REQUEST[static::TOKEN_QUERY_ARG];

			$service = new static(\trustedlogin_vendor());
			//What should happen is:
			//1. User clicks button
			//2. User is redirected to tl app
			//3. User logs in
			//4. tl app makes API call to tl vendor rest api validates nonce and returns encrypted:
			//{nonce,token,WP_SALT}
			//5. tl app redirects back with nonce and encyrpted token.
			//6. tl vendor decrypts token and puts it in  a cookie, after validating nonce.
			$returnUrl = \admin_url('admin.php?page=trustedlogin-teams');


			\wp_redirect(add_query_arg([
				'success' => true,
				'error' => false,
			], $returnUrl));
			exit;
		}
	}



	/**
	 * Get the URL for login
	 *
	 * @since 0.18.0
	 * @return string
	 */
	public function getLoginUrl(){
		return $this->apiUrl('/login');
	}

	/**
	 * Get the URL for logout
	 *
	 * @since 0.18.0
	 * @return string
	 */
	public function getLogoutUrl(){
		return $this->apiUrl('/logout');
	}


	public function apiUrl(string $endpoint = ''){
		return $this->apiUrl . $endpoint;
	}
}
