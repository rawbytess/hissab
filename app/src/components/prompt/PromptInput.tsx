import type { TextAreaProps } from "@heroui/react";

import React, { useContext } from "react";
import { Textarea } from "@heroui/react";
import { cn } from "@heroui/react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    const { isPremium } = useContext(SessionContext);
    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="min-h-[6em] resize-none"
        classNames={{
          ...classNames,
          label: cn("hidden", classNames?.label),
          input: cn("py-0", classNames?.input),
        }}
        minRows={1}
        placeholder={
          isPremium ? "Enter your prompt here" : "Upgrade now to use AI"
        }
        radius="lg"
        variant="bordered"
        {...props}
      />
    );
  },
);

export default PromptInput;

PromptInput.displayName = "PromptInput";
