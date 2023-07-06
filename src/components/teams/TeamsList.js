import { useMemo, useState, Fragment } from "react";
import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import { PrimaryButton, SubmitAndCanelButtons } from "../Buttons";
import {ConfigureHelpDesk} from "../integrations/ConfigureIntegration";
import { CenteredLayout, PageHeader } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { __ } from "@wordpress/i18n";
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
    return team.helpdesk && ["helpscout", "freescout"].includes(team.helpdesk[0].toLowerCase());
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

  return (
    <>
      <>
        {teams.map((team) => {
          return (
              <Fragment key={team.id}>
                <ConfigureHelpDesk
                    isOpen={modalTeam === team.id}
                    setIsOpen={() => {
                      setModalTeam(null);
                    }}
                    team={team}
                    helpDesk={team.helpdesk[0]}
                />
              </Fragment>
          );
        })}
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
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <PageHeader
            title={"Teams"}
            subTitle={"Manage your TrustedLogin settings"}
            Button={() => (
              <>
                <div>
                  <label htmlFor="search" className="sr-only">
                    {__("Search", "trustedlogin-vendor")}
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
                    {__("Add Team", "trustedlogin-vendor")}
                  </>
                </PrimaryButton>
              </>
            )}
          />
          <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow">
            <ul role="list" className="divide-y divide-gray-200 px-5 sm:px-8">
              {teams.map((team) => {
                return (
                  <li
                    key={team.id}
                    className="py-5 flex flex-col items-center justify-between sm:py-8 sm:flex-row">
                    <div className="flex w-full items-center space-x-5 sm:w-auto">
                      <button
                        onClick={() => goToAccessKey(team.id)}
                        className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-purple-600 text-white text-sm font-medium rounded-lg">
                        {team.name ? team.name.substring(0, 2) : "TL"}
                      </button>
                      <div className="flex flex-row space-x-16 items-center w-full justify-between sm:justify-start">
                        <div className="flex flex-col max-w-[10rem] sm:max-w-[8rem] md:max-w-none">
                          <p
                            className="text-lg font-medium text-gray-900 leading-tight min-w-[6rem]"
                            id="team-option-1-label">
                            {team.name ? team.name : team.account_id}
                          </p>
                          <p
                            className="text-sm text-gray-500"
                            id="team-option-1-description">
                            {team.account_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-5 w-full mt-4 justify-between sm:w-auto sm:mt-0">
                      <div className="flex items-center space-x-6">
                        {shouldShowConfigureButton(team) ? (
                          <button
                            onClick={() => {
                              setModalTeam(team.id);
                            }}
                            className="text-sm text-blue-tl hover:text-navy-tl p-2">
                            {__("Configure", "trustedlogin-vendor")}
                          </button>
                        ) : null}

                        <button
                          onClick={() => {
                            setCurrentView("teams/edit");
                            setCurrentTeam(team.id);
                          }}
                          className="text-sm text-blue-tl hover:text-navy-tl p-2">
                          {__("Edit", "trustedlogin-vendor")}
                        </button>
                        <button
                          onClick={() => startDelete(team.id)}
                          className="text-sm text-red-500 hover:text-red-800 p-2">
                          {__("Delete", "trustedlogin-vendor")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
export default TeamsList;
