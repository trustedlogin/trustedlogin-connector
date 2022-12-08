import { Fragment } from "react";
import { PageHeader, SettingsPageLayout } from "./Layout";
import { DangerZone, DebugLogSettings } from "./Sections";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../hooks/useSettings";

const GeneralSettings = () => {
  return (
    <Fragment>
      <SettingsPageLayout
        title={__("Settings", "trustedlogin-vendor")}
        subTitle={__(
          "Manage your TrustedLogin settings",
          "trustedlogin-vendor"
        )}>
        <div className="space-y-6">
          <DebugLogSettings />
          <DangerZone />
        </div>
      </SettingsPageLayout>
    </Fragment>
  );
};
export default GeneralSettings;
