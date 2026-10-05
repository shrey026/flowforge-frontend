import * as React from "react"
import { cn } from "cn"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm border border-border bg-background px-1 font-mono text-[10px] leading-none font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
