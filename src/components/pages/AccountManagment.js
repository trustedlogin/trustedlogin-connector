import react from "react";
import { __ } from "@wordpress/i18n";
import { SettingsPageLayout } from "../Layout";
import useRemoteSession from "../../hooks/useRemoteSession";
import LoginOrLogout from "../LoginLogout";

export default function AccountManagment() {
  const { hasAppToken, session } = useRemoteSession();

  return (
    <SettingsPageLayout title={"Team Settings"} subTitle={"Manage Team"}>
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow p-8">
        {hasAppToken ? <p>logged in</p> : <p>Not logged in</p>}
        <LoginOrLogout />
      </div>
    </SettingsPageLayout>
  );
}
