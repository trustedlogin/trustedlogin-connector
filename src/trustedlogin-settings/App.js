import { __ } from "@wordpress/i18n";
import { StrictMode } from "react";
import TrustedLoginSettings from "../components/TrustedLoginSettings";
import SettingsProvider from "../hooks/useSettings";
import TsTest from "./TsTest";

export default function App({
  getSettings,
  updateSettings,
  resetTeamIntegrations,
  resetEncryptionKeys,
  hasOnboarded,
  initialTeams = null,
  initialIntegrationSettings = null,
  session = { hasAppToken: false },
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
        }}
        session={session}>
        <TsTest>
          <TrustedLoginSettings />
        </TsTest>
      </SettingsProvider>
    </StrictMode>
  );
}
