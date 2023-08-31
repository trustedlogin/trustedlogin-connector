import { useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../../hooks/useSettings";

/**
 * HelpscoutLogo functional component.
 * This component renders the SVG logo for Helpscout.
 * @param {number} [width=36] - width of the SVG, defaults to 36
 * @param {number} [height=44] - height of the SVG, defaults to 44
 */
export const HelpscoutLogo = ({ width = 36, height = 44 }) => (
  <svg
    width={width}
    height={height}
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

/**
 * FreescoutLogo functional component.
 * This component renders the SVG logo for Freescout.
 * @param {number} [width=36] - width of the SVG, defaults to 36
 * @param {number} [height=44] - height of the SVG, defaults to 44
 */
export const FreescoutLogo = ({ width = 36, height = 44 }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
      <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0,48l0,3.6c0,12.7,7.7,21.6,18.7,21.6h1.8c4.9,0,9.8-2.8,13.3-6.8c3.9,3,8.8,4.9,14.2,4.9
        c12.9,0,23.3-10.5,23.3-23.3S60.9,24.7,48,24.7c-12.9,0-23.3,10.5-23.3,23.3v7.5c-0.1,1.3-2.8,3.9-4.1,4h-1.8c-4.4,0-5-4.9-5-7.8
        V48c0-18.9,15.4-34.3,34.3-34.3c18.9,0,34.3,15.4,34.3,34.3c0,18.9-15.4,34.3-34.3,34.3c-7,0-11.9-2-15.2-3.5l-7.4,11.6
        C30.6,93.2,38.2,96,48,96c26.5,0,48-21.5,48-48C96,21.5,74.5,0,48,0C21.5,0,0,21.5,0,48z M38.4,48c0-5.3,4.3-9.6,9.6-9.6
        c5.3,0,9.6,4.3,9.6,9.6c0,5.3-4.3,9.6-9.6,9.6C42.7,57.6,38.4,53.3,38.4,48z"
          fill="#0078d7"
      />
    </svg>
);

/**
 * HelpDeskConfigs object.
 * This object stores configurations for each help desk platform supported.
 * Each configuration includes link, linkText, description, goLink, and goLinkText.
 */
const HelpDeskConfigs = {
  'helpscout': {
    link: "#",
    linkText: __("Learn how to set up a TrustedLogin Help Scout widget.", "trustedlogin-vendor"),
    description: __("Enter these values into a Custom App 'Dynamic Content' widget in Help Scout.", "trustedlogin-vendor"),
    goLink: "https://secure.helpscout.net/apps/custom/",
    goLinkText: __("Create a Custom App in Help Scout", "trustedlogin-vendor"),
  },
  'freescout': {
    link: "#",
    linkText: __("Learn how to set up a TrustedLogin Free Scout widget.", "trustedlogin-vendor"),
    description: [
        __("Place module source to Modules folder of your FreeScout installation", "text-domain"),
        __("Enable module in Modules admin panel", "text-domain"),
        __("Go to Settings -> Modules -> TrustedLogin and enter these values.", "text-domain"),
        __("Finally, go to your Mailbox Settings, select TrustedLogin, enable the TrustedLogin widget.", "text-domain")
    ],
    goLink: "https://github.com/trustedlogin/freescout-module",
    goLinkText: __("Setup the TrustedLogin Freescout Module.", "trustedlogin-vendor"),
  }
};

/**
 * CloseIcon functional component.
 * This component renders an SVG 'close' (X) icon.
 */
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

/**
 * GoIcon functional component.
 * This component renders an SVG 'go' (arrow) icon.
 */
const GoIcon = () => (
    <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.37528 9.12479L9.62486 0.87521M9.62486 0.87521H1.37528M9.62486 0.87521V9.12479" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

/**
 * TeamDetails is a functional React component that displays team-related information.
 *
 * @param {object} props - The properties passed to this component.
 * @param {object} props.team - The team object containing helpdesk and helpdesk_settings data.
 * @param {string} props.helpdeskName - The name of the helpdesk for which the details need to be shown.
 *
 * @returns {JSX.Element} Returns a JSX element containing team-related details.
 */
export const TeamDetails = ({ team, helpdeskName }) => {
  const { resetTeamIntegration } = useSettings();

  /**
   * `useMemo` hook is used to memoize the value returned by the function.
   * This value will only recalculate when [team] changes.
   *
   * If the team object doesn't exist or doesn't contain a helpdesk property, it returns null.
   * If the helpdeskName exists in the team's helpdesk, it returns the corresponding secret.
   * Otherwise, it returns null.
   */
  const secret = useMemo(() => {
    if (!team || !team.hasOwnProperty("helpdesk")) {
      return null;
    }
    if (-1 !== team.helpdesk.findIndex((helpdesk) => helpdeskName === helpdesk)) {
      return team.helpdesk_settings[helpdeskName].secret;
    } else {
      return null;
    }
  }, [team]);

  /**
   * `useMemo` hook is used to memoize the value returned by the function.
   * This value will only recalculate when [team] changes.
   *
   * If the team object doesn't exist or doesn't contain a helpdesk property, it returns null.
   * If the helpdeskName exists in the team's helpdesk, it returns the corresponding callback.
   * Otherwise, it returns null.
   */
  const callback = useMemo(() => {
    if (!team || !team.hasOwnProperty("helpdesk")) {
      return null;
    }
    if (-1 !== team.helpdesk.findIndex((helpdesk) => helpdeskName === helpdesk)) {
      return team.helpdesk_settings[helpdeskName].callback;
    } else {
      return null;
    }
  }, [team]);

  /**
   * Function to copy a given value to the clipboard.
   *
   * @param {string} value - The value to copy to clipboard.
   */
  function copyToClipboard(value) {
    // Query for the "clipboard-write" permission
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
      // If the permission is granted or the user is prompted
      if (result.state === "granted" || result.state === "prompt") {
        // Attempt to write the text to the clipboard
        navigator.clipboard.writeText(value).then(
            function () {
              /* clipboard successfully set */
            },
            function () {
              /* clipboard write failed */
            }
        );
      }
    }).catch((err) => {
      // If an error occurred while writing to the clipboard, log it to the console
      console.error( { err, value } );
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
                  resetTeamIntegration(team.account_id, helpdeskName);
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

/**
 * ConfigureHelpDesk functional component.
 * This component renders the `ConfigureIntegration` component with the team details.
 * It prepares the helpdesk title based on `helpDesk` prop and provides all necessary props to `ConfigureIntegration`.
 *
 * @param {Object} props - The properties passed to this component.
 * @param {boolean} props.isOpen - The boolean to control the open/close state of the configuration window.
 * @param {function} props.setIsOpen - The function to set the open/close state of the configuration window.
 * @param {Object} props.team - The team data.
 * @param {string} props.helpDesk - The name of the help desk.
 */
export function ConfigureHelpDesk({ isOpen, setIsOpen, team, helpDesk = "helpscout" }) {
  /**
   * `useMemo` hook is used to memoize the value returned by the function.
   * This value will only recalculate when [helpdeskName] changes.
   *
   * If the helpdeskName is 'helpscout', it returns 'Help Scout'.
   * If the helpdeskName is 'freescout', it returns 'FreeScout'.
   * Otherwise, it uses the slug as it is.
   */
  const helpdeskTitle = useMemo(() => {
    switch (helpDesk) {
      case "freescout":
        return __("FreeScout", "trustedlogin-vendor");
      default:
      case "helpscout":
        return __("Help Scout", "trustedlogin-vendor");
    }
  }, [helpDesk]);

  // Use memoized helpdeskTitle to create title
  const title = useMemo(() => `${__("Configure", "trustedlogin-vendor")} ${helpdeskTitle}`, [helpdeskTitle]);

  // Check if the helpDesk value is a valid key in HelpDeskConfigs
  if (!HelpDeskConfigs.hasOwnProperty(helpDesk)) {
    throw new Error(`Invalid help desk: ${helpDesk}`);
  }

  // Get the configurations for the specific help desk from HelpDeskConfigs object
  const {
    link = "#",
    linkText = "",
    description = "",
    goLink = "#",
    goLinkText = ""
  } = HelpDeskConfigs[helpDesk] || {};

  // Render ConfigureIntegration component with necessary props and children
  return (
      <ConfigureIntegration
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title={title}
          link={link}
          linkText={linkText}
          description={description}
          goLink={goLink}
          goLinkText={goLinkText}
          helpDesk={helpDesk}
      >
        <TeamDetails team={team} helpdeskName={helpDesk} />
      </ConfigureIntegration>
  );
}

/**
 * Modal for configuring the integration.
 *
 * @param {Object} props - The properties passed to the component
 * @param {Boolean} props.isOpen - State of whether the modal is open
 * @param {Function} props.setIsOpen - Function to set the modal open state
 * @param {Object} props.children - The child components
 * @param {String} props.title - The title of the modal
 * @param {String} props.description - The description text
 * @param {String} props.infoLink - The information link
 * @param {String} props.infoLinkText - The text for the information link
 * @param {String} props.goLink - The go link
 * @param {String} props.goLinkText - The text for the go link
 * @param {String} props.helpDesk - The type of the helpdesk
 * @see https://headlessui.dev/react/dialog
 */
export default function ConfigureIntegration({ isOpen, setIsOpen, children, title, description, infoLink, infoLinkText, goLink, goLinkText, helpDesk }) {
  const logos = {
    'helpscout': HelpscoutLogo,
    'freescout': FreescoutLogo
  };

  const Logo = logos[helpDesk];

  return (
      <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed z-10 inset-0 overflow-y-auto">
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
                    <span className="sr-only">{__("Close", "trustedlogin-vendor")}</span>
                    <CloseIcon />
                  </button>
                </div>
                <div className="flex flex-col">
                  <div className="flex mx-auto border h-20 w-20 items-center justify-center rounded-lg">
                    <Logo />
                  </div>
                  <div className="max-w-sm mx-auto mt-2 mb-8 justify-center text-center">
                    <h2 className="mt-4 text-2xl text-gray-900">{title}</h2>
                    {Array.isArray(description) ? (
                        <ol className="mt-2 mb-4 text-sm text-gray-500 text-left list-decimal">
                          {description.map((item, index) => (
                              <li key={index}>{item}</li>
                          ))}
                        </ol>
                    ) : (
                        <p className="mt-2 mb-4 text-sm text-gray-500">
                          {description}
                        </p>
                    )}
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
                      className="mt-3 mr-4 w-2/5 inline-flex justify-center items-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      data-form-type="other">
                    {__("Close", "trustedlogin-vendor")}                  </button>
                  <a
                      href={goLink}
                      type="button"
                      className="w-3/5 inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-tl text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:col-start-2 sm:text-sm"
                      data-form-type="action,search">
                    {goLinkText}
                    <GoIcon />
                  </a>
                </div>
              </div>
            </>
          </div>
        </div>
      </Dialog>
  );
}
