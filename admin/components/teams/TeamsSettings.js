import { useMemo } from "react";
import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import { EditTeam } from "../Teams";
import TeamsList from "./TeamsList";

const TeamsSettings = () => {
  const { currentView, setCurrentView, currentTeam } = useView();
  const { setTeam, settings, getTeam } = useSettings();

  const team = useMemo(() => {
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

  return <TeamsList />;
};

export default TeamsSettings;