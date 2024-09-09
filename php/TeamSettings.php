<?php
/**
 * Class: TrustedLogin Team Settings
 *
 * @package trustedlogin-vendor
 * @version 0.10.0
 */

namespace TrustedLogin\Vendor;

use Exception;
use TrustedLogin\Vendor\Status\IsTeamConnected;
use TrustedLogin\Vendor\Webhooks\Freescout;
use TrustedLogin\Vendor\Webhooks\Helpscout;

/**
 * Object-representation of one Team's settings.
 */
class TeamSettings {


	const HELPDESK_SETTINGS = 'helpdesk_settings';

	const DEFAULT_HELPDESKS = array(
		'helpscout',
		'freescout',
	);

	/**
	 * @var array
	 * @since 0.10.0
	 */
	protected $defaults;


	/**
	 * @var array
	 * @since 0.10.0
	 */
	protected $values;


	/**
	 * @since 0.10.0
	 *
	 * @param array $values Values to set
	 */
	public function __construct( array $values = array() ) {
		$this->defaults = array(
			'account_id'            => '',
			'private_key'           => '',
			'public_key'            => '',
			'helpdesk'              => 'helpscout',
			'approved_roles'        => array( 'administrator' ),
			'debug_enabled'         => 'on',
			'enable_audit_log'      => 'on',
			IsTeamConnected::KEY    => false,
			'message'               => '',
			'status'                => false,
			'name'                  => '',
			self::HELPDESK_SETTINGS => array(),
		);

		$this->values = wp_parse_args( $values, $this->defaults );
	}

	public function toArray() {
		if ( ! is_array( $this->values['helpdesk'] ) ) {
			$this->values['helpdesk'] = array( $this->values['helpdesk'] );
		}
		return $this->values;
	}

	/**
	 * Get array of helpdesks that are enabled.
	 *
	 * @since 0.10.0
	 *
	 * @return array Array of helpdesk keys (e.g. 'helpscout', 'freescout').
	 */
	public function getHelpdesks() {
		try {
			$helpdesks = $this->get( 'helpdesk' );
		} catch ( Exception $e ) {
			$helpdesks = array();
		}

		if ( is_string( $helpdesks ) ) {
			$helpdesks = array( $helpdesks );
		}
		if ( empty( $helpdesks ) ) {
			return self::DEFAULT_HELPDESKS;
		}
		return $helpdesks;
	}

	/**
	 * Reset all values
	 *
	 * @since 0.10.0
	 *
	 * @param array $values Values to set
	 * @return $this
	 */
	public function reset( array $values ) {
		$this->values = array();
		foreach ( $this->defaults as $key => $default ) {
			if ( isset( $values[ $key ] ) && ! empty( $values[ $key ] ) ) {
				$value = $values[ $key ];
				if ( is_object( $value ) ) {
					$value = (array) $value;
					foreach ( $value as $k => $v ) {
						if ( is_object( $v ) ) {
							$value[ $k ] = (array) $v;
						}
					}
				}

				$this->values[ $key ] = $value;
			} else {
				$this->values[ $key ] = $default;
			}
		}
		if ( empty( $this->values['approved_roles'] ) ) {
			$this->values['approved_roles'] = array( 'administrator' );
		}
		if ( empty( $this->values['helpdesk'] ) ) {
			$this->values['helpdesk'] = array( 'helpscout' );
		}
		return $this;
	}

	/**
	 * Set a value
	 *
	 * @since 0.10.0
	 *
	 * @param string $key Setting to set
	 * @param mixed  $value The new value
	 * @return $this
	 */
	public function set( $key, $value ) {
		if ( $this->valid( $key ) ) {
			$this->values[ $key ] = $value;
		} else {
			throw new Exception( 'Invalid key' );
		}
		return $this;
	}

	/**
	 * Get a value
	 *
	 * @since 0.10.0
	 * @param string $key Setting to get.
	 * @throws Exception If $key is invalid.
	 * @return mixed
	 */
	public function get( $key ) {
		if ( $this->valid( $key ) ) {
			$value = $this->values[ $key ] ?? null;
			if ( is_object( $value ) ) {
				$value = (array) $value;
			}
			return $value;
		}
		throw new Exception( 'Invalid key' );
	}

	/**
	 * Check if key is valid
	 *
	 * @since 0.10.0
	 * @param string $key Setting to get.
	 * @return bool
	 */
	public function valid( $key ) {
		return array_key_exists( $key, $this->defaults );
	}

	/**
	 * Get settings for current helpdesk data
	 *
	 * @since 0.10.0
	 * @return array
	 */
	public function getHelpdeskData( $type = 'helpscout' ) {
		$helpdesks  = $this->get( 'helpdesk' );
		$account_id = $this->get( 'account_id' );
		if ( empty( $helpdesks ) ) {
			$helpdesks = array( $type );
			$this->set( 'helpdesk', $helpdesks );
		}
		if ( ! is_array( $helpdesks ) ) {
			$helpdesks = array( $helpdesks );
		}

		switch ( $type ) {
			case 'freescout':
				$callback = Freescout::actionUrl( $account_id );
				break;
			case 'helpscout':
			default:
				$callback = Helpscout::actionUrl( $account_id );
				break;
		}

		$helpdeskSettings = $this->get( self::HELPDESK_SETTINGS );
		if ( $helpdeskSettings ) {
			$helpdesk = $helpdesks[0];
			if ( isset( $helpdeskSettings[ $helpdesk ] ) ) {
				$data = $helpdeskSettings[ $helpdesk ];
				if ( is_object( $data ) ) {
					$data = (array) $data;
				}
				return array(
					'secret'   => $data['secret'] ?? '',
					'callback' => $callback,
				);
			}
		}

		return array();
	}
}
