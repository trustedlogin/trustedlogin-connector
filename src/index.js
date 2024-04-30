/**
 * This is the entry point for the webhook/integration return page
 */

import React from "react";
import { render } from "react-dom";
import api from "./api";
import {
  hasOnboarded,
  initialTeams,
  initialIntegrationSettings,
} from "./trustedlogin-settings/setupVars";
import SettingsProvider from "./hooks/useSettings";
import AccessKeyForm from "./components/AccessKeyForm";
import { useView } from "./hooks/useView";

window.tlInitialView = "teams/access_key";

const App = () => {
  const { currentTeam } = useView();

  return <AccessKeyForm minimal={true} initialAccountId={currentTeam} />;
};
render(
  <SettingsProvider
    hasOnboarded={hasOnboarded}
    initialTeams={initialTeams}
    initialIntegrationSettings={initialIntegrationSettings}
    api={api}>
    <>
      <App />
    </>
  </SettingsProvider>,
  document.getElementById("root")
);
