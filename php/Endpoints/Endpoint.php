<?php

namespace TrustedLogin\Vendor\Endpoints;

/**
 * Base class for all endpoints to extend
 */
abstract class Endpoint {

	/**
	 * Error code for public key sucess.
	 */
	const PUBLIC_KEY_SUCCESS_STATUS = 200;

	/**
	 * Error code for public key error.
	 */
	const PUBLIC_KEY_ERROR_STATUS = 501;

	/**
	 * Namespace for all routes
	 */
	const NAMESPACE = 'trustedlogin/v1';

	/**
	 * Register endpoint
	 *
	 * @param bool $editable Defaults to true. If false, the endpoint will not be updateable.
	 */
	public function register( $editable = true, $readable = true ) {

		if ( $editable ) {
			register_rest_route(
				self::NAMESPACE,
				$this->route(),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update' ),
					'permission_callback' => array( $this, 'authorize' ),
					'args'                => $this->updateArgs(),
				)
			);
		}
		if ( $readable ) {
			register_rest_route(
				self::NAMESPACE,
				$this->route(),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'authorize' ),
					'args'                => $this->getArgs(),
				)
			);
		}
	}

	/**
	 * Get the route URI
	 *
	 * @return string
	 */
	abstract protected function route();

	/**
	 * Get the args for GET requests
	 *
	 * @return array
	 */
	protected function getArgs() {
		return array();
	}

	/**
	 * Get the args for POST requests
	 *
	 * @return array
	 */
	protected function updateArgs() {
		return array();
	}



	/**
	 * Callback for GET requests
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	abstract public function get( \WP_REST_Request $request );

	/**
	 * Callback for POST requests
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update( \WP_REST_Request $request ) {
		return new \WP_REST_Response(
			array(),
			501
		);
	}

	/**
	 * permission_callback for get and update.
	 *
	 * @param \WP_REST_Request $request
	 * @return bool|\WP_Error
	 */
	public function authorize( \WP_REST_Request $request ) {
		$capability = is_multisite() ? 'delete_sites' : 'manage_options';
		return current_user_can( $capability );
	}
}
