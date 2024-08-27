import { SettingsProvider } from "../hooks/useSettings";
import ViewProvider from "../hooks/useView";
export const testTeam = {
  account_id: "1",
  private_key: "asda",
  public_key: "fsaffff",
  helpdesk: "helpscout",
  approved_roles: [],
  helpdesk_settings: {
    helpscout: {
      secret: "9594aef90fce5450",
      callback:
        "https://trustedlogin.ngrok.io/?trustedlogin=1&action=trustedlogin_webhook&provider=helpscout&ak_account_id=asdsad&_tl_ak_nonce=f8bb651568",
    },
  },
  id: 0,
};
const mockApi = {
  getSettings: async () => {
    return {
      teams: [testTeam],
    };
  },
  updateSettings: async () => {},
};

/**
 * All providers in one.
 *
 * ONLY use for testing.
 */
const TestProvider = ({
  children,
  api = mockApi,
  hasOnboarded = true,
  initialTeams = [testTeam],
  initialIntegrationSettings = null,
}) => (
  <SettingsProvider
    api={api}
    hasOnboarded={hasOnboarded}
    initialTeams={initialTeams}
    initialIntegrationSettings={initialIntegrationSettings}>
    {children}
  </SettingsProvider>
);

export default TestProvider;
