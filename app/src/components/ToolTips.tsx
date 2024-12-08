import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export default function ToolTips({
  children,
  tip,
  side,
}: {
  children: React.ReactNode;
  tip: string;
  side?: "right" | "top" | "bottom" | "left";
}) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent className={"text-white bg-gray-800 rounded"} side={side}>
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
