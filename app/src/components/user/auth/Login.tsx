import { useContext, useState } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { Button, Input, Form, InputOtp, cn } from "@heroui/react";
import { ModalContent, ModalHeader, ModalBody } from "@heroui/react";

export function LoginForm({
  setOpen,
}: React.ComponentPropsWithoutRef<"div"> & {
  setOpen: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");

  const { setSession, signInWithOTP, verifyOTP } = useContext(SessionContext);

  if (!setSession || !signInWithOTP || !verifyOTP) {
    return null;
  }

  return (
    <ModalContent className="text-white p-5">
      <ModalHeader>
        <p className="pb-4 text-left font-semibold">
          Enter your email to login or signup
        </p>
      </ModalHeader>
      <ModalBody>
        <Form
          className="flex flex-col gap-4"
          validationBehavior="native"
          onSubmit={async (event) => {
            event.preventDefault();
            console.log("Logging in");
            if (showOTP) {
              console.log("Verifying OTP");
              const res = await verifyOTP(email, otp);
              if (res.error) {
                console.error(res.error);
              } else {
                setShowOTP(false);
                setOpen(false);
                console.log(res.data);
              }
            } else {
              console.log("Sending email OTP");
              const res = await signInWithOTP(email);
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
          <Input
            isRequired
            value={email}
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
            color={"primary"}
            value={otp}
            radius={"full"}
            onValueChange={setOTP}
            className={cn("mx-auto", showOTP ? "visible" : "invisible")}
          />
          <Button
            className="w-full bg-blue-700 mt-4"
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
