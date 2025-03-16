import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SessionContext } from "@/components/auth/SessionProvider.tsx";

export function LoginForm({
  className,
  setOpen,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  setOpen: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");

  const { setSession } = useContext(SessionContext);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className={"text-gray-300 border-0"}>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              console.log("Logging in");
              if (showOTP) {
                console.log("Verifying OTP");
                const res = await supabase.auth.verifyOtp({
                  email: email,
                  token: otp,
                  type: "email",
                });
                if (res.error) {
                  console.error(res.error);
                } else {
                  setShowOTP(false);
                  setOpen(false);
                  console.log(res.data);
                }
              } else {
                console.log("Sending email OTP");
                const res = await supabase.auth.signInWithOtp({
                  email: email,
                  options: {
                    shouldCreateUser: true,
                  },
                });
                if (res.error) {
                  console.error(res.error);
                } else {
                  console.log(res.data);
                  setSession(res.data.session);
                  setShowOTP(true);
                }
              }
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  disabled={showOTP}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {showOTP && (
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button className="w-full" variant={"outline"} type={"submit"}>
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
