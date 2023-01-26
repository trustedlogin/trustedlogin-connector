import { useMemo, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

//Componet that refreshes page if session isn't in tl.vendor
export const ReloadIfNoSessionData = () => {
  useEffect(() => {
    if (!tlVendor.session) {
      window.location.reload();
    }
  });
  return null;
};
/**
 *
 * Hook for managing remote session
 */
const useRemoteSession = () => {
  const { session, settings, setSettings } = useSettings();
  const hasAppToken = useMemo(() => {
    return session?.hasAppToken ? true : false;
  }, [session]);

  const setNoToken = () =>
    setSettings({ ...settings, session: { ...session, hasAppToken: false } });

  return { hasAppToken, session, setNoToken };
};

export default useRemoteSession;
