import { useMemo } from "react";
import { useSettings } from "../hooks/useSettings";
const useRemoteSession = () => {
  const { session } = useSettings();
  const hasAppToken = useMemo(() => {
    return session?.hasAppToken ? true : false;
  }, [session]);

  return { hasAppToken, session };
};

export default useRemoteSession;
