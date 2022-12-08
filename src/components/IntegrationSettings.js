import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { SettingsPageLayout } from "./Layout";
import { IntegrationHelpscout } from "./integrations/Integration";

const IntegrationSettings = () => {
  return (
    <SettingsPageLayout title={"Integrations"} subTitle={"Manage Integrations"}>
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow p-8">
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Fragment key="helpscout">
            <IntegrationHelpscout />
          </Fragment>
        </ul>
      </div>
    </SettingsPageLayout>
  );
};
export default IntegrationSettings;
