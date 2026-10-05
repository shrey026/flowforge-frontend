"use client"

import * as React from "react"
import { cn } from "cn"

export interface FilterTabOption<T extends string> {
  value: T
  label: string
  count?: number
  disabled?: boolean
  hint?: string
}

/**
 * Underlined tab strip for switching a filter or view on the current page.
 * Rendered as a group of toggle buttons since it changes what a single list
 * shows rather than swapping between separate panels.
 */
function FilterTabs<T extends string>({
  options,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: {
  options: FilterTabOption<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  "aria-label": string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-4 overflow-x-auto shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative flex h-9 shrink-0 items-center gap-1.5 border-b-2 border-transparent text-[13px] font-medium text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:text-foreground focus-visible:underline focus-visible:underline-offset-4 disabled:pointer-events-none disabled:opacity-50",
              isActive && "border-brand text-foreground"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="font-mono text-[11px] font-normal text-muted-foreground tabular-nums">
                {option.count}
              </span>
            )}
            {option.hint && (
              <span className="eyebrow">{option.hint}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { FilterTabs }
