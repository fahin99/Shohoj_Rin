"use client";

import * as React from "react";
import type { StoredUserProfile } from "./session";

const CurrentUserContext = React.createContext<StoredUserProfile | null>(null);

interface UserProviderProps {
  user: StoredUserProfile | null;
  children: React.ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): StoredUserProfile | null {
  return React.useContext(CurrentUserContext);
}
