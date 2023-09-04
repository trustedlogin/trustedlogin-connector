import apiFetch from "@wordpress/api-fetch";

const path = "/trustedlogin/v1/settings";
export const getSettings = async () => {
  let settings = await apiFetch({ path }).catch((e) => console.log(e));
  if (settings.teams) {
    settings.teams = settings.teams.map((team, id) => {
      if (!team.helpdesk) {
        team.helpdesk = "helpscout";
      }

      return {
        id,
        ...team,
      };
    });
  }
  return settings;
};

export const updateSettings = async ({ teams = null, integrations = null }) => {
  let data = {};
  if (teams) {
    data.teams = teams;
  } else if (integrations) {
    data.integrations = integrations;
  }
  let r = await apiFetch({
    path: data.integrations ? `${path}/global` : path,
    method: "POST",
    data,
  });
  return r;
};

export const updateLoggingSettings = async (errorLogging) => {
  const r = await apiFetch({
    path: `${path}/logging`,
    method: "POST",
    data: { error: errorLogging },
  });
  return r;
};

export const resetTeamIntegrations = async (accountId, integration) => {
  let r = await apiFetch({
    path: `${path}/team/reset`,
    method: "POST",
    data: { integration, accountId },
  });
  return r;
};

export const resetEncryptionKeys = async () => {
  let r = await apiFetch({
    path: `${path}/encryption/reset`,
    method: "POST",
  });
  return r;
};

export default {
  updateSettings,
  getSettings,
  resetTeamIntegrations,
  resetEncryptionKeys,
};
