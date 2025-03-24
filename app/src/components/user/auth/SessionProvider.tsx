import { createContext, useEffect, useState } from "react";
import { AuthOtpResponse, AuthResponse, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client.ts";

export type SessionContextType = {
  pro: {
    plan: string | null;
  };
  session: Session | null;
  setSession: (session: Session | null) => void;
  logout: () => void;
  verifyOTP: null | ((email: string, otp: string) => Promise<AuthResponse>);
  signInWithOTP: ((email: string) => Promise<AuthOtpResponse>) | null;
  user?: User | null;
};

export type User = {
  id: string;
  name: string;
  status: string;
};

export const SessionContext = createContext<SessionContextType>({
  pro: {
    plan: null,
  },
  session: null,
  setSession: () => {},
  logout: () => {},
  verifyOTP: null,
  signInWithOTP: null,
  user: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
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
    supabase
      .from("users")
      .select(`id,name,status`)
      .single()
      .then((res) => {
        setUser(res.data);
        console.log(res);
      });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

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
        pro: { plan: null },
        logout,
        verifyOTP,
        signInWithOTP,
        user,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
