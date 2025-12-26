import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        "flex min-h-[80px] w-full px-3 py-2",
        "text-sm",

        // Surface & borders
        "bg-background border-2 border-border rounded-lg",

        // Typography
        "placeholder:text-foreground-subtle",

        // Focus state
        "transition-all duration-200",
        "focus-visible:outline-none",
        "focus-visible:border-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/20",

        // Hover state
        "hover:border-border-hover",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface",

        // Resize
        "resize-y",

        className
      )}
      ref={ref}
      {...props}
    />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
