<?php
namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 * Handles connecting acount
 */
class ConnectionService
{

	use Logger;

	/**
	 * Nonce action for the callback
	 * @since 0.18.0
	 */
	const NONCE_ACTION = 'tl_connect';

	/**
	 * Cache key for the team exchnage tokens
	 * @since 0.18.0
	 */
	const CACHE_KEY = 'tl_connect_tokens';

	/**
	 * Cache key for the main exchnage tokens
	 * @since 0.18.0
	 */
	const CACHE_KEY_TOKEN = 'tl_connect_token';

	/**
	 * Query arg for the nonce
	 * @since 0.18.0
	 */
	const NONCE_QUERY_ARG = 'tl_connect_nonce';

	/**
	 * Query arg for the token
	 * @since 0.18.0
	 */
	const TOKEN_QUERY_ARG = 'tl_connect_token';
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
	public static function getExchangeRoute(){
		return add_query_arg( [
			'exchange' => true,
		],rest_url('trustedlogin/v1/connect' ));
	}

	/**
	 * Get the saved tokens
	 *
	 * @since 0.18.0
	 * @return array|false
	 */
	public static function savedTokens(){

		$tokens =  \get_option(static::CACHE_KEY, []);
		if( ! is_array($tokens)|| empty($tokens)){
			return false;
		}
		return $tokens;
	}

	public static function savedExchangeToken(){
		return \get_option(static::CACHE_KEY_TOKEN, false);
	}

	/**
	 * Delete the saved tokens
	 * @since 0.18.0
	 */
	 public static function deleteSavedTokens(){
		 \delete_option(static::CACHE_KEY);
		 \delete_option(static::CACHE_KEY_TOKEN);
	 }

	/**
	 * Delete the saved token
	 */
	/**
	 * Save the tokens to the database on callback from the API
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
			$gotTokens = $service->handleCallback($nonce, $token);
			$returnUrl = \admin_url('admin.php?page=trustedlogin-connect');
			if( !$gotTokens ){
				$service->log('Error getting account tokens in listen',
				__METHOD__,
					'error',
					[
						'gotTokens' => $gotTokens
					]
				);
				\wp_redirect(add_query_arg('error', 'token', $returnUrl));
				exit;
			}

			$service->log('Got tokens',
				__METHOD__,
				'info',
				[
					'gotTokens' => $gotTokens

				]
			);

			\wp_redirect(add_query_arg([
				'success' => true,
				'error' => false,
			], $returnUrl));
			exit;
		}
	}

	/**
	 * Handle the callback from the API
	 *
	 * @since 0.18.0
	 */
	public function handleCallback(string $nonce, string $token){
		if( ! \wp_verify_nonce($nonce, static::NONCE_ACTION) ){
			$this->log('Invalid nonce',
				__METHOD__,
				[
					'nonce' => $nonce
				]
			);
			return new \WP_Error('invalid_nonce', __('Invalid nonce', 'trustedlogin-vendor'));
		}
		//Save the exchange token
		update_option(self::CACHE_KEY_TOKEN, $token, false);
		$tokens = $this->getAccountTokens($token,$nonce);
		if( ! is_array($tokens)){
			$this->log('Error getting account tokens',
			__METHOD__ . __LINE__,
			[

				]
			);
			return new \WP_Error('invalid_token', __('Invalid token', 'trustedlogin-vendor'));
		}
		//Save tokens
		\update_option(self::CACHE_KEY, $tokens, false);

		return true;
	}

	/**
	 * Get the URL for login
	 *
	 * @since 0.18.0
	 * @return string
	 */
	public function getLoginUrl(){
		return $this->apiUrl('/connect/token');
	}

	/**
	 * Get the URL to the API
	 *
	 * @since 0.18.0
	 * @return array
	 */
	public function getAccountTokens(string $token,string $nonce){


		$response = $this->plugin
			->getApiSender()
			->send(
				$this->apiUrl('/api/v1/token'),
				[
					'token' => $token,
					'nonce' => $nonce,
				],
				'POST',
				[
					'Authorization' => 'Bearer ' .  $token,
					'Content-Type' => 'application/json',
					'Accept' => 'application/json'
				],
				! $this->isDev
			);

		if( \is_wp_error($response) ){
			$this->log('Error getting account tokens',
				__METHOD__ . __LINE__,
				'error',
				$response->get_error_message()
			);
			return false;

		}
		$tokens = wp_remote_retrieve_body($response);
		if( ! empty($tokens ) && is_string($tokens)){
			$tokens = json_decode($tokens, true);
		}
		$this->log('Decoded tokens body',
				__METHOD__,
				'info',
				$tokens
			);
		if( is_array($tokens)){
			$this->log('return tokens',
					__METHOD__,
					'info',
					$tokens
				);
			return $tokens;
		}

		return false;
	}


	public function getAccount(string $token,string $accountToken){

		$this->log('Getting account via connect ',
				__METHOD__,
				'info',
				[
					'token' => $token
				]
			);

		$response = $this->plugin
			->getApiSender()
			->send(
				$this->apiUrl('/api/v1/token/exchange?token=' . $token),
				[
					'token' => $token,
					'accountToken' => $accountToken,
				],
				'POST',
				[
					'Authorization' => 'Bearer ' .  $token,
					'Content-Type' => 'application/json',
					'Accept' => 'application/json'
				],
				! $this->isDev
			);


		if( \is_wp_error($response) ){
			$this->log('Error getting account',
				__METHOD__,
				'error',
				[
					'error' => $response->get_error_message()
				]
			);
			return false;
		}
		$account = wp_remote_retrieve_body($response);

		if( $account['success'] ){
			return $account;

		}
		return false;

	}

	public function apiUrl(string $endpoint = ''){
		return $this->apiUrl . $endpoint;
	}
}
