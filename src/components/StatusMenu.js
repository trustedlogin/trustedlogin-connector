import { useSettings } from "../hooks/useSettings";
import { useView } from "../hooks/useView";

import { useMemo, Fragment } from "react";
import { __, _x } from "@wordpress/i18n";
import { Popover } from "@headlessui/react";

const useConnectCount = () => {
    const { settings } = useSettings();

    const teamsConnected = useMemo(() => {
        let count = 0;
        if (settings && settings.teams) {
            settings.teams.forEach((team) => {
                if (team.connected) {
                    count++;
                }
            });
        }
        return count;
    }, [settings]);

    const totalTeams = useMemo(() => {
        if (settings && settings.teams) {
            return settings.teams.length;
        }
        return 0;
    }, [settings]);

    return {
        totalTeams,
        teamsConnected,
    };
};

const TeamMenuItem = ({ team, toggleStatus }) => {
    const { setCurrentView, setCurrentTeam } = useView();
    const onClick = (e) => {
        e.preventDefault();
        setCurrentTeam(team.id);
        setCurrentView("teams/edit");
        toggleStatus();
    };
    return (
        <li className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 bg-purple-600 text-white text-sm font-medium rounded-lg">
                    FI
                </div>
                <div className="flex flex-col max-w-[10rem] sm:max-w-[8rem] md:max-w-none">
                    <p
                        className="text-sm font-medium text-gray-900 min-w-[6rem]"
                        id="team-option-1-label">
                        {team.name ? team.name : _x("Team {id}", '{id} is replaced dynamically; do not translate', "trustedlogin-connector").replace('{id}', team.id ) }
                    </p>
                </div>
            </div>
            {team.connected ? (
                <button
                    onClick={onClick}
                    className="inline-flex items-center px-2.5 py-1.5 h-7 rounded-full text-xs font-medium border text-gray-900 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
                    <svg
                        className="-ml-0.5 mr-1.5 h-2 w-2 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                    </svg>
                    <span className="border-r pr-2 mr-2 leading-none">{__("Connected", "trustedlogin-connector")}</span>
                    <svg
                        className="text-gray-500"
                        width="12"
                        height="13"
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.555 5.50001L10.069 5.33501C9.98026 5.02416 9.85612 4.72453 9.69901 4.44201L10.633 3.27401C10.7099 3.1779 10.7486 3.05682 10.7418 2.93394C10.735 2.81106 10.6831 2.69501 10.596 2.60801L9.88901 1.90001C9.80201 1.81296 9.68596 1.76105 9.56308 1.75422C9.4402 1.7474 9.31911 1.78613 9.22301 1.86301L8.05501 2.80001C7.77249 2.6429 7.47286 2.51876 7.16201 2.43001L7.00001 0.945009C6.98641 0.82215 6.92779 0.70868 6.83546 0.626501C6.74312 0.544323 6.62362 0.499259 6.50001 0.500009H5.50001C5.3764 0.499259 5.2569 0.544323 5.16456 0.626501C5.07223 0.70868 5.0136 0.82215 5.00001 0.945009L4.83801 2.43101C4.52716 2.51976 4.22753 2.6439 3.94501 2.80101L2.77701 1.86701C2.6809 1.79013 2.55982 1.7514 2.43694 1.75822C2.31406 1.76505 2.19801 1.81696 2.11101 1.90401L1.40001 2.61101C1.31296 2.69801 1.26105 2.81406 1.25422 2.93694C1.2474 3.05982 1.28613 3.1809 1.36301 3.27701L2.30001 4.44501C2.1429 4.72753 2.01876 5.02716 1.93001 5.33801L0.445009 5.50001C0.32215 5.5136 0.20868 5.57223 0.126501 5.66456C0.0443225 5.7569 -0.000740652 5.8764 9.21001e-06 6.00001V7.00001C-0.000740652 7.12362 0.0443225 7.24312 0.126501 7.33546C0.20868 7.42779 0.32215 7.48641 0.445009 7.50001L1.93101 7.66501C2.01976 7.97586 2.1439 8.27549 2.30101 8.55801L1.36701 9.72301C1.29013 9.81911 1.2514 9.9402 1.25822 10.0631C1.26505 10.186 1.31696 10.302 1.40401 10.389L2.11101 11.096C2.19801 11.1831 2.31406 11.235 2.43694 11.2418C2.55982 11.2486 2.6809 11.2099 2.77701 11.133L3.94501 10.2C4.22753 10.3571 4.52716 10.4813 4.83801 10.57L5.00001 12.055C5.0136 12.1779 5.07223 12.2913 5.16456 12.3735C5.2569 12.4557 5.3764 12.5008 5.50001 12.5H6.50001C6.62362 12.5008 6.74312 12.4557 6.83546 12.3735C6.92779 12.2913 6.98641 12.1779 7.00001 12.055L7.16501 10.569C7.47586 10.4803 7.77549 10.3561 8.05801 10.199L9.22601 11.133C9.32211 11.2099 9.4432 11.2486 9.56608 11.2418C9.68896 11.235 9.80501 11.1831 9.89201 11.096L10.599 10.389C10.6861 10.302 10.738 10.186 10.7448 10.0631C10.7516 9.9402 10.7129 9.81911 10.636 9.72301L9.70001 8.55501C9.85712 8.27249 9.98126 7.97286 10.07 7.66201L11.555 7.50001C11.6779 7.48641 11.7913 7.42779 11.8735 7.33546C11.9557 7.24312 12.0008 7.12362 12 7.00001V6.00001C12.0008 5.8764 11.9557 5.7569 11.8735 5.66456C11.7913 5.57223 11.6779 5.5136 11.555 5.50001ZM6.00001 8.50001C5.60445 8.50001 5.21777 8.38271 4.88887 8.16295C4.55997 7.94319 4.30363 7.63083 4.15225 7.26538C4.00087 6.89992 3.96127 6.49779 4.03844 6.10983C4.11561 5.72187 4.30609 5.3655 4.5858 5.0858C4.8655 4.80609 5.22187 4.61561 5.60983 4.53844C5.99779 4.46127 6.39992 4.50087 6.76538 4.65225C7.13083 4.80363 7.44319 5.05997 7.66295 5.38887C7.88271 5.71777 8.00001 6.10445 8.00001 6.50001C8.00001 7.03044 7.7893 7.53915 7.41422 7.91422C7.03915 8.2893 6.53044 8.50001 6.00001 8.50001Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            ) : (
                <button
                    onClick={onClick}
                    className="inline-flex items-center px-2.5 py-1.5 h-7 rounded-full text-xs font-medium border text-gray-900 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
                    <svg
                        className="-ml-0.5 mr-1.5 h-2 w-2 text-red-700"
                        fill="currentColor"
                        viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                    </svg>
                    <span className="border-r pr-2 mr-2 leading-none">{__("Not Connected", "trustedlogin-connector")}</span>
                    <svg
                        className="text-gray-500"
                        width="12"
                        height="13"
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.555 5.50001L10.069 5.33501C9.98026 5.02416 9.85612 4.72453 9.69901 4.44201L10.633 3.27401C10.7099 3.1779 10.7486 3.05682 10.7418 2.93394C10.735 2.81106 10.6831 2.69501 10.596 2.60801L9.88901 1.90001C9.80201 1.81296 9.68596 1.76105 9.56308 1.75422C9.4402 1.7474 9.31911 1.78613 9.22301 1.86301L8.05501 2.80001C7.77249 2.6429 7.47286 2.51876 7.16201 2.43001L7.00001 0.945009C6.98641 0.82215 6.92779 0.70868 6.83546 0.626501C6.74312 0.544323 6.62362 0.499259 6.50001 0.500009H5.50001C5.3764 0.499259 5.2569 0.544323 5.16456 0.626501C5.07223 0.70868 5.0136 0.82215 5.00001 0.945009L4.83801 2.43101C4.52716 2.51976 4.22753 2.6439 3.94501 2.80101L2.77701 1.86701C2.6809 1.79013 2.55982 1.7514 2.43694 1.75822C2.31406 1.76505 2.19801 1.81696 2.11101 1.90401L1.40001 2.61101C1.31296 2.69801 1.26105 2.81406 1.25422 2.93694C1.2474 3.05982 1.28613 3.1809 1.36301 3.27701L2.30001 4.44501C2.1429 4.72753 2.01876 5.02716 1.93001 5.33801L0.445009 5.50001C0.32215 5.5136 0.20868 5.57223 0.126501 5.66456C0.0443225 5.7569 -0.000740652 5.8764 9.21001e-06 6.00001V7.00001C-0.000740652 7.12362 0.0443225 7.24312 0.126501 7.33546C0.20868 7.42779 0.32215 7.48641 0.445009 7.50001L1.93101 7.66501C2.01976 7.97586 2.1439 8.27549 2.30101 8.55801L1.36701 9.72301C1.29013 9.81911 1.2514 9.9402 1.25822 10.0631C1.26505 10.186 1.31696 10.302 1.40401 10.389L2.11101 11.096C2.19801 11.1831 2.31406 11.235 2.43694 11.2418C2.55982 11.2486 2.6809 11.2099 2.77701 11.133L3.94501 10.2C4.22753 10.3571 4.52716 10.4813 4.83801 10.57L5.00001 12.055C5.0136 12.1779 5.07223 12.2913 5.16456 12.3735C5.2569 12.4557 5.3764 12.5008 5.50001 12.5H6.50001C6.62362 12.5008 6.74312 12.4557 6.83546 12.3735C6.92779 12.2913 6.98641 12.1779 7.00001 12.055L7.16501 10.569C7.47586 10.4803 7.77549 10.3561 8.05801 10.199L9.22601 11.133C9.32211 11.2099 9.4432 11.2486 9.56608 11.2418C9.68896 11.235 9.80501 11.1831 9.89201 11.096L10.599 10.389C10.6861 10.302 10.738 10.186 10.7448 10.0631C10.7516 9.9402 10.7129 9.81911 10.636 9.72301L9.70001 8.55501C9.85712 8.27249 9.98126 7.97286 10.07 7.66201L11.555 7.50001C11.6779 7.48641 11.7913 7.42779 11.8735 7.33546C11.9557 7.24312 12.0008 7.12362 12 7.00001V6.00001C12.0008 5.8764 11.9557 5.7569 11.8735 5.66456C11.7913 5.57223 11.6779 5.5136 11.555 5.50001ZM6.00001 8.50001C5.60445 8.50001 5.21777 8.38271 4.88887 8.16295C4.55997 7.94319 4.30363 7.63083 4.15225 7.26538C4.00087 6.89992 3.96127 6.49779 4.03844 6.10983C4.11561 5.72187 4.30609 5.3655 4.5858 5.0858C4.8655 4.80609 5.22187 4.61561 5.60983 4.53844C5.99779 4.46127 6.39992 4.50087 6.76538 4.65225C7.13083 4.80363 7.44319 5.05997 7.66295 5.38887C7.88271 5.71777 8.00001 6.10445 8.00001 6.50001C8.00001 7.03044 7.7893 7.53915 7.41422 7.91422C7.03915 8.2893 6.53044 8.50001 6.00001 8.50001Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            )}
        </li>
    );
};

