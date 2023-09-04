import { Fragment } from "react";
import { PageHeader } from "./Layout";
import { DangerZone, DebugLogSettings } from "./Sections";
import { __ } from "@wordpress/i18n";

const GeneralSettings = () => {
  return (
    <Fragment>
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <PageHeader
          title={__("Settings", "trustedlogin-vendor")}
          subTitle={__(
            "Manage your TrustedLogin settings",
            "trustedlogin-vendor"
          )}
        />
        <div className="space-y-6">
          <DebugLogSettings />
          <DangerZone />
        </div>
      </div>
    </Fragment>
  );
};
export default GeneralSettings;
