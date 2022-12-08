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
	 * @since 0.13.0
	 */
	const NONCE_ACTION = 'tl_connect';

	/**
	 * Cache key for the tokens
	 * @since 0.13.0
	 */
	const CACHE_KEY = 'tl_connect_tokens';

	/**
	 * Query arg for the nonce
	 * @since 0.13.0
	 */
	const NONCE_QUERY_ARG = 'tl_connect_nonce';

	/**
	 * Query arg for the token
	 * @since 0.13.0
	 */
	const TOKEN_QUERY_ARG = 'tl_connect_token';
	/**
	 * @var Plugin
	 * @since 0.13.0
	 */
	protected $plugin;

	/**
	 * @var string
	 * @since 0.13.0
	 */
	protected $apiUrl;

	/**
	 * @var bool
	 * @since 0.13.0
	 * @todo base this on a constant
	 */
	protected $isDev = true;

	/**
	 * ConnectionService constructor.
	 *
	 * @param Plugin $plugin
	 * @since 0.13.0
	 */
	public function __construct(Plugin $plugin)
	{
		$this->plugin = $plugin;
		$this->apiUrl = 'https://tlmockapi.local/mock-server';
	}

	/**
	 * Get the URL for the redirect to callback
	 *
	 * @since 0.13.0
	 *
	 * @return string
	 */
	public static function makeCallbackUrl(){
		return \add_query_arg(
			[
				static::NONCE_QUERY_ARG => \wp_create_nonce(static::NONCE_ACTION),
			],
			\admin_url()
		);
	}

	/**
	 * Get the saved tokens
	 *
	 * @since 0.13.0
	 * @return array|false
	 */
	public static function savedTokens(){

		$tokens =  \get_option(static::CACHE_KEY, []);
		if( ! is_array($tokens)|| empty($tokens)){
			return false;
		}
		return $tokens;
	}

	/**
	 * Save the tokens to the database on callback from the API
	 *
	 * @uses "admin_init" hook
	 * @since 0.13.0
	 *
	 */
	public static function listen(){
		if( isset($_REQUEST[static::NONCE_QUERY_ARG], $_REQUEST[static::TOKEN_QUERY_ARG])){
			$nonce = $_REQUEST[static::NONCE_QUERY_ARG];
			$token = $_REQUEST[static::NONCE_QUERY_ARG];
			$service = new static(\trustedlogin_vendor());
			$tokens = $service->handleCallback($nonce, $token);
			$returnUrl = \admin_url('admin.php?page=trustedlogin-connect');
			if( ! is_array($tokens)){
				$service->log('Error getting account tokens',
					__METHOD__,
					[
						'error' => true
					]
				);
				\wp_redirect(add_query_arg('error', 'token', $returnUrl));
				exit;
			}

			$service->log('Got tokens',
				__METHOD__,
				[
					'tokens' => $tokens
				]
			);
			$service->log('Redirecting to admin',
				__METHOD__
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
	 * @since 0.13.0
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
		$tokens = $this->getAccountTokens($token);
		if( ! is_array($tokens)){
			$this->log('Error getting account tokens',
				__METHOD__,
				[

				]
			);
			return new \WP_Error('invalid_token', __('Invalid token', 'trustedlogin-vendor'));
		}
		//Save tokens
		\update_option(self::CACHE_KEY, $tokens, '', false);
		return true;
	}

	/**
	 * Get the URL for login
	 *
	 * @since 0.13.0
	 * @return string
	 */
	public function getLoginUrl(){
		return $this->apiUrl('/login');
	}

	/**
	 * Get the URL to the API
	 *
	 * @since 0.13.0
	 * @return array
	 */
	public function getAccountTokens(string $token){
		$response = $this->plugin
			->getApiSender()
			->send(
				$this->apiUrl('/token'),
				[
					'token' => $token
				],
				'POST',
				[],
				! $this->isDev
			);
		if( \is_wp_error($response) ){
			$this->log('Error getting account tokens',
				__METHOD__,
				[
					'error' => $response->get_error_message()
				]
			);
			return false;

		}
		$tokens = json_decode($response['body'], true);
		$tokens =  is_array($tokens) && isset($tokens['tokens']) ? $tokens['tokens'] : false;
		return $tokens;
	}

	public function getAccount(string $token){
		$account = $this->plugin
			->apiSender
			->send(
				$this->apiUrl('/token/exchange'),
				[
					'token' => $token
				],
				'POST',
			);
		if( \is_wp_error($account) ){
			$this->log('Error getting account',
				__METHOD__,
				[
					'error' => $account->get_error_message()
				]
			);
			return $account;
		}
	}

	public function apiUrl(string $endpoint = ''){
		return $this->apiUrl . $endpoint;
	}
}
