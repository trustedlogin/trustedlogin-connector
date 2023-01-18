<?php


namespace TrustedLogin\Vendor\Services;

use TrustedLogin\Vendor\MenuPage;
use TrustedLogin\Vendor\Traits\Logger;
use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Traits\VerifyUser;

/**
 *
 */
class ProxyRoutes
{

     /**
	 * @var string
	 * @since 0.18.0
	 */
	protected $apiUrl;
    protected $routeMap = [];


    public function __construct()
    {
        $this->routeMap = json_decode(
            file_get_contents(
                __DIR__ . '/proxy-routes.json'
            ),
            true
        );
        //No slash at end!
        $this->apiUrl = 'https://php8.trustedlogin.dev';
    }

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

    public function getMethods(string $type):array {
        $types = ['users', 'teams',];
        if( ! in_array($type, $types) ){
            return [];
        }
        return $this->routeMap[$type]['methods'];
    }

    public function getDynamicParts(string $uri): array{
        preg_match_all('/{(.*?)}/', $uri, $matches);
        if( ! isset($matches[1])|| empty($matches[1] )){
            return [];
        }
        return $matches[1];
    }



    public function makeRemoteUrl(string $route):string{
        return sprintf(
            '%s%s',
            $this->apiUrl,
            $route
        );

    }

    public function makeProxyRequest(array $route, array $data,array $headers){
        $response = wp_remote_post( $this->makeRemoteUrl($route['uri']), [
            'method' =>$route['method'],
            'body' => $data,
            'headers' => $headers,
        ] );
    }
}
