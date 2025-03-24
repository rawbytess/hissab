import { Button, Modal, ModalContent, useDisclosure } from "@heroui/react";
import { LoginForm } from "@/components/user/auth/Login.tsx";

export default function LoginModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        className="text-white bg-violet-800 w-full mx-auto drop-shadow-lg"
        radius="lg"
        size="md"
        variant="flat"
        onPress={onOpen}
      >
        Get Started
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        shadow={"lg"}
        backdrop={"blur"}
      >
        <ModalContent>
          <LoginForm setOpen={onOpenChange} />
        </ModalContent>
      </Modal>
    </>
  );
}
