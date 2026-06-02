import { Progress as BaseProgress } from "@base-ui/react/progress";
import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof BaseProgress.Root>,
  React.ComponentPropsWithoutRef<typeof BaseProgress.Root>
>(({ className, value, ...props }, ref) => (
  <BaseProgress.Root
    ref={ref}
    value={value}
    className={cn("flex w-full items-center gap-2", className)}
    {...props}
  >
    <BaseProgress.Track className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <BaseProgress.Indicator className="block h-full bg-primary transition-all" />
    </BaseProgress.Track>
  </BaseProgress.Root>
));
Progress.displayName = "Progress";

export { Progress };
