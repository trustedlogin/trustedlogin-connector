import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import { SecondaryButton } from "../Buttons";
import EditTeam, { TeamFormRows } from "./EditTeam";
import { useMemo, useState } from "react";
import TitleDescriptionLink from "../TitleDescriptionLink";
import useRemoteSession, {
  ReloadIfNoSessionData,
} from "../../hooks/useRemoteSession";
import LoginOrLogout from "../LoginLogout";
import { InputField } from "./fields";
import teamFields from "./teamFields";
import Connector from "../connect/index";

const CreateTeam = () => {
  const { hasAppToken, session } = useRemoteSession();
  const formRef = useRef(null);
  if (!hasAppToken) {
    return (
      <>
        <LoginOrLogout />
      </>
    );
  }
  const handler = (e) => {
    //Check if form input is valid
    if (!formRef.current.checkValidity()) {
      //If not, return, allowing browser's native validation errors to show
      return;
    }
    //Now, prevent default form submission.
    //Can not do this before checkValidity, because that will prevent the browser's native validation errors from showing.
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData);
    console.log(data);
  };
  return (
    <>
      <form formRef={formRef} onSubmit={handler}>
        <InputField
          type="text"
          name={teamFields.name.id}
          id={teamFields.name.id}
          label={teamFields.name.label}
          defaultValue={""}
          required={true}
        />
      </form>
    </>
  );
};
const AddTeam = () => {
  const { addTeam } = useSettings();
  const { setCurrentView } = useView();
  //null|create|connect
  const [addType, setAddType] = useState(null);

  const title = useMemo(() => {
    if ("create" === addType) {
      return "Create Team";
    }
    if ("connect" === addType) {
      return "Connect Team";
    }
    return "Are you connecting an existing team to this site or do you need to you need to create a team?";
  }, [addType]);

  const cancel = useMemo(() => {
    if ("create" === addType || "connect" === addType) {
      return {
        label: "Back",
        onClick: (e) => {
          e.preventDefault();
          setAddType(null);
        },
      };
    }
    return {
      label: "Cancel",
      onClick: (e) => {
        e.preventDefault();
        setCurrentView("teams");
      },
    };
  }, [setCurrentView, addType]);
  const onClickConnect = (e) => {
    e.preventDefault();
    setAddType("connect");
  };
  const onClickCreate = (e) => {
    e.preventDefault();
    setAddType("create");
  };

  const Inside = useMemo(() => {
    return () => {
      if ("create" === addType) {
        return (
          <>
            <CreateTeam />
          </>
        );
      }
      if ("connect" === addType) {
        return (
          <>
            <Connector />
          </>
        );
      }
      return (
        <TeamFormRows
          Left={() => (
            <>
              <SecondaryButton onClick={onClickCreate}>
                Create Team
              </SecondaryButton>
            </>
          )}
          Right={() => (
            <>
              <SecondaryButton onClick={onClickConnect}>
                Connect Existing Team
              </SecondaryButton>
            </>
          )}
        />
      );
    };
  }, [addType]);

  return (
    <>
      <ReloadIfNoSessionData />
      <div className="flex px-5 pt-20 sm:px-10">
        <div className="flex flex-col w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow sm:p-14 sm:pb-8">
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
          <TitleDescriptionLink
            title={title}
            link={"https://app.trustedlogin.com/settings#/teams"}
          />
          <Inside />
          <div className="flex flex-col py-6 space-y-6 sm:space-y-0 sm:space-x-12 sm:flex-row">
            <SecondaryButton onClick={cancel.onClick}>
              {cancel.label}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTeam;
