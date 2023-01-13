import { __ } from "@wordpress/i18n";
import { SettingsPageLayout } from "../Layout";

export default function GettingStarted() {
  return (
    <SettingsPageLayout title={"Team Settings"} subTitle={"Manage Team"}>
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow p-8">
        Getting Started
      </div>
    </SettingsPageLayout>
  );
}
