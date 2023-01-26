<?php
namespace TrustedLogin\Vendor\Endpoints;


use TrustedLogin\Vendor\Services\ProxyRoutes;
use TrustedLogin\Vendor\Services\RemoteSession;

class Proxy {
    /**
	 * @var string
	 * @since 0.18.0
	 */
	protected $apiUrl;


    protected ProxyRoutes $proxyRoutes;
	public function __construct(RemoteSession $remoteSession)
	{
		//No slash at end!
		$this->apiUrl = 'https://php8.trustedlogin.dev';
		$this->proxyRoutes = new ProxyRoutes(
            $remoteSession
        );
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
        $types = [
            'users',
            'teams'
        ];
        register_rest_route(
            Endpoint::NAMESPACE,
            '/remote/teams',
            [
                'methods'             => [
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE'
                ],//$this->proxyRoutes->getMethods('teams'),
                'callback'            => [ $this, 'handleTeams' ],
                'permission_callback' => [$this, 'authorize'],
                'args' =>$args,
            ]
        );
        register_rest_route(
            Endpoint::NAMESPACE,
            '/remote/users',
            [
                'methods'             => $this->proxyRoutes->getMethods('users'),
                'callback'            => [ $this, 'handleUsers' ],
                'permission_callback' => [$this, 'authorize'],
                'args'  => array_merge($args,[
                    'user' => [
                        'type' => 'integer',
                        'required' => true
                    ],
                ])
            ]
        );
    }



    protected function getHeaders(){
        $token = $_COOKIE[RemoteSession::COOKIE_APP_TOKEN] ?? null;
        return [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token
        ];
    }
    public function handleUsers($request){
        $data = $request->get_param('tl_data');
        $routeName = $request->get_param('tl_route');
        $route = $this->proxyRoutes->getRoute(
            $routeName,
            'users'
        );
        if( empty($route) ){
            return new \WP_Error(
                'invalid_route',
                'Invalid route',
                [
                    'routeName' => $routeName
                ]
            );
        }

        $response = $this->proxyRoutes->makeProxyRequest(
            $route,
            $data,
            $this->getHeaders()
        );
        return $response;
    }

    public function handleTeams($request ){
        $data = $request->get_param('tl_data');
        $routeName = $request->get_param('tl_route');
        $route = $this->proxyRoutes->getRoute(
            $routeName,
            'teams'
        );
        if( empty($route) ){
            return new \WP_Error(
                'invalid_route',
                'Invalid route',
                [
                    'routeName' => $routeName
                ]
            );
        }
        $dynamicParts = $this->proxyRoutes->getDynamicParts($route);
        if( ! empty($dynamicParts) ){
            //Replace dynamic parts of url with data from request
            foreach($dynamicParts as $part){
                if( ! isset($data[$part])){
                    return new \WP_Error(
                        'invalid_data',
                        'Invalid data',
                        [
                            'routeName' => $routeName,
                            'missing' => $part
                        ]
                    );
                }
                $route['uri'] = str_replace(
                    '{' . $part . '}',
                    $data[$part],
                    $route
                );
            }
        }
        $response = $this->proxyRoutes->makeProxyRequest(
            $route,
            $data,
            $this->getHeaders()
        );
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
