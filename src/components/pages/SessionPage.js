import { __ } from "@wordpress/i18n";
import Layout, { NarrowFormLayout } from "../Layout";
import { useMemo, useState } from "react";
import useRemoteSession from "../../hooks/useRemoteSession";
import LoginOrLogout from "../LoginLogout";
/**
 * UI for login and logout from remote application
 *
 */
export default function SessionPage() {
  //loading state for form
  //const { hasAppToken, session } = useRemoteSession();

  return (
    <>
      <Layout
        minimal={true}
        title={__("Login to Trusted Login Managment", "trustedlogin-vendor")}
        description={__("lorem ipsums.", "trustedlogin-vendor")}>
        <NarrowFormLayout>
          <LoginOrLogout />
        </NarrowFormLayout>
      </Layout>
    </>
  );
}
