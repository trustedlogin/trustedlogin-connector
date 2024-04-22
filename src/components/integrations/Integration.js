import { useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../../hooks/useSettings";
import {FreescoutLogo, HelpscoutLogo} from "./ConfigureIntegration";

const integrationData = {
  'helpscout': {
    id: "helpscout",
    isEnabled: true,
    name: __("Help Scout", 'trustedlogin-connector'),
    description: __("Customer support platform, knowledge base tool, and an contact widget for customer service.", 'trustedlogin-connector'),
    IconSVG: HelpscoutLogo,
  },
  'freescout': {
    id: "freescout",
    isEnabled: false,
    name: __("FreeScout", 'trustedlogin-connector'),
    description: __("FreeScout is a self-hosted, open-source customer support solution, equipped with email-ticketing, a customizable knowledge base tool, and various modules for enhanced customer service functionality.", 'trustedlogin-connector'),
    IconSVG: FreescoutLogo,
  }
};

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
    return `${className} inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200`;
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
                <Icon height={48} width={40} />
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

export const IntegrationComponent = ({ helpdesk }) => {
  const [isOpen, setIsOpen] = useState(true);
  const integration = integrationData[helpdesk];

  return (
      <>
        <Integration
            toggleOpenState={() => setIsOpen(!isOpen)}
            id={integration.id}
            isEnabled={integration.isEnabled}
            name={integration.name}
            description={__(integration.description, "trustedlogin-vendor")}
            Icon={integration.IconSVG}
        />
      </>
  );
};
