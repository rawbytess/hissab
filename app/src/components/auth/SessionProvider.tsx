import { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client.ts";

export type SessionContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then((session) => {
      setSession(session.data.session);
      console.log(session);
    });
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}
