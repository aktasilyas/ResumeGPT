import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        "flex h-10 w-full px-3 py-2",
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

        // File input
        "file:border-0 file:bg-transparent",
        "file:text-sm file:font-medium file:text-foreground",

        className
      )}
      ref={ref}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }
