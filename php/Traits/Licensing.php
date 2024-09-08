<?php
namespace TrustedLogin\Vendor\Traits;

trait Licensing {


	protected $licensing_platforms = array(
		'edd' => 'TrustedLogin\Vendor\Licensing\Platform\Edd',
	);

	public function getActivePlatforms() {
		$platforms = array();
		foreach ( $this->licensing_platforms as $platform ) {
			if ( $platform->isActive() ) {
				$platform_class_name = get_class( $platform );
				$platforms[]         = new $platform_class_name();
			}
		}
		return $platforms;
	}

	public function eddHasLicensing() {
		return function_exists( 'edd_software_licensing' );
	}

	public function eddGetLicenses( $email ) {

		$licenses = array();
		$_u       = get_user_by( 'email', $email );

		if ( $_u ) {
			$licenses = edd_software_licensing()->get_license_keys_of_user( $_u->ID, 0, 'all', true );

			foreach ( $licenses as $license ) {
				$children = edd_software_licensing()->get_child_licenses( $license->ID );
				if ( $children ) {
					foreach ( $children as $child ) {
						$licenses[] = edd_software_licensing()->get_license( $child->ID );
					}
				}

				$licenses[] = edd_software_licensing()->get_license( $license->ID );
			}
		}

		return ( ! empty( $licenses ) ) ? $licenses : false;
	}

	/**
	 * Helper function: Check if the current site is an EDD store
	 *
	 * @since 0.2.0
	 * @return Boolean
	 */
	public function isEddStore() {
		return class_exists( 'Easy_Digital_Downloads' );
	}

	/**
	 * Helper function: Check if the current site is Woocommerce store
	 *
	 * @since 0.8.0
	 * @return Boolean
	 */
	public function isWooStore() {
		return class_exists( 'woocommerce' );
	}
}
