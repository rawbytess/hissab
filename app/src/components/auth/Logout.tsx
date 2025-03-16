import { Button } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase/client";
import { useContext } from "react";
import { SessionContext } from "@/components/auth/SessionProvider.tsx";

export function LogoutButton() {
  const { setSession } = useContext(SessionContext);
  return (
    <Button
      className={
        "bg-red-600 text-white rounded-xl p-2.5 w-full text-center text-sm"
      }
      onClick={async () => {
        console.log("signing out");
        await supabase.auth.signOut();
        setSession(null);
      }}
    >
      Sign Out
    </Button>
  );
}
