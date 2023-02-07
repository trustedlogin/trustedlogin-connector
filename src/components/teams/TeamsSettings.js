import { useMemo } from "react";
import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import EditTeam from "../teams/EditTeam";

import TeamsList from "./TeamsList";
import AccessKeyForm from "../AccessKeyForm";
import AdminTeam from "./AdminTeam";
const TeamsSettings = () => {
  const { currentView, setCurrentView, currentTeam } = useView();
  const { setTeam, settings, getTeam } = useSettings();

  const team = useMemo(() => {
    //Often 0 === currenTeam, since first team saved has id O.
    if (false !== currentTeam) {
      return getTeam(currentTeam);
    }
    return null;
  }, [getTeam, currentTeam]);

  if ("teams/edit" === currentView) {
    return (
      <EditTeam
        team={team}
        onClickSave={(updateTeam) => {
          setTeam(
            {
              ...updateTeam,
              id: team.hasOwnProperty("id")
                ? team.id
                : settings.team.length + 1,
            },
            true
          );
          setCurrentView("teams");
        }}
      />
    );
  }

  if ("teams/admin" === currentView) {
    return <AdminTeam />;
  }

  if ("teams/access_key" === currentView) {
    return <AccessKeyForm initialAccountId={currentTeam} />;
  }

  return <TeamsList />;
};

export default TeamsSettings;
