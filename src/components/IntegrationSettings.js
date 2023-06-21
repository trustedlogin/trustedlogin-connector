import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { PageHeader } from "./Layout";
import {IntegrationComponent} from "./integrations/Integration";

const IntegrationSettings = () => {
  const integrations = ['helpscout', 'freescout'];
  return (
    <div className="flex flex-col px-5 py-6 sm:px-10">
      <PageHeader title={"Integrations"} subTitle={"Manage Integrations"} />
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow p-8">
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
                <Fragment key={integration}>
                    <IntegrationComponent helpdesk={integration} />
                </Fragment>
            ))}
        </ul>
      </div>
    </div>
  );
};
export default IntegrationSettings;
