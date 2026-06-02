import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { cn } from "@/lib/utils.ts";

interface PromptInputProps extends React.ComponentProps<"textarea"> {
  onValueChange?: (value: string) => void;
  minRows?: number;
  maxRows?: number;
}

const LINE_HEIGHT_PX = 24;

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    {
      className,
      onValueChange,
      onChange,
      value,
      minRows = 3,
      maxRows = 10,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => innerRef.current as HTMLTextAreaElement,
    );

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const max = maxRows * LINE_HEIGHT_PX;
      const next = Math.min(el.scrollHeight, max);
      el.style.height = `${next}px`;
    }, [value, maxRows]);

    return (
      <Textarea
        ref={innerRef}
        aria-label="Prompt"
        placeholder="Enter your prompt here"
        rows={minRows}
        value={value}
        onChange={(e) => {
          onValueChange?.(e.target.value);
          onChange?.(e);
        }}
        className={cn(
          "w-full resize-none border-0 bg-transparent px-2 pt-1 pb-6 pr-10 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
          `min-h-[${minRows * LINE_HEIGHT_PX}px]`,
          className,
        )}
        style={{ maxHeight: `${maxRows * LINE_HEIGHT_PX}px` }}
        {...props}
      />
    );
  },
);
PromptInput.displayName = "PromptInput";

export default PromptInput;
