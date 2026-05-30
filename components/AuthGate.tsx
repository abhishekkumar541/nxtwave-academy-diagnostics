"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUser, signOut as doSignOut, type SessionUser } from "@/lib/auth";
import LoginScreen from "./LoginScreen";

interface AuthCtx {
  user: SessionUser;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

// Read the signed-in user anywhere inside the gate.
export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within <AuthGate>");
  return c;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  // mounted-guard: localStorage is client-only, so render nothing on the server
  // pass / first paint to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [user, setUserState] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUserState(getUser());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" />; // brief, layout-stable blank
  }

  if (!user) {
    return <LoginScreen onSignedIn={setUserState} />;
  }

  return (
    <Ctx.Provider
      value={{
        user,
        signOut: () => {
          doSignOut();
          setUserState(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
