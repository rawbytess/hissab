import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useContext } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

export function PromptHistory() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isPaid } = useContext(SessionContext);
  return (
    <>
      <Button
        isIconOnly
        variant={"light"}
        size={"sm"}
        onPress={onOpen}
        className={"text-white disabled:cursor-not-allowed disabled:opacity-50"}
        disabled={!isPaid}
      >
        <Icon
          className={cn(
            "[&>path]:stroke-[2px]",
            !prompt ? "text-default-600" : "text-primary-foreground",
          )}
          icon="mdi:clipboard-text-history-outline"
          width={16}
        />
      </Button>
      <Drawer
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              x: 0,
              duration: 0.3,
            },
            exit: {
              x: 100,
              opacity: 0,
              duration: 0.3,
            },
          },
        }}
        onOpenChange={onOpenChange}
      >
        <DrawerContent className={"text-white"}>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Custom Motion Drawer
              </DrawerHeader>
              <DrawerBody>
                <p>This drawer has custom enter/exit animations.</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
