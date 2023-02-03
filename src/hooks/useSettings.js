import { createContext, useContext, useState, useMemo, useEffect } from "react";
import teamFields from "../components/teams/teamFields";
import ViewProvider from "./useView";

const defaultSettings = {
  //teams
  teams: [],
  //Integrations
  integrations: {
    helpscout: false,
  },
  //Has the token for account managment
  //Generally, this is not needed.
  session: { hasAppToken: false },
  //These are older ways of doing things. We should remove them.
  isConnected: false,
  hasOnboarded: true,
};

const emptyTeam = {
  account_id: "",
  private_key: "",
  public_key: "",
  helpdesk: "",
  approved_roles: [],
  helpdesk_settings: [],
};
const SettingsContext = createContext(defaultSettings);

/**
 * This hook handles setting state.
 */
export const useSettings = () => {
  const [notice, setNotice] = useState(() => {
    return {
      text: "",
      type: "error",
      visible: false,
    };
  });

  const [errorMessage, setErrorMessage] = useState(() => {
    if (
      window &&
      window.tlVendor &&
      window.tlVendor.hasOwnProperty("errorMessage")
    ) {
      return {
        text: window.tlVendor.errorMessage,
        type: "error",
        visible: true,
      };
    }
    return null;
  });

  const { settings, setSettings, api, hasOnboarded, session } =
    useContext(SettingsContext);

  const _updateTeams = (teams, integrations = null) => {
    teams = teams.map((t, i) => {
      return {
        id: i + 1,
        ...t,
      };
    });
    if (integrations) {
      setSettings({
        ...settings,
        teams,
        integrations,
      });
    } else {
      setSettings({ ...settings, teams });
    }
  };

  /**
   * Add a team to settings
   */
  const addTeam = (team, save = false, callback = null) => {
    //It used to be that we didn't know team ID before saving.
    //now we do
    if (!team.id) {
      //backwards compat for now
      team = Object.assign(emptyTeam, {
        ...team,
        id: settings.teams.length + 1,
      });
    }
    console.log({ addTeam: team });
    const teams = [...settings.teams, team];
    console.log({ addTeam: teams });

    if (!save) {
      setSettings({ ...settings, teams });
      if (callback) {
        callback(team);
      }
      return;
    }
    //Save
    api.updateSettings({ teams }).then(({ teams }) => {
      //Update team (new teams should get new fields server-side)
      _updateTeams(teams);
      if (callback) {
        callback(team);
      }
    });
  };

  /**
   * Remove a team.
   */
  const removeTeam = (id, callback = null) => {
    const teams = settings.teams.filter((team) => team.id !== id);
    api
      .updateSettings({
        ...settings,
        teams: settings.teams.filter((team) => team.id !== id),
      })
      .then(({ teams }) => {
        console.log({ teams });
        _updateTeams(teams);
        setNotice({
          text: "Team deleted",
          type: "success",
          visible: true,
        });
        if (callback) {
          callback();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /**
   * Update one team in settings
   */
  const setTeam = (team, save = false) => {
    const teams = settings.teams.map((t) => {
      if (t.id === team.id) {
        return team;
      }
      return t;
    });

    if (!save) {
      setSettings({
        ...settings,
        teams,
      });
      return;
    }

    api
      .updateSettings({
        ...settings,
        teams,
      })
      .then(({ teams }) => {
        _updateTeams(teams);
        setNotice({
          text: "Team Saved",
          type: "sucess",
          visible: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /**
   * Check if there is a team in settings with the given account_id
   */
  const hasTeam = (account_id) => {
    return (
      -1 !== settings.teams.findIndex((team) => team.account_id === account_id)
    );
  };

  /**
   * Get a team from settings settings with the given id
   */
  const getTeam = (id) => {
    return settings.teams.find((team) => team.id === id);
  };

  //Disables/enables save button
  const canSave = useMemo(() => {
    return settings.teams.length > 0;
  }, [settings.teams]);

  const getEnabledHelpDeskOptions = () => {
    let options = [];
    Object.keys(settings.integrations).forEach((helpdesk) => {
      const setting = settings.integrations[helpdesk];
      if (setting && true == setting.enabled) {
        if (settings.integrations[helpdesk]) {
          let helpdeskOption = teamFields.helpdesk.options.find(
            (h) => helpdesk === h.value
          );
          options.push(helpdeskOption);
        }
      }
    });
    return options;
  };

  ///Save all TEAM settings
  const onSave = () => {
    api
      .updateSettings({ teams: settings.teams })
      .then(({ teams }) => {
        _updateTeams(teams);
        setNotice({
          text: "Settings Saved",
          type: "sucess",
          visible: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  ///Save all INTEGRATIONS settings
  const onSaveIntegrationSettings = async ({
    integrations,
    updateState = false,
  }) => {
    return await api
      .updateSettings({ integrations })
      .then(({ integrations }) => {
        if (updateState) {
          setSettings({ ...settings, integrations });
        }
        setNotice({
          text: "Integrations Saved",
          type: "sucess",
          visible: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetTeamIntegration = async (accountId, integration) => {
    return await api
      .resetTeamIntegrations(accountId, integration)
      .then(({ teams, integrations }) => {
        _updateTeams(teams, integrations);
      });
  };

  return {
    settings,
    setSettings,
    addTeam,
    removeTeam,
    setTeam,
    onSave,
    canSave,
    getTeam,
    hasTeam,
    hasOnboarded,
    onSaveIntegrationSettings,
    getEnabledHelpDeskOptions,
    resetTeamIntegration,
    api,
    notice,
    setNotice,
    errorMessage,
    setErrorMessage,
    session,
  };
};

export default function SettingsProvider({
  api,
  hasOnboarded,
  children,
  initialTeams = null,
  initialIntegrationSettings = null,
  session = { hasAppToken: false },
}) {
  const [settings, setSettings] = useState(() => {
    //Load supplied intial state, if supplied,
    //prevents API call.
    //See: https://github.com/trustedlogin/vendor/issues/34
    if (null !== initialTeams || null !== initialIntegrationSettings) {
      let state = defaultSettings;
      if (null !== initialTeams) {
        state.teams = initialTeams;
      }
      if (null !== initialIntegrationSettings) {
        state.integrations = initialIntegrationSettings;
      }

      return state;
    } else {
      return defaultSettings;
    }
  });
  //Get the saved settings
  useEffect(() => {
    //Do NOT get settings if any settings supplied.
    //See: https://github.com/trustedlogin/vendor/issues/34
    if (null !== initialTeams || null !== initialIntegrationSettings) {
      return;
    }
    //No intial settings?
    // get settings from API
    api.getSettings().then(({ teams, integrations }) => {
      setSettings({
        ...settings,
        teams,
        integrations,
      });
    });
  }, [api, setSettings, initialTeams]);

  //Set inital team (index id, not account_id)
  const initialTeam = useMemo(() => {
    if (!initialTeams || !initialTeams.length) {
      return null;
    }
    if (
      window.tlVendor &&
      window.tlVendor.accessKey &&
      window.tlVendor.accessKey.hasOwnProperty("ak_account_id")
    ) {
      let id = initialTeams.findIndex(
        (t) => t.account_id === window.tlVendor.accessKey.ak_account_id
      );
      if (id > -1) {
        return id;
      }
    }
    return initialTeams && 1 === initialTeams.length ? 0 : null;
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        hasOnboarded,
        api,
        session,
      }}>
      <ViewProvider initialTeam={initialTeam}>{children}</ViewProvider>
    </SettingsContext.Provider>
  );
}
