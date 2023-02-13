<?php


namespace TrustedLogin\Vendor\Services;

use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 * Handles proxying admin requests to tl-app
 *
 * Uses ./proxy-routes.json to map the routes
 */
class ProxyRoutes
{
    use Logger;

     /**
	 * @var string
	 * @since 0.18.0
	 */
	protected $apiUrl;

    /**
	 * @since 0.18.0
     * @var array
     */
    protected $routeMap = [];

    /**
     * @var RemoteSession
     */
    protected RemoteSession $remoteSession;

    /**
     * ProxyRoutes constructor.
     * @param RemoteSession $remoteSession
     */
    public function __construct(RemoteSession $remoteSession)
    {
        $this->remoteSession = $remoteSession;

        $this->routeMap = json_decode(
            file_get_contents(
                __DIR__ . '/proxy-routes.json'
            ),
            true
        );
        //No slash at end!
        $this->apiUrl = 'https://php8.trustedlogin.dev';
    }

    /**
     * @param string $type
     * @param string $routeName
     * @return array $data
     */
    public function getRoute(string $routeName, string $type ){
        $types = ['users', 'teams',];
        if( ! in_array($type, $types) ){
            return false;
        }
        $routes = $this->routeMap[$type]['routes'];
        //loop through and return the first match of 'name'
        foreach($routes as $route){
            if( $route['name'] === $routeName ){
                return $route;
            }
        }
        return false;
    }

    /**
     * @param string $type
     * @return array
     */
    public function getMethods(string $type) {
        $types = ['users', 'teams',];
        if( ! in_array($type, $types) ){
            return [];
        }
        return $this->routeMap[$type]['methods'];
    }

    /**
     * @param string $uri
     * @return array
     */
    public function getDynamicParts(string $uri): array{
        preg_match_all('/{(.*?)}/', $uri, $matches);
        if( ! isset($matches[1])|| empty($matches[1] )){
            return [];
        }
        return $matches[1];
    }



    public function makeRemoteUrl(string $route){
        return sprintf(
            '%s/%s',
            $this->apiUrl,
            $route
        );

    }

    /**
     * @return array
     */
    public function getHeaders(){
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $this->remoteSession->getAppToken(),
        ];
    }

    /**
     * @param array $route
     * @param array $data
     * @return array|\WP_Error
     */
    public function makeProxyRequest(array $route, array $data){
        $routeName = $route['name'];
        $dynamicParts = $this->getDynamicParts($route['uri']);

        if( ! empty($dynamicParts) ){
            //Replace dynamic parts of url with data from request
            foreach($dynamicParts as $part){
                if( ! isset($data[$part])){
                    return $this->responseData([
                        'data' => [
                            'routeName' => $routeName,
                            'missing' => $part
                        ],
                        'code' => 400,
                        'success' => false
                    ],false);
                }
                $route['uri'] = str_replace(
                    '{' . $part . '}',
                    $data[$part],
                    $route['uri']
                );
            }
        }
        if( 'GET' === $route['method'] ){
            $response = wp_remote_get( $this->makeRemoteUrl($route['uri']), [
                'headers' => $this->getHeaders(),
            ] );
        }else{
            $response = wp_remote_post( $this->makeRemoteUrl($route['uri']), [
                'method' =>$route['method'],
                'body' => json_encode($data),
                'headers' => $this->getHeaders(),
            ] );
        }

        if( \is_wp_error($response) ){
            return $this->responseData($response,false);
        }
        if(  ! in_array(
            $response['response']['code'],
            [200, 201, 204]
        ) ){
            return $this->responseData($response,false);
        }

        return $this->responseData($response,true);
    }

    protected function responseData($response,bool $success = true){
        if( is_wp_error($response) ){
            return [
                'data' => $response->get_error_message(),
                'code' => $response->get_error_code(),
                'success' => false
            ];
        }
        $body = wp_remote_retrieve_body($response);
        if( empty($body) ){
            $this->log(
                'Empty response body',
                __METHOD__,
                'info',
                [
                    'response' => $response,
                ]
            );
            return [
                'data' => [],
                'code' => 500,
                'success' => false
            ];
        }

        return [
            'data' => json_decode($body, true),
            'code' => $response['response']['code'],
            'success' => $success
        ];


    }
}
