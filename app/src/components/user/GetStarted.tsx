import { Button, Card, CardFooter, CardBody, CardHeader } from "@heroui/react";
import LoginModal from "@/components/user/login/LoginModal.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { useContext } from "react";
import { Icon } from "@iconify/react";

export default function GetStarted() {
  const { session } = useContext(SessionContext);

  return (
    <Card
      className={
        "bg-[url(/images/tactile_noise.webp)] shadow-lg rounded shadow-gray-950 ring-2 ring-purple-700 hover:ring-purple-600"
      }
    >
      <CardHeader className={"justify-center  bg-stone-900"}>
        <p
          className={
            "text-purple-300" +
            " font-bold tracking-wide text-center montserrat-font"
          }
        >
          Subscribe to Hissab AI
        </p>
      </CardHeader>
      <CardBody className={"justify-center text-center"}>
        <p className="text-sm text-white">
          <ul className="flex flex-col gap-2">
            <li
              className={
                "grid grid-cols-[auto_1fr] gap-4 items-start text-start"
              }
            >
              <Icon
                icon="meteor-icons:check-double"
                color={"green"}
                width={20}
              />
              Full natural language prompts
            </li>
            <li
              className={
                "grid grid-cols-[auto_1fr] gap-4 items-start text-start"
              }
            >
              <Icon
                icon="meteor-icons:check-double"
                color={"green"}
                width={20}
              />
              Accurate results with no hallucinations
            </li>
            <li
              className={
                "grid grid-cols-[auto_1fr] gap-4 items-start text-start"
              }
            >
              <Icon
                icon="meteor-icons:check-double"
                color={"green"}
                width={20}
              />
              Attach and reference files, images, and documents
            </li>
          </ul>
        </p>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        {session ? (
          <Button
            className="text-white w-full mx-auto drop-shadow-lg
            bg-purple-700"
            radius="sm"
            size="md"
            variant="flat"
            endContent={
              <Icon icon="gridicons:external" color={"white"} width={20} />
            }
            onPress={() => {
              window.open("https://hissab.lemonsqueezy.com", "_blank");
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
            window.open(
              `${import.meta.env.VITE_HISSAB_WEBSITE_URL}/pricing`,
              "_blank",
            );
          }}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
