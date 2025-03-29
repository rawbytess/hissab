import { createContext, useEffect, useMemo, useState } from "react";
import { AuthOtpResponse, AuthResponse, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client.ts";
import { userMetadata } from "../../../../../lib/types/userMetadata.ts";
import { bouncy } from "ldrs";

export type SessionContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  logout: () => void;
  verifyOTP: null | ((email: string, otp: string) => Promise<AuthResponse>);
  signInWithOTP: ((email: string) => Promise<AuthOtpResponse>) | null;
  metadata: userMetadata | null;
  isPaid: boolean;
};

export type User = {
  id: string;
  name: string;
  status: string;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
  logout: () => {},
  verifyOTP: null,
  signInWithOTP: null,
  metadata: null,
  isPaid: false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const metadata = (session?.user?.app_metadata || null) as userMetadata;

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
      console.log(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const isPaid = useMemo(() => {
    if (!session) return false;
    if (!metadata) return false;
    if (!metadata.subscription) return false;

    if (metadata.subscription.status === "expired") return false;
    if (
      metadata.subscription.status === "cancelled" ||
      metadata.subscription.status === "active"
    ) {
      const endsAt = new Date(metadata.subscription.ends_at);
      const now = new Date();
      return endsAt > now;
    }
    return false;
  }, [session, metadata]);

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function verifyOTP(email: string, otp: string) {
    console.log("Verifying OTP");
    return await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "email",
    });
  }

  async function signInWithOTP(email: string) {
    console.log("Sending email OTP");
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
        metadata: (session?.user?.app_metadata ?? null) as userMetadata,
        isPaid,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
