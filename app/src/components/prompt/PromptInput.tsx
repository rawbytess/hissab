import type { TextAreaProps } from "@heroui/react";
import { cn, Textarea } from "@heroui/react";
import React, { useContext } from "react";
import { useAuth } from "@/components/user/auth/AuthProvider";

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    const { isPremium } = useAuth();
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
          isPremium ? "Enter your prompt here" : "Subscribe to use AI features"
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
