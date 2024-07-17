import { __ } from "@wordpress/i18n";
import { useRef } from "react";
import Layout from "./Layout";
import { HorizontalLogo } from "./TrustedLoginLogo";
import {
  InputField,
  SelectField,
  OnboardingSelectFieldArea,
} from "./onboarding/fields";
import Main from "./onboarding/Main";
import Aside from "./onboarding/Aside";
import teamFields from "./teams/teamFields";
import collectTeam from "./teams/collectTeam";
import { useSettings } from "../hooks/useSettings";
import { useView } from "../hooks/useView";
import RoleMultiSelect from "./RoleMultiSelect";
import TitleDescriptionLink from "./TitleDescriptionLink";

//Display Step one
const StepOne = () => {
  return (
    <>
      <>
        <TitleDescriptionLink
          title={__("Link your TrustedLogin account", "trustedlogin-connector")}
        />
        <div className="flex flex-1 flex-col space-y-6">
          <div>
            <label
              htmlFor="account-id"
              className="block text-sm font-medium text-gray-700">
              {__("Account ID", "trustedlogin-connector")}
            </label>
            <div className="mt-2 relative rounded-lg">
              <input
                type="text"
                name="account-id"
                id="account-id"
                className="block w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
                placeholder=""
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="public_key"
              className="block text-sm font-medium text-gray-700">
              {__("Public Key", "trustedlogin-connector")}
            </label>
            <div className="mt-2 relative rounded-lg">
              <input
                type="text"
                name="public_key"
                id="public_key"
                className="w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
                placeholder=""
              />
            </div>
          </div>
          <div className="pt-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-tl text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:col-start-2 sm:text-sm">
              {__("Continue", "trustedlogin-connector")}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:col-start-1 sm:text-sm">
              {__("Skip", "trustedlogin-connector")}
            </button>
          </div>
        </div>
      </>
    </>
  );
};

const StepTwo = () => {
  const { addTeam } = useSettings();
  const { setCurrentView } = useView();
  const formRef = useRef(null);
  const handleSave = (e) => {
    //Check if form input is valid
    if (!formRef.current.checkValidity()) {
      //Highlight invalid fields
      let inputs = formRef.current.querySelectorAll("input");
      if (inputs.length > 0) {
        inputs.forEach((element) => {
          if (element.checkValidity()) {
            element.classList.remove("border-red-800");
          } else {
            element.classList.add("border-red-800");
          }
        });
      }
      //Return allowing browser's native validation errors to show
      return;
    }
    //Now, prevent default form submission.
    //Can not do this before checkValidity, because that will prevent the browser's native validation errors from showing.
    e.preventDefault();
    //Collect the data and save it
    let team = collectTeam(formRef.current);
    addTeam(team, true, () => setCurrentView("teams"));
  };

  return (
    <>
      <div className="max-w-sm mx-auto mb-8 justify-center text-center">
        <h2 className="mt-4 text-2xl text-gray-900">
          {__("Create your first team", "trustedlogin-connector")}
        </h2>
        <p className="mt-2 mb-4 text-sm text-gray-500">
          {__(
            "Each team supports a project in TrustedLogin.",
            "trustedlogin-connector"
          )}
        </p>
        <a
          className="text-blue-tl text-sm"
          href="https://app.trustedlogin.com/settings#/teams"
          target="_blank">
          {__("Where can I find this info?", "trustedlogin-connector")}
          <span className="screen-reader-text">
            {__("(Link opens in a new window)", "trustedlogin-connector")}
          </span>
        </a>
      </div>
      <form
        ref={formRef}
        className="flex flex-1 flex-col space-y-6"
        onSubmit={handleSave}>
        <InputField
          type={"number"}
          id={teamFields.account_id.id}
          label={teamFields.account_id.label}
          required={true}
        />
        <InputField
          id={teamFields.public_key.id}
          label={teamFields.public_key.label}
          required={true}
        />
        <InputField
          id={teamFields.private_key.id}
          label={teamFields.private_key.label}
          required={true}
        />
        <OnboardingSelectFieldArea
          id={teamFields.approved_roles.id}
          label={teamFields.approved_roles.label}>
          <RoleMultiSelect
            approvedRoles={[]}
            id={teamFields.approved_roles.id}
          />
        </OnboardingSelectFieldArea>

        <SelectField
          id={teamFields.helpdesk.id}
          label={teamFields.helpdesk.label}>
          <option>{__("Select a Help Desk", "trustedlogin-connector")}</option>
          <option value={"helpscout"}>Help Scout</option>
          <option value={"freescout"}>FreeScout</option>
        </SelectField>
        <div className="pt-2">
          <button
            onClick={handleSave}
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-tl text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:col-start-2 sm:text-sm">
            {__("Continue", "trustedlogin-connector")}
          </button>
        </div>
      </form>
    </>
  );
};

