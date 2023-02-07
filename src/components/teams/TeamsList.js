import { useMemo, useState, Fragment } from "react";
import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import { PrimaryButton, SubmitAndCanelButtons } from "../Buttons";
import { ConfigureHelscout } from "../integrations/ConfigureIntegration";
import { CenteredLayout, PageHeader, SettingsPageLayout } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { __ } from "@wordpress/i18n";
import TablePage from "../TablePage";
/**
 * Show list of teams
 *
 * @returns {JSX.Element}
 */
const TeamsList = () => {
  const { settings, removeTeam } = useSettings();
  //Has user clicked delete, but not confirmed?
  const [isDeleting, setIsDeleting] = useState(false);
  //Track team to delete, if confirmed.
  const [teamDeleting, setTeamDeleting] = useState(null);
  const { setCurrentView, setCurrentTeam } = useView();
  const teams = useMemo(() => settings.teams, [settings]);
  const [modalTeam, setModalTeam] = useState(null);
  const shouldShowConfigureButton = (team) => {
    return team.helpdesk && team.helpdesk.includes("helpscout");
  };

  /**
   * Cancel delete process
   */
  function cancelDelete() {
    setIsDeleting(false);
    setTeamDeleting(null);
  }

  /**
   * Completes the deletion of a team
   */
  function completeDelete() {
    removeTeam(teamDeleting, () => {
      cancelDelete();
    });
  }

  /**
   * Displays the confirmation and stores ID of team to be deleted
   */
  function startDelete(teamId) {
    setIsDeleting(true);
    setTeamDeleting(teamId);
  }

  function goToAccessKey(teamId) {
    setCurrentTeam(teamId);
    setCurrentView("teams/access_key");
  }

  /**
   * Prepares the items to be displayed in the table
   */
  const items = useMemo(() => {
    if (!teams.length) {
      return [];
    }
    return teams.map((team) => {
      return {
        ...team,
        id: team.account_id,
        name: team.name,
      };
    });
  }, [teams]);

  return (
    <>
      <>
        {teams.map((team) => (
          <Fragment key={team.id}>
            <ConfigureHelscout
              isOpen={modalTeam === team.id}
              setIsOpen={() => {
                setModalTeam(null);
              }}
              team={team}
            />
          </Fragment>
        ))}
      </>
      {isDeleting ? (
        <CenteredLayout>
          <>
            <TitleDescriptionLink title={__("Are You Sure?")} />

            <SubmitAndCanelButtons
              onSubmit={completeDelete}
              submitText={"Delete Team"}
              onCancel={cancelDelete}
            />
          </>
        </CenteredLayout>
      ) : (
        <TablePage
          title={"Teams"}
          subTitle={"Manage your TrustedLogin settings"}
          items={items}
          SearchArea={() => (
            <>
              <div>
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative h-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full h-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:text-sm sm:py-2"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
              <PrimaryButton onClick={() => setCurrentView("teams/new")}>
                <>
                  <svg
                    className="mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24">
                    <g fill="none">
                      <path
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"></path>
                    </g>
                  </svg>
                  Add Team
                </>
              </PrimaryButton>
            </>
          )}
          ActionArea={({ id, item }) => {
            const team = item;
            return (
              <Fragment key={id}>
                {shouldShowConfigureButton(team) ? (
                  <button
                    onClick={() => {
                      setModalTeam(team.id);
                    }}
                    className="text-sm text-blue-tl hover:text-navy-tl p-2">
                    Configure
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    setCurrentView("teams/edit");
                    setCurrentTeam(team.id);
                  }}
                  className="text-sm text-blue-tl hover:text-navy-tl p-2">
                  Edit
                </button>
                <button
                  onClick={() => {
                    setCurrentView("teams/admin");
                    setCurrentTeam(team.id);
                  }}
                  className="text-sm text-blue-tl hover:text-navy-tl p-2">
                  {__("Admin Team")}
                </button>
                <button
                  onClick={() => startDelete(team.id)}
                  className="text-sm text-red-500 hover:text-red-800 p-2">
                  Delete
                </button>
              </Fragment>
            );
          }}></TablePage>
      )}
    </>
  );
};
export default TeamsList;
