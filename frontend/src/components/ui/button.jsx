import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - Production-grade interaction design
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Brand action
        default: [
          "bg-primary text-primary-foreground",
          "shadow-smooth hover:shadow-smooth-md",
          "hover:bg-primary-hover",
          "active:shadow-smooth-sm",
        ].join(" "),

        // Destructive - Dangerous actions
        destructive: [
          "bg-danger text-primary-foreground",
          "shadow-smooth hover:shadow-smooth-md",
          "hover:bg-danger/90",
          "active:shadow-smooth-sm",
        ].join(" "),

        // Outline - Secondary action
        outline: [
          "border-2 border-border bg-background",
          "hover:bg-surface hover:border-border-hover",
          "active:bg-surface-hover",
        ].join(" "),

        // Secondary - Subtle action
        secondary: [
          "bg-surface text-foreground",
          "hover:bg-surface-hover",
          "active:bg-border",
        ].join(" "),

        // Ghost - Minimal action
        ghost: [
          "hover:bg-surface hover:text-foreground",
          "active:bg-surface-hover",
        ].join(" "),

        // Link - Text-only action
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary-hover",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), "rounded-lg", className)}
      ref={ref}
      {...props}
    />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