export const StatusMenuButton = ({ toggleStatus }) => {
    const { totalTeams, teamsConnected } = useConnectCount();

    //All teams connected!
    if (teamsConnected === totalTeams) {
        return (
            <Popover.Button
                onClick={toggleStatus}
                className="inline-flex items-center pl-2.5 pr-3 h-10 border border-gray-300 text-sm leading-4 rounded-lg text-gray-500 bg-white :outline-none ring-4 ring-blue-100">
                <svg
                    className="mr-1"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="#119A27" strokeWidth="2" />
                    <path
                        d="M13.2857 8L9.09521 12L7 10"
                        stroke="#119A27"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="hidden sm:inline-flex">
          <span className="mx-1 text-gray-900 font-medium">
            {__("All teams connected", "trustedlogin-connector")}
          </span>
        </span>
                <svg
                    className="hidden sm:inline-flex ml-3"
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1 5L5 1L9 5"
                        stroke="#1D2327"
                        strokeOpacity="0.5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Popover.Button>
        );
    }

    //1 or more teams not connected
    return (
        <button
            onClick={toggleStatus}
            className="inline-flex items-center pl-2.5 pr-3 h-10 border border-gray-300 text-sm leading-4 rounded-lg text-gray-500 bg-white :outline-none ring-4 ring-blue-100">
            <svg
                className="sm:mr-2"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M6 10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6L10 10L6 10Z"
                    fill="#FFB000"
                />
                <circle cx="10" cy="10" r="8" stroke="#FFB000" strokeWidth="2" />
            </svg>
            <span className="hidden sm:inline-flex">
        <span className="mx-1 text-gray-900 font-medium">
          {`${teamsConnected} of ${totalTeams} Teams Connected`}
        </span>
      </span>
            <svg
                className="hidden sm:inline-flex ml-3"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M1 5L5 1L9 5"
                    stroke="#1D2327"
                    strokeOpacity="0.5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
};

const StatusMenu = ({ toggleStatus, isStatusOpen }) => {
    const { settings } = useSettings();
    const { setCurrentView } = useView();
    const onViewTeams = (e) => {
        e.preventDefault();
        setCurrentView("teams");
        toggleStatus();
    };
    return (
        <Popover className="relative">
            <StatusMenuButton toggleStatus={toggleStatus} />
            {isStatusOpen ? (
                <Popover.Panel
                    static
                    className="absolute z-10 top-0 -right-52 -translate-x-1/2 transform translate-y-10 mt-3 px-2 w-[32rem] sm:-left-24 sm:w-screen sm:max-w-xl">
                    <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative bg-white px-8 pb-6 space-y-8">
                            <div className="flex py-6 border-b items-center justify-between">
                                <div className="flex items-center">
                                    <h2 className="leading-tight text-lg text-gray-900">
                                        {__("Teams", "trustedlogin-connector")}
                                    </h2>
                                </div>
                                <div className="inline-flex items-center">
                                    <button
                                        className="text-sm text-blue-tl"
                                        onClick={onViewTeams}>
                                        {__("View all Teams", "trustedlogin-connector")}
                                    </button>
                                    <svg
                                        className="ml-3"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.16663 7.00008H12.8333M12.8333 7.00008L6.99996 1.16675M12.8333 7.00008L6.99996 12.8334"
                                            stroke="#00AADD"
                                            strokeWidth="1.67"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <ul role="list" className="space-y-6">
                                {settings.teams.length ? (
                                    <Fragment>
                                        {settings.teams.map((team) => (
                                            <Fragment key={team.id}>
                                                <TeamMenuItem team={team} toggleStatus={toggleStatus} />
                                            </Fragment>
                                        ))}
                                    </Fragment>
                                ) : null}
                            </ul>
                            <div className="mb-8 inline-flex items-center">
                                <a className="text-sm text-blue-tl" href="https://docs.trustedlogin.com/Vendor/intro">
                                    {__("Need help? View our Documentation", "trustedlogin-connector")}
                                </a>
                                <svg
                                    className="ml-3"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.16663 7.00008H12.8333M12.8333 7.00008L6.99996 1.16675M12.8333 7.00008L6.99996 12.8334"
                                        stroke="#00AADD"
                                        strokeWidth="1.67"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            ) : null}
        </Popover>
    );
};
export default StatusMenu;
