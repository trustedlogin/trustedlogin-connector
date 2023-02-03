import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register } from '@wordpress/data';
import { API_SETTINGS_PATH  } from '../api';

export type TeamState = {
    teams: Teams;
    currentTeamId: number;
};
export interface Team {
    account_id: number;
  private_key: string;
  public_key: string;
  helpdesk: string;
  approved_roles: [];
  helpdesk_settings: [];
}
export type Teams = Team[];


interface Action  {
    data: any;
    type: string;

}
const DEFAULT_STATE:TeamState = {
    teams: [],
    currentTeamId: 0,
};

const actions = {
    addTeam: (team:Team): Action => {
        return {
            type: 'ADD_TEAM',
            data:team,
        };

    },
    setCurrentTeam: (teamId:number):Action => {
        return {
            type: 'SET_CURRENT_TEAM',
            data:teamId,
        };
    },

    fetchFromAPI( path: string ):Action {
        return {
            type: 'FETCH_FROM_API',
            data: path,
        };
    },
};

const store = createReduxStore( 'tl.teams', {
    reducer( state = DEFAULT_STATE, action:Action ) {
        switch ( action.type ) {
            case 'ADD_TEAM':

                return {
                    ...state,
                    teams: [
                        ...state.teams,
                        action.data,
                    ]


                };
            case 'SET_CURRENT_TEAM':
                return {
                    ...state,
                    currentTeamId: action.data,
                };
        }

        return state;
    },

    actions,

    selectors: {
        getTeam( state:TeamState, teamAccountId:number ) {
            return state.teams.find( (team) => team.account_id === teamAccountId );
        },
        getTeams( state:TeamState ) {
            return state.teams;
        },
        getCurrentTeamId( state:TeamState ) {
            return state.currentTeamId;
        },
        getCurrentTeam( state:TeamState ) {
            return state.teams.find( (team) => team.account_id === state.currentTeamId );
        }
    },

    controls: {
        FETCH_FROM_API( action:Action ) {
            return apiFetch( { path: action.data } );
        },
    },

    resolvers: {
        *getTeams(  ) {
            //@ts-ignore
            const response = yield actions.fetchFromAPI( API_SETTINGS_PATH );
            console.log({response});
            //@ts-ignore
            return actions.setTeam( response.teams );
        },
    },
} );

register( store );
