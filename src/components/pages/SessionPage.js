import { __ } from "@wordpress/i18n";
import { useSettings } from "../../hooks/useSettings";
import Layout, { NarrowFormLayout } from "../Layout";
import { SubmitFieldArea } from "../teams/fields";
import { useMemo, useState } from "react";

/**
 * UI for login and logout from remote application
 *
 */
export default function SessionPage() {
  //loading state for form
  const [isLoading, setIsLoading] = useState(false);
  const { hasAppToken } = useSettings();
  const handler = (e) => {
    e.preventDefault();
    console.log("submit");
  };
  const submitText = useMemo(() => {
    if (!hasAppToken) {
      return __("Log In", "trustedlogin-vendor");
    }
    return __("Log Out", "trustedlogin-vendor");
  }, [hasAppToken]);
  return (
    <>
      <Layout
        minimal={true}
        title={__("Login to Trusted Login Managment", "trustedlogin-vendor")}
        description={__("lorem ipsums.", "trustedlogin-vendor")}>
        <NarrowFormLayout>
          <form
            aria-label={__("Log In Using Access Key", "trustedlogin-vendor")}
            onSubmit={handler}
            id={hasAppToken ? "logout-form" : "login-form"}
            method={"POST"}
            className="flex flex-col py-6 space-y-6 justify-center">
            <SubmitFieldArea isLoading={isLoading} value={submitText} />
          </form>
        </NarrowFormLayout>
      </Layout>
    </>
  );
}
