import { __ } from "@wordpress/i18n";
import { StrictMode } from "react";
import TrustedLoginSettings from "../components/TrustedLoginSettings";
import { SettingsProvider } from "../hooks/useSettings";

export default function App({
  getSettings,
  updateSettings,
  resetTeamIntegrations,
  resetEncryptionKeys,
  hasOnboarded,
  initialTeams = null,
  initialIntegrationSettings = null,
}) {
  return (
    <StrictMode>
      <SettingsProvider
        hasOnboarded={hasOnboarded}
        initialTeams={initialTeams}
        initialIntegrationSettings={initialIntegrationSettings}
        api={{
          getSettings,
          updateSettings,
          resetTeamIntegrations,
          resetEncryptionKeys,
        }}>
        <>
          <TrustedLoginSettings />
        </>
      </SettingsProvider>
    </StrictMode>
  );
}
