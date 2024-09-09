<?php
namespace TrustedLogin\Vendor\Endpoints;

use TrustedLogin\Vendor\SettingsApi;
use TrustedLogin\Vendor\Status\IsTeamConnected;
use TrustedLogin\Vendor\TeamSettings;

class Settings extends Endpoint {



	/** @inheritdoc */
	protected function route() {
		return 'settings';
	}

	/** @inheritdoc */
	protected function updateArgs() {
		return array(
			'teams' => array(
				'type'     => 'array',
				'required' => true,
			),
		);
	}

	/**
	 * Handler for requests to GET settings
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get( \WP_REST_Request $request ) {
		return $this->createResponse(
			SettingsApi::fromSaved()
		);
	}

	/**
	 * Handler for requests to POST settings updates.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update( \WP_REST_Request $request ) {
		$settings_api = SettingsApi::fromSaved()->reset();
		$teams        = $request->get_param( 'teams' );
		if ( ! empty( $teams ) ) {
			foreach ( $teams as $team ) {
				try {
					$teamSetting = new TeamSettings(
						$team
					);
					$this->verifyAccountId(
						$teamSetting
					);

					$settings_api->addSetting( $teamSetting );
				} catch ( \Throwable $th ) {
					throw $th;
				}
			}
		}

		$settings_api->save();
		return $this->createResponse(
			// Get from saved so generated secret/ url is returned.
			SettingsApi::fromSaved()
		);
	}

	/**
	 * Verify that the account id is valid
	 *
	 * @param TeamSettings $team
	 * @return void|bool
	 */
	public function verifyAccountId( TeamSettings $team ) {
		if ( ! IsTeamConnected::needToCheck( $team ) ) {
			return;
		}

		$team_account_id = $team->get( 'account_id' );

		// Validate if the team account ID is an integer. If so, convert to int from string.
		$team_account_id = filter_var( $team_account_id, FILTER_VALIDATE_INT );

		// Validate if the POSTed account_id is an integer.
		if ( ! $team_account_id ) {
			$team->set(
				IsTeamConnected::KEY,
				false
			);
			$team->set( IsTeamConnected::STATUS_KEY, 'error' );

			return false;
		}

		$r = \trustedlogin_connector()->getApiHandler(
			$team_account_id,
			'',
			$team
		)->verify(
			$team_account_id
		);
		if ( ! is_wp_error( $r ) ) {
			$team = IsTeamConnected::setConnected( $team );
			$team->set( IsTeamConnected::STATUS_KEY, $r->status );
			$team->set( 'name', $r->name );
		} else {
			$team->set(
				IsTeamConnected::KEY,
				false
			);
			$team->set( IsTeamConnected::STATUS_KEY, 'error' );
			$team->set( 'message', $r->get_error_message() );
		}

		return ! is_wp_error( $r );
	}

	protected function createResponse( SettingsApi $settingsApi ) {
		return rest_ensure_response(
			$settingsApi->toResponseData()
		);
	}
}
