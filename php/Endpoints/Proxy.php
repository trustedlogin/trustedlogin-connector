<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;

use TrustedLogin\Vendor\Encryption;
use TrustedLogin\Vendor\Services\RemoteSession;

class Proxy {
    /**
	 * @var string
	 * @since 0.18.0
	 */
	protected $apiUrl;


	public function __construct()
	{
		//No slash at end!
		$this->apiUrl = 'https://php8.trustedlogin.dev';
		//TRUSTEDLOGIN_API_URL;
	}


    public function addRoutes(){
        $args = [
            'tl_route' => [
                'type' => 'string',
                'required' => true
            ],
            'tl_data' => [
                'type' => 'object',
                'required' => true
            ],
        ];
        register_rest_route(
            Endpoint::NAMESPACE,
            '/remote/teams',
            [
                'methods'             => [],
                'callback'            => [ $this, 'handleTeams' ],
                'permission_callback' => [$this, 'authorize'],
                'args' => $args
            ]
        );
        register_rest_route(
            Endpoint::NAMESPACE,
            '/remote/user',
            [
                'methods'             => [],
                'callback'            => [ $this, 'handleUsers' ],
                'permission_callback' => [$this, 'authorize'],
                'args' => $args
            ]
        );
    }

    public function makeRemoteUrl(string $route):string{
        return sprintf(
            '%s%s',
            $this->apiUrl,
            $route
        );

    }

    protected function getHeaders(){
        $token = $_COOKIE[RemoteSession::COOKIE_APP_TOKEN] ?? null;
        return [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getCookie()
        ];
    }
    public function handleUsers($request){
        $data = $request->get_param('tl_data');
        $route = $request->get_param('tl_route');
        $response = wp_remote_post( $this->makeRemoteUrl($route), [
            'method' => 'POST',//??get from request
            'body' => $data,
            'headers' => $this->getHeaders(),
        ] );
        return $response;
    }

    public function handleTeams($request ){
        $data = $request->get_param('tl_data');
        $route = $request->get_param('tl_route');
        $response = wp_remote_post( $this->makeRemoteUrl($route), [
            'method' => 'POST',//??get from request
            'body' => $data,
            'headers' => $this->getHeaders(),
        ] );
        return $response;
    }

    /**
	 * permission_callback for get and update.
	 *
	 * @param \WP_REST_Request $request
	 * @return bool
	 */
	public function authorize(\WP_REST_Request $request)
	{
		$capability = is_multisite() ? 'delete_sites' : 'manage_options';
		return current_user_can($capability);
	}

}
