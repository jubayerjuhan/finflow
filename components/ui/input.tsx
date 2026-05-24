import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Apple filled-style input — no visible border, filled bg
        "h-11 w-full min-w-0",
        "rounded-xl",
        "bg-input/70 dark:bg-white/8",
        "px-4 py-2.5",
        "text-[15px] text-foreground",
        "placeholder:text-muted-foreground",
        // Subtle inset shadow (Apple uses this on text fields)
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
        "transition-all duration-150",
        // Border only visible on focus — Apple style
        "border border-transparent",
        "focus-visible:border-ring/50 focus-visible:bg-card dark:focus-visible:bg-white/10",
        "focus-visible:ring-3 focus-visible:ring-ring/20",
        "focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        // States
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
