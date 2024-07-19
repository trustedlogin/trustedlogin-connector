import { __ } from "@wordpress/i18n";
import { useView } from "../hooks/useView";
import Layout, { TopBar } from "../components/Layout";
import { OnboardingLayout } from "./Onboarding";
import { useSettings } from "../hooks/useSettings";
import { useEffect, useMemo } from "react";
import NoTeams from "./teams/NoTeams";
import AddTeam from "./teams/AddTeam";
import TeamsSettings from "../components/teams/TeamsSettings";
import GeneralSettings from "./GeneralSettings";
import IntegrationSettings from "./IntegrationSettings";
import { PageError } from "./Errors";
import Spinner from "./Spinner";
/**
 * TrustedLogin Settings screen
 */
export default function TrustedLoginSettings() {
  const { currentView, setCurrentView } = useView();
  const { settings, addTeam, errorMessage, setErrorMessage, loading } =
    useSettings();
  const teams = useMemo(() => {
    return settings && settings.hasOwnProperty("teams") ? settings.teams : [];
  }, [settings]);

  //The non-default views here are those withOUT a TopBar
  if (currentView === "onboarding") {
    //For now, only show step 2
    return <OnboardingLayout step={2} singleStepMode={true} />;
  } else if (currentView === "teams/new") {
    return (
      <AddTeam
        onSave={(newTeam) => {
          addTeam(newTeam);
          onSave();
          setCurrentView("teams");
        }}
        loading={loading}
      />
    );
  } else if (currentView === "teams") {
    if (!teams.length) {
      return (
        <NoTeams
          onClick={() => {
            setCurrentView("teams/new");
          }}
        />
      );
    }
    //Show primary UI with TopBar if has onboarded
    return (
      <Layout>
        <TopBar status={"Connected"} />
        {loading && <Spinner size={150} />}
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
  } else {
    //Show primary UI with TopBar if has onboarded
    return (
      <Layout>
        <TopBar status={"Connected"} />
        {loading && <Spinner size={150} />}
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
