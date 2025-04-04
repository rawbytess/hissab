import { Button, Card, CardFooter, CardBody, CardHeader } from "@heroui/react";
import LoginModal from "@/components/user/login/LoginModal.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { useContext } from "react";

export default function GetStarted() {
  const { session, metadata } = useContext(SessionContext);

  return (
    <Card
      className={
        "bg-[url(/images/tactile_noise.webp)] shadow-lg shadow-gray-950 ring-2 ring-purple-700 hover:ring-purple-600"
      }
    >
      <CardHeader className={"justify-center  bg-stone-900"}>
        <p
          className={
            "bg-gradient-to-tl from-sky-900 via-violet-500 to-slate-600 bg-clip-text text-transparent" +
            " font-bold tracking-wide text-center montserrat-font"
          }
        >
          Upgrade to Hissab AI
        </p>
      </CardHeader>
      <CardBody className={"justify-center text-center"}>
        <p className="text-sm text-white">
          {/* TODO Update this text to the correct one */}
          Get started with Hissab AI and start automating your accounting
          processes today.
        </p>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        {session ? (
          <Button
            className="text-white w-full mx-auto drop-shadow-lg
            bg-gradient-to-tl from-[#1e293b] via-[#6366f1] to-[#71717a]"
            radius="lg"
            size="md"
            variant="flat"
            onPress={() => {
              // TODO Update this URL to the correct one
              window.open("https://hissab.io/pricing", "_blank");
            }}
          >
            Buy Now
          </Button>
        ) : (
          <LoginModal />
        )}

        <Button
          className="text-white mx-auto underline underline-offset-2"
          radius="lg"
          size="sm"
          variant="light"
          onPress={() => {
            // TODO Update this URL to the correct one
            window.open("https://hissab.io/faqs", "_blank");
          }}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
