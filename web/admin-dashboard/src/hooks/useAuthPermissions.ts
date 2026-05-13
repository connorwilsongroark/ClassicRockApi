import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export function useAuthPermissions() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    async function loadPermissions() {
      if (!isAuthenticated) {
        setPermissions([]);
        return;
      }

      const token = await getAccessTokenSilently();
      const payload = JSON.parse(atob(token.split(".")[1]));

      setPermissions(payload.permissions ?? []);
    }

    loadPermissions();
  }, [isAuthenticated, getAccessTokenSilently]);

  return {
    permissions,
    hasPermission: (permission: string) => permissions.includes(permission),
  };
}
