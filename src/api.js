import apiFetch from "@wordpress/api-fetch";
const path = "/trustedlogin/v1/settings";

export const getSettings = async () => {
  try {
    const response = await apiFetch({ path });
    if (response.teams) {
      response.teams = response.teams.map((team, id) => {
        if (!team.helpdesk) {
          team.helpdesk = "helpscout";
        }
        return {
          id,
          ...team,
        };
      });
    }
    return response;
  } catch (error) {
    console.error("getSettings: API error:", error);
    throw error;
  }
};

export const updateSettings = async ({ teams = null, integrations = null }) => {
  const data = {};
  if (teams) {
    data.teams = teams;
  } else if (integrations) {
    data.integrations = integrations;
  }
  try {
    const response = await apiFetch({
      path: data.integrations ? `${path}/global` : path,
      method: "POST",
      data,
    });
    return response;
  } catch (error) {
    console.error("updateSettings: API error:", error);
    throw error;
  }
};

export const updateLoggingSettings = async (errorLogging) => {
  try {
    const response = await apiFetch({
      path: `${path}/logging`,
      method: "POST",
      data: { error: errorLogging },
    });
    return response;
  } catch (error) {
    console.error("updateLoggingSettings: API error:", error);
    throw error;
  }
};

export const resetTeamIntegrations = async (accountId, integration) => {
  try {
    const response = await apiFetch({
      path: `${path}/team/reset`,
      method: "POST",
      data: { integration, accountId },
    });
    return response;
  } catch (error) {
    console.error("resetTeamIntegrations: API error:", error);
    throw error;
  }
};

export const resetEncryptionKeys = async () => {
  try {
    const response = await apiFetch({
      path: `${path}/encryption/reset`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("resetEncryptionKeys: API error:", error);
    throw error;
  }
};

export default {
  updateSettings,
  getSettings,
  resetTeamIntegrations,
  resetEncryptionKeys,
};
