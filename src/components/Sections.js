import { __ } from "@wordpress/i18n";
import { useMemo, useState } from "react";
import { DangerButton, ToggleSwitch } from ".";
import { updateLoggingSettings } from "../api";
import { useSettings } from "../hooks/useSettings";
import { SubmitAndCanelButtons } from "./Buttons";
import { CenteredLayout } from "./Layout";
import SettingSection from "./SettingSection";
import TitleDescriptionLink from "./TitleDescriptionLink";

export const DangerZone = () => {
  const { api, setNotice } = useSettings();
  const [isResetting, setIsResetting] = useState(false);
  const onDelete = () =>
    api
      .resetEncryptionKeys()
      .then(() => {
        setNotice({
          text: "Encryption Reset Succesfully",
          type: "success",
          visible: true,
        });
      })
      .catch((err) => {
        console.log(err);
        setNotice({
          text: "Encryption Reset Failed",
          type: "error",
          visible: false,
        });
      });

  return (
    <>
      {!isResetting ? (
        <SettingSection title={__("Danger Zone", "trustedlogin-vendor")}>
          <div className="bg-white p-8 border border-red-700 rounded-lg mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center h-12 w-12 bg-red-700 rounded-lg">
                  <svg
                    className="text-white"
                    width="22"
                    height="12"
                    viewBox="0 0 22 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11.65 4C10.83 1.67 8.61 0 6 0C2.69 0 0 2.69 0 6C0 9.31 2.69 12 6 12C8.61 12 10.83 10.33 11.65 8H16V12H20V8H22V4H11.65ZM6 8C4.9 8 4 7.1 4 6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6C8 7.1 7.1 8 6 8Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p
                    className="font-medium text-gray-900"
                    id="dangerzone-option-1-label">
                    {__("Reset encryption keys?", "trustedlogin-vendor")}
                  </p>
                  <p
                    className="text-sm text-gray-500"
                    id="dangerzone-option-1-description">
                    {__(
                      "If you reset the encryption keys, all previous authorized logins will be inaccessible.",
                      "trustedlogin-vendor"
                    )}
                  </p>
                </div>
              </div>
              <DangerButton
                onClick={() => setIsResetting(true)}
                id="reset-keys-button">
                Reset Keys
              </DangerButton>
            </div>
          </div>
        </SettingSection>
      ) : (
        <CenteredLayout>
          <TitleDescriptionLink title={__("Are You Sure?")} />
          <SubmitAndCanelButtons
            onSubmit={onDelete}
            submitText={"Reset Keys"}
            onCancel={() => setIsResetting(false)}
          />
        </CenteredLayout>
      )}
    </>
  );
};
export const DebugLogSettings = () => {
  //loading status
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    if (tlVendor.settings.error_logging) {
      return { debug: true, activity: false };
    }
    return { debug: false, activity: false };
  });
  ///when enbaled changes, update the settings
  useMemo(() => {
    setLoading(true);
    updateLoggingSettings(enabled.debug).then(() => {
      setLoading(false);
    });
  }, [enabled]);

  //https://github.com/trustedlogin/vendor/issues/127
  const withAcitivityLog = false;
  return (
    <SettingSection
      title={__("Logging", "trustedlogin-vendor")}
      subTitle={__(
        "These settings relate to logging TrustedLogin activity, including remote interactions and usage activity.",
        "trustedlogin-vendor"
      )}>
      <ul role="list" className="divide-y divide-gray-200">
        <li className="py-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center h-12 w-12 border border-gray-300 rounded-lg">
              <svg
                className="text-gray-900"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 7V23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 13H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 5L6.1 7.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.9999 5L17.8999 7.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 21.9999L6.1 19.8999"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.9999 21.9999L17.8999 19.8999"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 13H23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 3L7 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 3L17 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.9 5.19995C18.4 6.79995 20 9.89995 20 13.5C20 18.7 16.4 23 12 23C7.6 23 4 18.7 4 13.5C4 9.89995 5.7 6.79995 8.1 5.19995"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2C10 2 8.3 3.5 8 5.5C8 5.5 10 7 12 7C14 7 16 5.5 16 5.5C15.7 3.5 14 2 12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-gray-900" id="debug-option-label">
                {__("Debug Logging", "trustedlogin-vendor")}
              </p>
              <p
                className="text-sm text-gray-500"
                id="debug-option-description">
                {__(
                  "When enabled, logs will be saved to the following directory:",
                  "trustedlogin-vendor"
                )}
                <code>wp-content/uploads/trustedlogin-logs</code>
                {/* TODO: Make this path live-updating */}
              </p>
            </div>
          </div>
          <ToggleSwitch
            isEnabled={enabled.debug}
            onClick={() => {
              setEnabled({ ...enabled, debug: !enabled.debug });
            }}
            labelledBy="debug-option-label"
            aria-describedBy="debug-option-description"
            isLoading={loading}
          />
        </li>
        {withAcitivityLog ? (
          <li className="py-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-12 w-12 border border-gray-300 rounded-lg">
                <svg
                  className="text-gray-900"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.1001 16C9.5001 18.4 12.1001 20 15.0001 20C19.4001 20 23.0001 16.4 23.0001 12C23.0001 7.6 19.4001 4 15.0001 4C12.0001 4 9.5001 5.6 8.1001 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 12H18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 9L18 12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <p
                  className="font-medium text-gray-900"
                  id="activity-log-label">
                  {__("Activity Log", "trustedlogin-vendor")}
                </p>
                <p
                  className="text-sm text-gray-500"
                  id="activity-log-description">
                  {__(
                    "Activity Log shows a log of users attempting to log into customer sites using Access Keys.",
                    "trustedlogin-vendor"
                  )}
                </p>
              </div>
            </div>
            <ToggleSwitch
              isEnabled={enabled.activity}
              onClick={() => {
                setEnabled({ ...enabled, activity: !enabled.activity });
              }}
              labelledBy="activity-log-label"
              aria-describedBy="activity-log-description"
            />
          </li>
        ) : null}
      </ul>
    </SettingSection>
  );
};
