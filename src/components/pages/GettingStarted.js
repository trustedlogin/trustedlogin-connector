import { __ } from "@wordpress/i18n";
import { SettingsPageLayout } from "../Layout";

const TeamSettings = () => {
  return (
    <SettingsPageLayout title={"Team Settings"} subTitle={"Manage Team"}>
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow p-8">
        Team Settings
      </div>
    </SettingsPageLayout>
  );
};
export default IntegrationSettings;
