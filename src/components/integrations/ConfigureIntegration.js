import { useRef, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../../hooks/useSettings";
export const HelpscoutLogo = () => (
  <svg
    width="36"
    height="44"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.9209 14.1817L3.03705 28.3637C1.30192 26.5909 0.217179 24.1535 0 21.2726C0 18.6137 1.30163 15.9546 3.03705 14.1817L17.1381 0C18.8735 1.77286 19.958 4.43172 19.958 7.09086C19.958 9.75001 18.6567 12.4092 16.9212 14.1817H16.9209ZM23.0285 33.8183L37.0644 19.6363C38.8191 21.6306 39.916 24.0683 39.916 26.7271C39.916 29.3863 38.5997 32.0454 36.8455 33.8183L22.809 48C21.0545 46.2271 19.958 43.568 19.958 40.9091C19.958 38.25 21.2737 35.5908 23.0285 33.8183ZM22.6843 14.1817L26.8285 10.0363L37.0803 0C38.8252 1.7455 39.9157 4.36374 39.9157 6.98199C39.9157 9.60023 38.6072 12.2182 36.8619 13.9637L26.8285 24L22.6843 28.1454L16.7954 34.0363L12.6511 38.1817L2.83571 48C1.0905 46.2545 0 43.6363 0 41.018C0 38.3998 1.30883 35.7815 3.05375 34.0363L12.8691 24.218L16.7951 20.0726L22.6843 14.1817Z"
      fill="#1292EE"></path>
  </svg>
);

export const HelpscoutTeamDetails = ({ team }) => {
  const { resetTeamIntegration } = useSettings();
  const secret = useMemo(() => {
    if (!team || !team.hasOwnProperty("helpdesk")) {
      return null;
    }
    if (-1 != team.helpdesk.findIndex((helpdesk) => "helpscout" === helpdesk)) {
      return team.helpdesk_settings["helpscout"].secret;
    } else {
      return null;
    }
  }, [team]);
  const callback = useMemo(() => {
    if (!team || !team.hasOwnProperty("helpdesk")) {
      return null;
    }
    if (-1 != team.helpdesk.findIndex((helpdesk) => "helpscout" === helpdesk)) {
      return team.helpdesk_settings["helpscout"].callback;
    } else {
      return null;
    }
  }, [team]);

  //https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
  function copyToClipboard(value) {
    navigator.permissions
      .query({ name: "clipboard-write" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          navigator.clipboard.writeText(value).then(
            function () {
              /* clipboard successfully set */
            },
            function () {
              /* clipboard write failed */
            }
          );
        }
      })
      .catch((err) => {
        console.error({ err, value });
      });
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="secret_key"
            className="block text-sm font-medium text-gray-700">
            Secret Key
          </label>
          <button
            onClick={() => {
              resetTeamIntegration(team.account_id, "helpscout");
            }}
            className="flex items-center font-medium text-sm text-red-700"
            title="Warning: will issue new key and cannot be undone">
            <svg
              className="mr-1"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.49995 4.50002C6.39995 2.60002 9.59995 2.60002 11.5 4.50002C12.2 5.20002 12.7 6.20002 12.9 7.20002L14.9 6.90002C14.7 5.40002 14 4.10002 13 3.10002C10.3 0.400024 5.89995 0.400024 3.09995 3.10002L0.899951 0.900024L0.199951 7.30002L6.59995 6.60002L4.49995 4.50002Z"
                fill="#B00000"></path>
              <path
                d="M15.8 8.70001L9.39997 9.40001L11.5 11.5C9.59998 13.4 6.39998 13.4 4.49998 11.5C3.79998 10.8 3.29998 9.80001 3.09998 8.80001L1.09998 9.10001C1.29998 10.6 1.99998 11.9 2.99998 12.9C4.39998 14.3 6.09998 14.9 7.89998 14.9C9.69998 14.9 11.5 14.2 12.8 12.9L15 15.1L15.8 8.70001Z"
                fill="#B00000"></path>
            </svg>
            Refresh
          </button>
        </div>
        <div className="mt-2 relative rounded-lg">
          <input
            type="text"
            name="secret_key"
            id="secret_key"
            className="block w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
            defaultValue={secret}
            disabled={true}
          />
          <button
            onClick={() => copyToClipboard(secret)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-sky-500"
            title="Copy secret key"
            data-form-type="action,search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 12H1C0.447 12 0 11.553 0 11V1C0 0.448 0.447 0 1 0H11C11.553 0 12 0.448 12 1V11C12 11.553 11.553 12 11 12Z"
                fill="currentColor"></path>
              <path
                d="M15 16H4V14H14V4H16V15C16 15.553 15.553 16 15 16Z"
                fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label
          htmlFor="callback_url"
          className="block text-sm font-medium text-gray-700">
          Callback URL
        </label>
        <div className="mt-2 relative rounded-lg">
          <input
            type="text"
            name="callback_url"
            id="callback_url"
            className="block w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
            defaultValue={callback}
            disabled={true}
          />
          <button
            onClick={() => copyToClipboard(callback)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-sky-500"
            title="Copy callback URL"
            data-form-type="action,search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 12H1C0.447 12 0 11.553 0 11V1C0 0.448 0.447 0 1 0H11C11.553 0 12 0.448 12 1V11C12 11.553 11.553 12 11 12Z"
                fill="currentColor"></path>
              <path
                d="M15 16H4V14H14V4H16V15C16 15.553 15.553 16 15 16Z"
                fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export function ConfigureHelscout({ isOpen, setIsOpen, team }) {
  let title = useMemo(() => __("Configure Help Scout"), []);
  return (
    <ConfigureIntegration
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={title}
      link={"#"}
      linkText={"Learn how to set up a TrustedLogin Help Scout widget."}
      description={__(
        "Enter these values into a Custom App 'Dynamic Content' widget in Help Scout.",
        "trustedlogin-vendor"
      )}
      goLink={"https://secure.helpscout.net/apps/custom/"}
      goLinkText={__(
        "Create a Custom App in Help Scout",
        "trustedlogin-vendor"
      )}>
      <>
        <HelpscoutTeamDetails team={team} />
      </>
    </ConfigureIntegration>
  );
}

/**
 * Modal for configuring the integration.
 *
 * @see https://headlessui.dev/react/dialog
 */
export default function ConfigureIntegration({
  isOpen,
  setIsOpen,
  children,
  title,
  description,
  infoLink,
  infoLinkText,
  goLink,
  goLinkText,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto tl-modal">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded max-w-sm mx-auto">
          <Dialog.Title className={"sr-only"}>{title}</Dialog.Title>
          <>
            <div className="inline-block align-middle bg-white rounded-lg p-8 text-left overflow-hidden shadow-xl transform transition-all">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="bg-white rounded-lg text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex flex-col">
                <div className="flex mx-auto border h-20 w-20 items-center justify-center rounded-lg">
                  <HelpscoutLogo />
                </div>
                <div className="max-w-sm mx-auto mt-2 mb-8 justify-center text-center">
                  <h2 className="mt-4 text-2xl text-gray-900">{title}</h2>
                  <p className="mt-2 mb-4 text-sm text-gray-500">
                    {description}
                  </p>
                  <a className="text-blue-tl text-sm" href={infoLink}>
                    {infoLinkText}
                  </a>
                </div>
              </div>

              {children}
              <div className="mt-6 flex sm:mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="mt-3 mr-4 w-2/5 inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  data-form-type="other">
                  Close
                </button>
                <a
                  href={goLink}
                  type="button"
                  className="w-3/5 inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-tl text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:col-start-2 sm:text-sm"
                  data-form-type="action,search">
                  {goLinkText}
                  <svg
                    className="ml-3"
                    width="11"
                    height="10"
                    viewBox="0 0 11 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.37528 9.12479L9.62486 0.87521M9.62486 0.87521H1.37528M9.62486 0.87521V9.12479"
                      stroke="white"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </>
        </div>
      </div>
    </Dialog>
  );
}
