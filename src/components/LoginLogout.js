import { useState, useMemo } from "react";
import { __ } from "@wordpress/i18n";
import { SubmitFieldArea } from "./teams/fields";
import useRemoteSession from "../hooks/useRemoteSession";
const LoginOrLogout = () => {
  //loading state for form
  const [isLoading, setIsLoading] = useState(false);
  const { hasAppToken, session } = useRemoteSession();
  const submitText = useMemo(() => {
    if (!hasAppToken) {
      return __("Log In", "trustedlogin-vendor");
    }
    return __("Log Out", "trustedlogin-vendor");
  }, [hasAppToken]);

  const handler = (e) => {
    // e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      alert("Did not redirect");
    }, 5000);
  };
  return (
    <form
      aria-label={__("Log In To Trusted Login", "trustedlogin-vendor")}
      onSubmit={handler}
      id={hasAppToken ? "logout-form" : "login-form"}
      method={"POST"}
      action={hasAppToken ? session?.startLogout : session?.loginUrl}
      className="flex flex-col py-6 space-y-6 justify-center">
      <input
        type="hidden"
        id="redirect"
        name="redirect"
        value={session?.callbackUrl}
      />
      <input
        type="hidden"
        name="tl_session_nonce"
        id={"tl_session_nonce"}
        value={session?.nonce}
      />
      <SubmitFieldArea isLoading={isLoading} value={submitText} />
    </form>
  );
};
export default LoginOrLogout;