const Icon = ({ step }) => {
  switch (step) {
    case 2:
      return (
        <svg
          className="mx-auto"
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="24"
            fill="#00AADD"></rect>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M28 26C26.9391 26 25.9217 25.5786 25.1716 24.8284C24.4214 24.0783 24 23.0609 24 22C24 20.9391 24.4214 19.9217 25.1716 19.1716C25.9217 18.4214 26.9391 18 28 18C29.0609 18 30.0783 18.4214 30.8284 19.1716C31.5786 19.9217 32 20.9391 32 22C32 23.0609 31.5786 24.0783 30.8284 24.8284C30.0783 25.5786 29.0609 26 28 26ZM22 36C20.9391 36 19.9217 35.5786 19.1716 34.8284C18.4214 34.0783 18 33.0609 18 32C18 30.9391 18.4214 29.9217 19.1716 29.1716C19.9217 28.4214 20.9391 28 22 28C23.0609 28 24.0783 28.4214 24.8284 29.1716C25.5786 29.9217 26 30.9391 26 32C26 33.0609 25.5786 34.0783 24.8284 34.8284C24.0783 35.5786 23.0609 36 22 36V36ZM34 36C32.9391 36 31.9217 35.5786 31.1716 34.8284C30.4214 34.0783 30 33.0609 30 32C30 30.9391 30.4214 29.9217 31.1716 29.1716C31.9217 28.4214 32.9391 28 34 28C35.0609 28 36.0783 28.4214 36.8284 29.1716C37.5786 29.9217 38 30.9391 38 32C38 33.0609 37.5786 34.0783 36.8284 34.8284C36.0783 35.5786 35.0609 36 34 36Z"
            stroke="white"
            strokeWidth="2"></path>
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="24"
            stroke="#CDEFF9"
            strokeWidth="8"></rect>
        </svg>
      );
    case 1:
    default:
      return (
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
              d="M28 31V33V31ZM22 37H34C34.5304 37 35.0391 36.7893 35.4142 36.4142C35.7893 36.0391 36 35.5304 36 35V29C36 28.4696 35.7893 27.9609 35.4142 27.5858C35.0391 27.2107 34.5304 27 34 27H22C21.4696 27 20.9609 27.2107 20.5858 27.5858C20.2107 27.9609 20 28.4696 20 29V35C20 35.5304 20.2107 36.0391 20.5858 36.4142C20.9609 36.7893 21.4696 37 22 37ZM32 27V23C32 21.9391 31.5786 20.9217 30.8284 20.1716C30.0783 19.4214 29.0609 19 28 19C26.9391 19 25.9217 19.4214 25.1716 20.1716C24.4214 20.9217 24 21.9391 24 23V27H32Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
      );
  }
};

/**
 * Displays current step in Onboarding layout.
 */
const Steps = ({ step, singleStepMode = true }) => {
  const Inside = () => {
    switch (step) {
      case 1:
        return <StepOne />;
      case 2:
      default:
        return <StepTwo />;
    }
  };
  return (
    <Main.Step>
      <div className="flex flex-col pt-12 w-full max-w-sm mx-auto">
        <Icon step={step} />
        <Inside />
      </div>
      <Main.StepBottom step={step} singleStepMode={singleStepMode} />
    </Main.Step>
  );
};

/**
 *
 * I removed .absolute from design to make it appear on the screen
 */
export const OnboardingLayout = ({
  //Which step to display
  currentStep = 2,
  //Set false to hide navigation to other steps.
  singleStepMode = true,
}) => {
  return (
    <>
      <Layout>
        <div className="h-full flex bg-white">
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            <div className="flex-1 relative z-0 flex overflow-hidden">
              <div
                id={"trustedlogin-onboarding-main"}
                className="flex-1 relative z-0 overflow-y-auto focus:outline-none md:order-last">
                <Steps
                  currentStep={currentStep}
                  singleStepMode={singleStepMode}
                />
              </div>
              <aside
                className="hidden relative bg-gray-tl md:order-first md:flex md:flex-col flex-shrink-0 min-w-[26rem] overflow-y-auto"
                id={"trustedlogin-onboarding-side"}>
                <div className="inset-0">
                  <div className="h-full flex flex-col justify-between p-12">
                    <div className="space-y-16">
                      <div>
                        <HorizontalLogo />
                      </div>
                      <div
                        style={{
                          visibility: singleStepMode ? "hidden" : "inherit",
                        }}>
                        <nav aria-label="Progress">
                          <ol role="list" className="overflow-hidden">
                            <Aside.CurrentStep
                              title={__(
                                "Link your account",
                                "trustedlogin-connector"
                              )}
                            />
                            <Aside.FutureStep
                              title={__(
                                "Create Team",
                                "trustedlogin-connector"
                              )}
                            />
                            <Aside.FutureStep
                              title={__(
                                "Configure Help Desk",
                                "trustedlogin-connector"
                              )}
                            />
                          </ol>
                        </nav>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-center">
                      <a
                        className="text-sm text-blue-tl"
                        target={"_blank"}
                        href="https://docs.trustedlogin.com/Connector/intro"
                      >
                        {__(
                          "Need Help? View our Documentation",
                          "trustedlogin-connector"
                        )}
                        <span className="screen-reader-text">
                          {__(
                            "(Link opens in a new window)",
                            "trustedlogin-connector"
                          )}
                        </span>
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
              </aside>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
