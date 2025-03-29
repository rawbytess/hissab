import { Button, Card, CardFooter, CardBody, CardHeader } from "@heroui/react";
import LoginModal from "@/components/user/login/LoginModal.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { useContext } from "react";

export default function GetStarted() {
  const { session, metadata } = useContext(SessionContext);

  return (
    <Card
      className={
        "bg-[url(/images/tactile_noise.webp)] shadow-lg shadow-gray-950 "
      }
    >
      <CardHeader className={"justify-center text-yellow-300"}>
        Upgrade to Hissab AI
      </CardHeader>
      <CardBody className={"justify-center text-center"}>
        <p className="text-sm text-white">
          Get started with Hissab AI and start automating your accounting
          processes today.
        </p>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        <LoginModal />
        <Button
          className="text-white mx-auto "
          radius="lg"
          size="sm"
          variant="light"
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
