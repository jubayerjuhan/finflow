import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — Apple button foundation
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "font-semibold whitespace-nowrap tracking-tight",
    "transition-all duration-150 ease-out",
    "outline-none select-none",
    "active:scale-[0.96]",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:ring-3 focus-visible:ring-ring/35",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // Apple Blue pill — primary CTA
        default: [
          "bg-primary text-white",
          "shadow-[0_1px_3px_rgba(0,122,255,0.3),0_1px_2px_rgba(0,122,255,0.2)]",
          "hover:brightness-110 active:brightness-90",
        ],
        // Tinted — secondary action (translucent blue fill)
        secondary: [
          "bg-primary/12 text-primary dark:bg-primary/20 dark:text-blue-300",
          "hover:bg-primary/18 dark:hover:bg-primary/28",
        ],
        // Outlined — tertiary
        outline: [
          "border border-border bg-card text-foreground",
          "hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
        ],
        // Ghost — minimal
        ghost: [
          "text-foreground",
          "hover:bg-muted dark:hover:bg-white/8",
        ],
        // Destructive — Apple Red
        destructive: [
          "bg-destructive/12 text-destructive dark:bg-destructive/20",
          "hover:bg-destructive/18 dark:hover:bg-destructive/28",
        ],
        // Link style
        link: "text-primary underline-offset-4 hover:underline font-medium",
      },
      size: {
        // Apple standard touch target: 44px
        default: "h-11 rounded-xl px-5 text-[15px]",
        sm:      "h-9 rounded-xl px-4 text-[13px]",
        lg:      "h-13 rounded-2xl px-7 text-[17px]",
        xs:      "h-7 rounded-lg px-3 text-xs",
        // Icon buttons
        icon:    "size-11 rounded-xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
