import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { User, userById } from "@/data/users";
import { DELEGATIONS, getPrincipalsForPA } from "@/data/delegations";

interface ActingContextValue {
  currentUser: User | null;
  actingAs: User | null;
  availablePrincipals: User[];
  setActingAs: (principalId: string | null) => void;
}

const ActingContext = createContext<ActingContextValue | undefined>(undefined);

// Demo default: Sarah Jones (u3), a PA, so the switcher + "acting on behalf" UI is visible.
const DEFAULT_USER_ID = "u3";

export function ActingProvider({ children }: { children: ReactNode }) {
  const currentUser = userById(DEFAULT_USER_ID) ?? null;
  const principalIds = useMemo(() => {
    if (!currentUser) return [];
    return getPrincipalsForPA(currentUser.id, DELEGATIONS)
      .filter((d) => d.status === "active")
      .map((d) => d.principalUserId);
  }, [currentUser]);
  const availablePrincipals = useMemo(
    () => principalIds.map((id) => userById(id)).filter((u): u is User => !!u),
    [principalIds],
  );
  const [actingAsId, setActingAsId] = useState<string | null>(
    availablePrincipals[0]?.id ?? null,
  );
  const actingAs = actingAsId ? userById(actingAsId) ?? null : null;

  const value: ActingContextValue = {
    currentUser,
    actingAs,
    availablePrincipals,
    setActingAs: (id) => setActingAsId(id),
  };
  return <ActingContext.Provider value={value}>{children}</ActingContext.Provider>;
}

export function useActing() {
  const ctx = useContext(ActingContext);
  if (!ctx) throw new Error("useActing must be used within ActingProvider");
  return ctx;
}
