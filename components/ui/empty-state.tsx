import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <span className="mb-3 flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-[13px] leading-5 text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  )
}

export { EmptyState }
