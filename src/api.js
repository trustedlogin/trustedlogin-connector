import apiFetch from "@wordpress/api-fetch";

const namespace = "/trustedlogin/v1";
const path = `${namespace}/settings`;
const connectPath = `${namespace}/connect`;
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

export const exchangeTeamToken = async ({ teamToken, token }) => {
  console.log({ teamToken, token });
  let r = await apiFetch({
    path: `${connectPath}`,
    method: "POST",
    data: { token, exchange: teamToken },
    headers: {
      "Content-Type": "application/json UTF-8",
    },
  });
  return r;
};

/**
 * Make call using new proxy routes
 */
export const fetchWithProxyRoute = ({
  data,
  proxyRoute,
  method,
  type = "teams",
}) => {
  let route = "";
  switch (type) {
    case "teams":
      route = "remote/teams";
      break;
    case "users":
      route = "remote/users";
      break;

    default:
      throw new Error("Invalid type for proxy route");
      break;
  }
  return apiFetch({
    path: `${namespace}/${route}`,
    method,
    headers: {
      "Content-Type": "application/json UTF-8",
      //expect JSON response
      Accept: "application/json",
    },
    data: {
      tl_route: proxyRoute,
      tl_data: data,
    },
  });
};
export default {
  updateSettings,
  getSettings,
  resetTeamIntegrations,
  resetEncryptionKeys,
  exchangeTeamToken,
};
