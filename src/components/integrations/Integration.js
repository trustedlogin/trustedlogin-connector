import { useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../../hooks/useSettings";

const Integration = ({ Icon, name, description, id, toggleOpenState }) => {
  const { settings, setSettings, onSaveIntegrationSettings } = useSettings();

  const isEnabled = useMemo(() => {
    return settings.integrations[id] ? settings.integrations[id].enabled : false;
  }, [settings.integrations]);

  const buttonClassName = useMemo(() => {
    let className = isEnabled ? "bg-blue-tl" : "bg-gray-200";
    return `${className} ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`;
  }, [isEnabled]);

  const spanClassName = useMemo(() => {
    let className = isEnabled ? "translate-x-5" : "translate-x-0";
    return `${className} translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`;
  }, [isEnabled]);

  //When button is clicked:
  const onToggle = () => {
    let update = {
      ...settings,
      integrations: {
        ...settings.integrations,
        [id]: {
          ...settings.integrations[id],
          enabled: settings.integrations[id] ? !settings.integrations[id].enabled : true,
        },
      },
    };

    //Update state first.
    setSettings(update);
    //Save it
    onSaveIntegrationSettings(
      //Send integrations only
      { integrations: update.integrations },
      false //Don't update state in .then()
    );
  };

  return (
    <li
      onClick={toggleOpenState}
      className="col-span-1 flex flex-col justify-between bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="p-6 space-y-6">
        <div className="w-full flex items-center justify-between space-x-6">
          <div className="flex-1 truncate">
            <div className="flex items-center">
              <button className="flex-shrink-0" onClick={toggleOpenState}>
                <Icon />
              </button>
              <div
                className="ml-5 w-0 flex-1"
                id={`${id}-label`}
                role={"label"}>
                {name}
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggle()}
            type="button"
            className={buttonClassName}
            role="switch"
            aria-checked="true"
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-description`}>
            <span aria-hidden="true" className={spanClassName} />
          </button>
        </div>
        <p className="text-sm text-gray-500" id={`${id}-description`}>
          {description}
        </p>
      </div>
    </li>
  );
};

export const IntegrationHelpscout = () => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Integration
        toggleOpenState={() => setIsOpen(!isOpen)}
        id={"helpscout"}
        isEnabled={true}
        name={"Help Scout"}
        description={__(
          "Customer support platform, knowledge base tool, and an contact widget for customer service.",
          "trustedlogin-vendor"
        )}
        Icon={() => (
          <svg
            width="40"
            height="48"
            viewBox="0 0 40 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.9209 14.1817L3.03705 28.3637C1.30192 26.5909 0.217179 24.1535 0 21.2726C0 18.6137 1.30163 15.9546 3.03705 14.1817L17.1381 0C18.8735 1.77286 19.958 4.43172 19.958 7.09086C19.958 9.75001 18.6567 12.4092 16.9212 14.1817H16.9209ZM23.0285 33.8183L37.0644 19.6363C38.8191 21.6306 39.916 24.0683 39.916 26.7271C39.916 29.3863 38.5997 32.0454 36.8455 33.8183L22.809 48C21.0545 46.2271 19.958 43.568 19.958 40.9091C19.958 38.25 21.2737 35.5908 23.0285 33.8183ZM22.6843 14.1817L26.8285 10.0363L37.0803 0C38.8252 1.7455 39.9157 4.36374 39.9157 6.98199C39.9157 9.60023 38.6072 12.2182 36.8619 13.9637L26.8285 24L22.6843 28.1454L16.7954 34.0363L12.6511 38.1817L2.83571 48C1.0905 46.2545 0 43.6363 0 41.018C0 38.3998 1.30883 35.7815 3.05375 34.0363L12.8691 24.218L16.7951 20.0726L22.6843 14.1817Z"
              fill="#1292EE"
            />
          </svg>
        )}
      />
    </>
  );
};

export const IntegrationFreescout = () => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Integration
        toggleOpenState={() => setIsOpen(!isOpen)}
        id={"freescout"}
        isEnabled={false}
        name={"Free Scout"}
        description={__(
          "FreeScout is a self-hosted, open-source customer support solution, equipped with email-ticketing, a customizable knowledge base tool, and various modules for enhanced customer service functionality.",
          "trustedlogin-vendor"
        )}
        Icon={() => (
            <svg
                width="40"
                height="48"
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
        )}
      />
    </>
  );
};
