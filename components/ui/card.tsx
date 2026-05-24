import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  glass = false,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  glass?: boolean
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-2xl",
        "text-sm text-card-foreground",
        "has-data-[slot=card-footer]:pb-0",
        "data-[size=sm]:gap-3 data-[size=sm]:py-3",
        // Glass vs solid Apple card
        glass
          ? [
              "bg-white/70 dark:bg-white/5",
              "backdrop-blur-xl backdrop-saturate-200",
              "border border-white/60 dark:border-white/10",
              "shadow-[0_2px_20px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.04)]",
              "dark:shadow-[0_2px_20px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(255,255,255,0.04)]",
            ]
          : [
              "bg-card py-4",
              "shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.05)]",
              "dark:shadow-[0_1px_4px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(255,255,255,0.04)]",
            ],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1",
        "rounded-t-2xl px-5 group-data-[size=sm]/card:px-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold text-base leading-snug tracking-tight",
        "group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-5 group-data-[size=sm]/card:px-4",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-2xl",
        "border-t border-border/60 dark:border-white/6",
        "bg-muted/40 dark:bg-white/3",
        "p-5 group-data-[size=sm]/card:p-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
