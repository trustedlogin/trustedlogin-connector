import { __ } from "@wordpress/i18n";
import { useView } from "../hooks/useView";
import Layout, { TopBar } from "../components/Layout";
import { OnboardingLayout } from "../components/Onboarding";
import { useSettings } from "../hooks/useSettings";
import { useMemo } from "react";
import NoTeams from "./teams/NoTeams";
import AddTeam from "./teams/AddTeam";
import TeamsSettings from "../components/teams/TeamsSettings";
import GeneralSettings from "./GeneralSettings";
import IntegrationSettings from "./IntegrationSettings";
import { PageError } from "./Errors";
import Connector from "./connect";
/**
 * TrustedLogin Settings screen
 */
export default function TrustedLoginSettings() {
  const { currentView, setCurrentView } = useView();
  const { settings, addTeam, errorMessage, setErrorMessage } = useSettings();
  const teams = useMemo(() => {
    return settings && settings.hasOwnProperty("teams") ? settings.teams : [];
  }, [settings]);

  //The non-default views here are those withOUT a TopBar
  switch (currentView) {
    case "connect":
      const hasTokens = tlVendor.connect.tokens.length > 0;
      return (
        <Connector
          loginUrl={window.tlVendor.connect.login}
          connected={hasTokens}
          connectedAccounts={[]}
          notConnectedAccounts={tlVendor.connect.tokens}
        />
      );
    case "onboarding":
      //For now, only show step 2
      return <OnboardingLayout step={2} singleStepMode={true} />;
    case "teams/new":
      return (
        <AddTeam
          onSave={(newTeam) => {
            addTeam(newTeam);
            onSave();
            setCurrentView("teams");
          }}
        />
      );
    case "teams":
      if (!teams.length) {
        return (
          <NoTeams
            onClick={() => {
              setCurrentView("teams/new");
            }}
          />
        );
      }

    default:
      //Show primary UI with TopBar if has onboarded
      return (
        <Layout>
          <TopBar status={"Connected"} />
          {errorMessage ? (
            <PageError
              onClick={() => setErrorMessage(null)}
              text={errorMessage.text}
            />
          ) : (
            <>
              {"string" === typeof currentView &&
              currentView.startsWith("teams") ? (
                <TeamsSettings />
              ) : (
                <>
                  {"integrations" === currentView ? (
                    <IntegrationSettings />
                  ) : (
                    <GeneralSettings />
                  )}
                </>
              )}
            </>
          )}
        </Layout>
      );
  }
}
