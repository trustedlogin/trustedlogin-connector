import { useMemo, useState, Fragment, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import { PrimaryButton, SubmitAndCancelButtons } from "../Buttons";
import { ConfigureHelpDesk } from "../integrations/ConfigureIntegration";
import { CenteredLayout, PageHeader } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { __, _x } from "@wordpress/i18n";
import Spinner from "../Spinner";
import { ToastError } from "../Errors";

/**
 * Show list of teams
 *
 * @returns {JSX.Element}
 */
const TeamsList = () => {
  const { settings, removeTeam, loading } = useSettings();
  //Has user clicked delete, but not confirmed?
  const [isDeleting, setIsDeleting] = useState(false);
  //Track team to delete, if confirmed.
  const [teamDeleting, setTeamDeleting] = useState(null);
  const { setCurrentView, setCurrentTeam } = useView();
  const teams = useMemo(() => settings.teams, [settings]);
  const [modalTeam, setModalTeam] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [previousLoading, setPreviousLoading] = useState(false);

  const shouldShowConfigureButton = (team) => {
    return (
      team.helpdesk &&
      ["helpscout", "freescout"].includes(team.helpdesk[0].toLowerCase())
    );
  };

  /**
   * Cancel delete process
   */
  const cancelDelete = () => {
    setIsDeleting(false);
    setTeamDeleting(null);
  };

  /**
   * Completes the deletion of a team
   */
  const completeDelete = () => {
    removeTeam(teamDeleting, () => {
      cancelDelete();
    });
  };

  /**
   * Displays the confirmation and stores ID of team to be deleted
   */
  const startDelete = (teamId) => {
    setIsDeleting(true);
    setTeamDeleting(teamId);
  };

  /**
   * Navigate to the AccessKey View.
   */
  const goToAccessKey = (teamId) => {
    setCurrentTeam(teamId);
    setCurrentView("teams/access_key");
  };

  useEffect(() => {
    if (previousLoading && !loading) {
      const errors = teams.filter((team) => team.status === "error");
      if (errors.length > 0) {
        setErrorMessages(
          errors.map((team) => {
            return {
              message: team.message,
              id: team.id,
              name:
                team.name !== ""
                  ? team.name
                  : _x("Team %s", "trustedlogin-connector").replace("%s", team.id),
              account_id: team.account_id,
            };
          })
        );
      }
    }
    setPreviousLoading(loading);
  }, [loading, previousLoading, teams]);

  return (
    <>
      {loading && <Spinner size={150} />}
      {isDeleting ? (
        <CenteredLayout>
          <>
            <TitleDescriptionLink
              title={__("Are You Sure?", "trustedlogin-connector")}
            />
            <SubmitAndCancelButtons
              onSubmit={completeDelete}
              submitText={__("Delete Team", "trustedlogin-connector")}
              onCancel={cancelDelete}
              link={null}
              linkText={null}
            />
          </>
        </CenteredLayout>
      ) : (
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <PageHeader
            title={__("Teams", "trustedlogin-connector")}
            subTitle={__(
              "Manage your TrustedLogin settings",
              "trustedlogin-connector"
            )}
            Button={() => (
              <>
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
                    {__("Add Team", "trustedlogin-connector")}
                  </>
                </PrimaryButton>
              </>
            )}
          />
          <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow">
            <ul role="list" className="divide-y divide-gray-200 px-5 sm:px-8">
              {teams.map((team) => {
                // Destructure id and helpdesk from team, provide default values in case they're undefined
                const { id = null, helpdesk = [], status, message } = team;

                // Get the first helpdesk, or "helpscout" if helpdesk is an empty array
                const firstHelpDesk =
                  Array.isArray(helpdesk) && helpdesk.length > 0
                    ? helpdesk[0]
                    : "helpscout";

                return (
                  <Fragment key={id}>
                    <ConfigureHelpDesk
                      isOpen={modalTeam === id}
                      setIsOpen={() => {
                        setModalTeam(null);
                      }}
                      team={team}
                      helpDesk={firstHelpDesk}
                    />
                    <li className="py-5 flex flex-col items-center justify-between sm:py-8 sm:flex-row">
                      <div className="flex w-full items-center space-x-5 sm:w-auto">
                        <button
                          onClick={() => goToAccessKey(team.id)}
                          className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-purple-600 text-white text-sm font-medium rounded-lg">
                          {team.name ? team.name.substring(0, 2) : "TL"}
                        </button>
                        <div className="flex flex-row space-x-16 items-center w-full justify-between sm:justify-start">
                          <div className="flex flex-col sm:flex-row sm:items-center max-w-[10rem] sm:max-w-[8rem] md:max-w-none">
                            <div className="flex flex-col">
                              <p
                                className="text-lg font-medium text-gray-900 leading-tight min-w-[6rem]"
                                id="team-option-1-label">
                                {team.name
                                  ? team.name
                                  : _x(
                                      "Team {id}",
                                      "{id} is replaced dynamically; do not translate",
                                      "trustedlogin-connector"
                                    ).replace("{id}", team.id)}
                              </p>
                              <p
                                className="text-sm text-gray-500"
                                id="team-option-1-description">
                                #{team.account_id}
                              </p>
                            </div>
                            {status === "error" && (
                              <>
                                <div
                                  className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 ml-4"
                                  role="alert">
                                  <p className="font-bold">
                                    {__(
                                      "Oops something went wrong",
                                      "trustedlogin-connector"
                                    )}
                                    .
                                  </p>
                                  <p>{message}.</p>
                                </div>
                              </>
                            )}
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
                              {__(
                                "Configure Help Desk",
                                "trustedlogin-connector"
                              )}
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              setCurrentView("teams/edit");
                              setCurrentTeam(team.id);
                            }}
                            className="text-sm text-blue-tl hover:text-navy-tl p-2">
                            {__("Edit", "trustedlogin-connector")}
                          </button>
                          <button
                            onClick={() => startDelete(team.id)}
                            className="text-sm text-red-500 hover:text-red-800 p-2">
                            {__("Delete", "trustedlogin-connector")}
                          </button>
                        </div>
                      </div>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {!loading &&
        errorMessages.map((error, index) => (
          <ToastError
            key={index}
            heading={__("Oops something went wrong with %s", "trustedlogin-connector").replace("%s", error.name)}
            text={error.message}
            isDismissible={true}
          />
        ))}
    </>
  );
};

export default TeamsList;
