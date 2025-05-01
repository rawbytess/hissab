import { createContext, useEffect, useMemo, useState } from "react";
import { AuthOtpResponse, AuthResponse, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client.ts";
import {
  ProductNames,
  userMetadata,
} from "../../../../../lib/types/userMetadata.ts";
import { isPremiumUser } from "../../../../../lib/getPremiumStatus.ts";

export type SessionContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  logout: () => void;
  verifyOTP: null | ((email: string, otp: string) => Promise<AuthResponse>);
  signInWithOTP: ((email: string) => Promise<AuthOtpResponse>) | null;
  metadata: userMetadata | null;
  isPremium: ProductNames | null;
};

export type User = {
  id: string;
  name: string;
  status: string;
};

export const SessionContext = createContext<SessionContextType>(undefined!);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const metadata = useMemo(
    () => session?.user?.user_metadata as userMetadata,
    [session],
  );
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSession(session);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (event === "USER_UPDATED") {
        setSession(session);
      }
    });

    supabase.auth.getSession().then((session) => {
      setSession(session.data.session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);
  const isPremium = useMemo(() => isPremiumUser(metadata), [metadata]);

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function verifyOTP(email: string, otp: string) {
    return await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "email",
    });
  }

  async function signInWithOTP(email: string) {
    return await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        logout,
        verifyOTP,
        signInWithOTP,
        metadata,
        isPremium,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
