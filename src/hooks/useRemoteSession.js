import { useEffect } from "@wordpress/element/build-types";
import { useMemo } from "react";
import { useSettings } from "../hooks/useSettings";

//Componet that refreshes page if session isn't in tl.vendor
export const ReloadIfNoSessionData = () => {
  useEffect(() => {
    if (!tlVendor.session) {
      window.location.reload();
    }
  });
};
/**
 *
 * Hook for managing remote session
 */
const useRemoteSession = () => {
  const { session } = useSettings();
  const hasAppToken = useMemo(() => {
    return session?.hasAppToken ? true : false;
  }, [session]);

  return { hasAppToken, session };
};

export default useRemoteSession;
