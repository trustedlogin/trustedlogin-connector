import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import teamFields from "../components/teams/teamFields";
import ViewProvider from "./useView";

/**
 * Default settings for the application.
 * @type {Object}
 */
const defaultSettings = {
  isConnected: false,
  hasOnboarded: true,
  teams: [],
  integrations: {
    helpscout: false,
  },
};

/**
 * Template for an empty team.
 * @type {Object}
 */
const emptyTeam = {
  account_id: "",
  private_key: "",
  public_key: "",
  helpdesk: "",
  approved_roles: [],
  helpdesk_settings: [],
};

/**
 * Context for managing settings state.
 * @type {React.Context}
 */
const SettingsContext = createContext(defaultSettings);

/**
 * Custom hook to access settings context.
 * @returns {Object} settings context
 * @throws {Error} if used outside of SettingsProvider
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

/**
 * Provider component to manage settings state.
 * @param {Object} props - The component props
 * @param {Object} props.api - The API object for interacting with backend
 * @param {ReactNode} props.children - The child components
 * @param {Array} [props.initialTeams] - Initial teams data
 * @param {Object} [props.initialIntegrationSettings] - Initial integration settings data
 */
export const SettingsProvider = ({
  api,
  children,
  initialTeams = null,
  initialIntegrationSettings = null,
}) => {
  /**
   * State for managing settings.
   * @type {[Object, Function]}
   */
  const [settings, setSettings] = useState(() => {
    const state = { ...defaultSettings };
    if (initialTeams !== null) state.teams = initialTeams;
    if (initialIntegrationSettings !== null)
      state.integrations = initialIntegrationSettings;
    return state;
  });

  /**
   * Effect to fetch settings data from API if initial data is not provided.
   * Dependencies: [api, initialTeams, initialIntegrationSettings]
   */
  useEffect(() => {
    if (initialTeams === null && initialIntegrationSettings === null) {
      api
        .getSettings()
        .then(({ teams, integrations }) => {
          setSettings({
            ...settings,
            teams,
            integrations,
          });
        })
        .catch((error) => console.error("Error fetching settings:", error));
    }
  }, [api, initialTeams, initialIntegrationSettings]);

  /**
   * Memoized value to determine the initial team based on provided initial data.
   * @type {number|null}
   */
  const initialTeam = useMemo(() => {
    if (!initialTeams || !initialTeams.length) return null;
    if (window.tlVendor?.accessKey?.ak_account_id) {
      const id = initialTeams.findIndex(
        (t) => t.account_id === window.tlVendor.accessKey.ak_account_id
      );
      return id > -1 ? id : initialTeams.length === 1 ? 0 : null;
    }
    return initialTeams.length === 1 ? 0 : null;
  }, [initialTeams]);

  /**
   * State for managing loading status.
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(false);

  /**
   * State for managing notification messages.
   * @type {[Object, Function]}
   */
  const [notice, setNotice] = useState({
    text: "",
    type: "error",
    visible: false,
  });

  /**
   * State for managing error messages.
   * @type {[Object|null, Function]}
   */
  const [errorMessage, setErrorMessage] = useState(() => {
    if (window?.tlVendor?.errorMessage) {
      return {
        text: window.tlVendor.errorMessage,
        type: "error",
        visible: true,
      };
    }
    return null;
  });

  /**
   * Helper function to update teams and optionally integrations in the settings state.
   * @param {Array} teams - Array of team objects
   * @param {Object} [integrations=null] - Integrations object
   */
  const _updateTeams = (teams, integrations = null) => {
    const updatedTeams = teams.map((t, i) => ({ id: i + 1, ...t }));
    const newSettings = { ...settings, teams: updatedTeams };
    if (integrations) newSettings.integrations = integrations;
    setSettings(newSettings);
  };

  /**
   * Helper function to apply an error message to a specific team in the settings state.
   * @param {number} teamId - ID of the team to apply the error to
   * @param {Error} error - Error object containing the error message
   */
  const _applyErrorToTeam = useCallback((teamId, error) => {
    setSettings((prevState) => {
      const updatedTeams = prevState.teams.map((team) =>
        team.id === teamId
          ? { ...team, status: "error", message: error.message }
          : team
      );
      return { ...prevState, teams: updatedTeams };
    });
  }, []);

  /**
   * Helper function to perform an action with loading state management and error handling.
   * @param {Function} action - Async function to perform the action
   * @param {Function} [successCallback=null] - Callback function to execute on successful action
   * @param {number} [teamId=null] - ID of the team (optional) for error handling
   */
  const performActionWithLoading = useCallback(
    async (action, successCallback = null, teamId = null) => {
      setLoading(true);
      try {
        const response = await action();
        if (successCallback) successCallback(response);
      } catch (error) {
        if (teamId) _applyErrorToTeam(teamId, error);
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [_applyErrorToTeam]
  );

  /**
   * Initialize settings by fetching data from the API.
   */
  const initializeSettings = useCallback(() => {
    performActionWithLoading(
      () => api.getSettings(),
      (response) => setSettings(response)
    );
  }, [api, performActionWithLoading]);

  /**
   * Add a new team to the settings state.
   * @param {Object} team - Team object to add
   * @param {boolean} [save=false] - Flag to save the team to the backend
   * @param {Function} [callback=null] - Callback function to execute after adding the team
   */
  const addTeam = useCallback(
    (team, save = false, callback = null) => {
      team = { ...emptyTeam, ...team, id: settings.teams.length + 1 };
      const teams = [...settings.teams, team];

      if (!save) {
        setSettings({ ...settings, teams });
        if (callback) callback(team);
        setLoading(false);
        return;
      }

      performActionWithLoading(
        () => api.updateSettings({ ...settings, teams }),
        (response) => {
          _updateTeams(response.teams);
          if (callback) callback(team);
        },
        team.id
      );
    },
    [api, settings, _updateTeams, performActionWithLoading]
  );

  /**
   * Remove a team from the settings state.
   * @param {number} id - ID of the team to remove
   * @param {Function} [callback=null] - Callback function to execute after removing the team
   */
  const removeTeam = useCallback(
    (id, callback = null) => {
      const teams = settings.teams.filter((team) => team.id !== id);
      performActionWithLoading(
        () => api.updateSettings({ ...settings, teams }),
        (response) => {
          _updateTeams(response.teams);
          setNotice({
            text: "Team deleted",
            type: "success",
            visible: true,
          });
          if (callback) callback();
        }
      );
    },
    [api, settings, _updateTeams, performActionWithLoading]
  );

  /**
   * Update a team in the settings state.
   * @param {Object} team - Updated team object
   * @param {boolean} [save=false] - Flag to save the team to the backend
   */
  const setTeam = useCallback(
    (team, save = false) => {
      const teams = settings.teams.map((t) => (t.id === team.id ? team : t));

      if (!save) {
        setSettings({ ...settings, teams });
        setLoading(false);
        return;
      }

      performActionWithLoading(
        () => api.updateSettings({ ...settings, teams }),
        (response) => {
          _updateTeams(response.teams);
          setNotice({
            text: "Team Saved",
            type: "success",
            visible: true,
          });
        },
        team.id
      );
    },
    [api, settings, _updateTeams, performActionWithLoading]
  );

  /**
   * Save the current settings state to the backend.
   */
  const onSave = useCallback(() => {
    performActionWithLoading(
      () => api.updateSettings({ teams: settings.teams }),
      (response) => {
        _updateTeams(response.teams);
        setNotice({
          text: "Settings Saved",
          type: "success",
          visible: true,
        });
      }
    );
  }, [api, settings, _updateTeams, performActionWithLoading]);

  /**
   * Save integration settings to the backend.
   * @param {Object} params - Parameters object
   * @param {Object} params.integrations - Integrations object to save
   * @param {boolean} [params.updateState=false] - Flag to update the state with the response data
   */
  const onSaveIntegrationSettings = useCallback(
    ({ integrations, updateState = false }) => {
      performActionWithLoading(
        () => api.updateSettings({ integrations }),
        (response) => {
          if (updateState)
            setSettings({ ...settings, integrations: response.integrations });
          setNotice({
            text: "Integrations Saved",
            type: "success",
            visible: true,
          });
        }
      );
    },
    [api, settings, performActionWithLoading]
  );

  /**
   * Reset the integration settings for a specific team.
   * @param {string} accountId - Account ID of the team
   * @param {Object} integration - Integration object to reset
   */
  const resetTeamIntegration = useCallback(
    (accountId, integration) => {
      performActionWithLoading(
        () => api.resetTeamIntegrations(accountId, integration),
        (response) => {
          _updateTeams(response.teams, response.integrations);
        }
      );
    },
    [api, _updateTeams, performActionWithLoading]
  );

  /**
   * Get a team by its ID.
   * @param {number} id - ID of the team to retrieve
   * @returns {Object|null} - Team object or null if not found
   */
  const getTeam = useCallback(
    (id) => settings.teams.find((team) => team.id === id),
    [settings.teams]
  );

  /**
   * Get a list of enabled helpdesk options based on the integration settings.
   * @returns {Array} - Array of enabled helpdesk options
   */
  const getEnabledHelpDeskOptions = useCallback(() => {
    return Object.keys(settings.integrations).reduce((options, helpdesk) => {
      const setting = settings.integrations[helpdesk];
      if (setting && setting.enabled) {
        const helpdeskOption = teamFields.helpdesk.options.find(
          (h) => helpdesk === h.value
        );
        options.push(helpdeskOption);
      }
      return options;
    }, []);
  }, [settings.integrations]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        initializeSettings,
        addTeam,
        removeTeam,
        setTeam,
        onSave,
        onSaveIntegrationSettings,
        resetTeamIntegration,
        getTeam,
        getEnabledHelpDeskOptions,
      }}>
      <ViewProvider initialTeam={initialTeam}>{children}</ViewProvider>
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
