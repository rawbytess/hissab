import { useContext, useState } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { Button, Input, Form, InputOtp, cn } from "@heroui/react";
import { ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { supabase } from "@/lib/supabase/client.ts";

export function LoginForm({
  setOpen,
}: React.ComponentPropsWithoutRef<"div"> & {
  setOpen: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [errorOTP, setErrorOTP] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSession, signInWithOTP, verifyOTP } = useContext(SessionContext);

  if (!setSession || !signInWithOTP || !verifyOTP) {
    return null;
  }

  return (
    <ModalContent className="text-white p-5">
      <ModalHeader>
        <div>
          <p className="text-left font-semibold">Signup or Login</p>
          <p className="text-xs font-light text-gray-300">
            Hissab uses passwordless authentication.
          </p>
        </div>
      </ModalHeader>
      <ModalBody>
        <Form
          className="flex flex-col gap-4"
          validationBehavior="native"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            if (showOTP) {
              const res = await verifyOTP(email, otp);
              if (res.error) {
                setErrorOTP(res.error.message);
              } else {
                setShowOTP(false);
                setOpen(false);
                const tzUpdate = await supabase.auth.updateUser({
                  data: {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                });
              }
            } else {
              const res = await signInWithOTP(email);
              if (res.error) {
                setErrorEmail(res.error.message);
              } else {
                setSession(res.data.session);
                setShowOTP(true);
              }
            }
            setLoading(false);
          }}
        >
          <Input
            isRequired
            value={email}
            label="Email"
            isDisabled={showOTP}
            isInvalid={!!errorEmail}
            errorMessage={errorEmail}
            onValueChange={setEmail}
            labelPlacement="inside"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="underlined"
          />
          <InputOtp
            length={6}
            size={"lg"}
            classNames={{
              segment: "bg-stone-500",
              description: "text-xs text-gray-300",
            }}
            isInvalid={!!errorOTP}
            errorMessage={errorOTP}
            description={`Enter the OTP sent to ${email}`}
            value={otp}
            radius="full"
            variant="bordered"
            onValueChange={setOTP}
            className={cn("mx-auto", showOTP ? "visible" : "invisible")}
          />
          <Button
            className="w-full bg-blue-700 mt-4"
            isLoading={loading}
            isDisabled={!email || (showOTP && otp.length < 6)}
            color="primary"
            type="submit"
          >
            Log In
          </Button>
        </Form>
      </ModalBody>
    </ModalContent>
  );
}
