import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useContext } from "react";
import { useSidebar } from "@/components/ui/sidebar.tsx";
import { useAuth } from "@/components/user/auth/AuthProvider";
import LoginModal from "@/components/user/login/LoginModal.tsx";

export default function GetStarted() {
  const { isAuthenticated, user } = useAuth();
  const { isMobile } = useSidebar();

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
        <div className="text-sm text-white">
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
              Talk in your own language
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
              Realtime data like finance, weather, and more
            </li>
          </ul>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        {isAuthenticated ? (
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
              window.open(
                `${import.meta.env.VITE_POLAR_CHECKOUT_URL}?customer_email=${user?.email}`,
                "_blank",
              );
            }}
          >
            Buy Now
          </Button>
        ) : (
          <LoginModal isMobile={isMobile} />
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
