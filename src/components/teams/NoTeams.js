import { useView } from "../../hooks/useView";
import { CenteredLayout } from "../Layout";

/**
 * Displays "No Teams" message and button
 * @returns {JSX.Element}
 */
const NoTeams = () => {
  const { setCurrentView } = useView();
  return (
    <CenteredLayout
      Icon={() => (
        <>
          <svg
            className="mx-auto"
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="48" height="48" rx="24" fill="#00AADD" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M28 26C26.9391 26 25.9217 25.5786 25.1716 24.8284C24.4214 24.0783 24 23.0609 24 22C24 20.9391 24.4214 19.9217 25.1716 19.1716C25.9217 18.4214 26.9391 18 28 18C29.0609 18 30.0783 18.4214 30.8284 19.1716C31.5786 19.9217 32 20.9391 32 22C32 23.0609 31.5786 24.0783 30.8284 24.8284C30.0783 25.5786 29.0609 26 28 26ZM22 36C20.9391 36 19.9217 35.5786 19.1716 34.8284C18.4214 34.0783 18 33.0609 18 32C18 30.9391 18.4214 29.9217 19.1716 29.1716C19.9217 28.4214 20.9391 28 22 28C23.0609 28 24.0783 28.4214 24.8284 29.1716C25.5786 29.9217 26 30.9391 26 32C26 33.0609 25.5786 34.0783 24.8284 34.8284C24.0783 35.5786 23.0609 36 22 36V36ZM34 36C32.9391 36 31.9217 35.5786 31.1716 34.8284C30.4214 34.0783 30 33.0609 30 32C30 30.9391 30.4214 29.9217 31.1716 29.1716C31.9217 28.4214 32.9391 28 34 28C35.0609 28 36.0783 28.4214 36.8284 29.1716C37.5786 29.9217 38 30.9391 38 32C38 33.0609 37.5786 34.0783 36.8284 34.8284C36.0783 35.5786 35.0609 36 34 36Z"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x="4"
              y="4"
              width="48"
              height="48"
              rx="24"
              stroke="#CDEFF9"
              strokeWidth="8"
            />
          </svg>
        </>
      )}
      title={"Create your first team"}
      subtitle={"Add a support team, as configured in TrustedLogin."}>
      <button
        onClick={() => setCurrentView("teams/new")}
        type="button"
        className="inline-flex items-center justify-center mt-6 px-4 py-2 border border-transparent shadow-sm font-medium rounded-lg text-white bg-blue-tl focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:text-sm">
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
      </button>
    </CenteredLayout>
  );
};
export default NoTeams;
