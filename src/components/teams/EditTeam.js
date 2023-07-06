import { useView } from "../../hooks/useView";
import { useRef, useState, useMemo } from "react";
import { __ } from "@wordpress/i18n";

import { InputField, SelectField, SelectFieldArea } from "./fields";
import teamFields from "./teamFields";
import collectTeam from "./collectTeam";
import { SubmitAndCanelButtons } from "../Buttons";
import RoleMultiSelect from "../RoleMultiSelect";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { useSettings } from "../../hooks/useSettings";

//HelpDesk select
export const HelpDeskSelect = ({ defaultValue, options = null }) => {
  const { getEnabledHelpDeskOptions } = useSettings();
  const helpDeskOptions = useMemo(() => {
    return options ? options : getEnabledHelpDeskOptions();
  }, [options, getEnabledHelpDeskOptions]);
  return (
    <SelectField
      name={teamFields.helpdesk.id}
      id={teamFields.helpdesk.id}
      label={teamFields.helpdesk.label}
      defaultValue={
        defaultValue ? defaultValue : teamFields.helpdesk.defaultValue
      }>
      {helpDeskOptions.length ? (
        <>
          <option>{__("Select a Help Desk", "trustedlogin-vendor")}</option>
          {helpDeskOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      ) : (
        <option>{__("No Helpdesks Active", "trustedlogin-vendor")}</option>
      )}
    </SelectField>
  );
};

//Edit or create team
const EditTeam = ({ team = null, onClickSave, formTitle = "Update Team" }) => {
  const { setCurrentView } = useView();
  const formRef = useRef();
  //useState for approved_roles, beacuse that works.
  const [approved_roles, set_approved_roles] = useState(team?.approved_roles);

  //When form is submitted, collect the data and pass it to onClickSave
  const handleSave = (e) => {
    //Check if form input is valid
    if (!formRef.current.checkValidity()) {
      //If not, return, allowing browser's native validation errors to show
      return;
    }
    //Now, prevent default form submission.
    //Can not do this before checkValidity, because that will prevent the browser's native validation errors from showing.
    e.preventDefault();
    //Collect the data and save it
    let team = collectTeam(formRef.current);
    team.approved_roles = approved_roles;
    onClickSave(team);
  };
  return (
    <>
      <form
        className="flex px-5 pt-20 sm:px-10"
        ref={formRef}
        onSubmit={handleSave}>
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
            title={formTitle}
            link={"https://app.trustedlogin.com/settings#/teams"}
          />

          <div className="flex flex-col py-6 space-y-6 sm:space-y-0 sm:space-x-12 sm:flex-row">
            <div className="flex flex-col space-y-6 sm:flex-1">
              <InputField
                type="text"
                name={teamFields.account_id.id}
                id={teamFields.account_id.id}
                label={teamFields.account_id.label}
                defaultValue={team?.account_id}
                required={true}
              />
              <InputField
                type="text"
                name={teamFields.public_key.id}
                id={teamFields.public_key.id}
                label={teamFields.public_key.label}
                defaultValue={team?.public_key}
                required={true}
              />
              <InputField
                type="text"
                name={teamFields.private_key.id}
                id={teamFields.private_key.id}
                label={teamFields.private_key.label}
                defaultValue={team?.private_key}
                required={true}
              />
            </div>
            <div className="flex flex-col space-y-6 sm:flex-1">
              <SelectFieldArea
                id={teamFields.approved_roles.id}
                label={teamFields.approved_roles.label}>
                <RoleMultiSelect
                  onChange={(roles) => set_approved_roles(roles)}
                  approvedRoles={team?.approved_roles || []}
                  id={teamFields.approved_roles.id}
                />
              </SelectFieldArea>
              <HelpDeskSelect
                defaultValue={
                    team?.helpdesk?.[0] ?? teamFields?.helpdesk?.defaultValue ?? ''
                }
              />
            </div>
          </div>
          <SubmitAndCanelButtons
            onSubmit={handleSave}
            submitText={formTitle}
            onCancel={() => {
              setCurrentView("teams");
            }}
          />
        </div>
      </form>
    </>
  );
};
export default EditTeam;
