<?php


namespace TrustedLogin\Vendor\Status;

use TrustedLogin\Vendor\TeamSettings;

/**
 * Check if team is connected
 */
class IsTeamConnected {


	const KEY = 'connected';

	const STATUS_KEY = 'status';

	const VALUE_NOT_CHECKED = 'not_checked';

	const VALUE_CHECKED_NOT_CONNECTED = 'checked_not_connected';

	const VALUE_CHECKED_IS_CONNECTED = 'checked_is_connected';

	/**
	 * Check if we were able to verify the team's connection
	 *
	 * This is not as good as \Endpoints\Settings::verifyAccountId()
	 */
	public static function check( TeamSettings $team ) {
		$check = \trustedlogin_connector()
			->verifyAccount( $team );

		if ( $check ) {
			$team = static::setConnected( $team );
		} else {
			$team = static::setNotConnected( $team );
		}
		return $team;
	}

	/**
	 * Set the team as connected
	 *
	 * @param TeamSettings $team
	 * @return TeamSettings
	 */
	public static function setConnected( TeamSettings $team ) {
		$team->set( static::KEY, static::VALUE_CHECKED_IS_CONNECTED );
		return $team;
	}

	/**
	 * Set the team as not connected
	 *
	 * @param TeamSettings $team
	 * @return TeamSettings
	 */
	public static function setNotConnected( TeamSettings $team ) {
		$team->set( static::KEY, static::VALUE_CHECKED_NOT_CONNECTED );
		return $team;
	}

	/**
	 * Check if we need to verify the team's connection
	 *
	 * @throws \Exception
	 */
	public static function needToCheck( TeamSettings $team ) {
		return in_array(
			$team->get( static::KEY ),
			array(
				static::VALUE_NOT_CHECKED,
				null,
			),
			true
		);
	}

	/**
	 * Convert value of key to string
	 */
	public static function valueToBoolean( string $value ) {
		return static::VALUE_CHECKED_IS_CONNECTED === $value;
	}
}
