<?php


namespace TrustedLogin\Vendor\Services;

use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 * Handles proxying admin requests to tl-app
 */
class ProxyRoutes
{

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
                    var_dump($part);exit;
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
                    $route['uri']
                );
            }
        }
        $response = wp_remote_post( $this->makeRemoteUrl($route['uri']), [
            'method' =>$route['method'],
            'body' => $data,
            'headers' => $this->getHeaders(),
        ] );
        var_dump($response);exit;
    }
}
