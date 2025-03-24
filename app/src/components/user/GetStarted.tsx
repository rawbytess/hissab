import { Button, Card, CardFooter, CardBody, CardHeader } from "@heroui/react";
import LoginModal from "@/components/user/login/LoginModal.tsx";

export default function GetStarted() {
  return (
    <Card className={"bg-cyan-700 shadow-lg shadow-cyan-950"}>
      <CardHeader>Upgrade to Hissab AI</CardHeader>
      <CardBody>
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
