import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// §5.6: chip per categorie e tag — bordo hairline, radius-full, mono 11px,
// pallino colorato opzionale (mai sfondo pieno colorato). Le varianti di
// tono (up/warn/down) coprono anche le piccole etichette di stato (es.
// scadenze in arrivo), che nel doc condividono lo stesso pattern visivo.
const chipVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium leading-none",
  {
    variants: {
      tone: {
        neutral: "border-border text-text-secondary",
        up: "border-transparent bg-status-up-soft text-status-up",
        warn: "border-transparent bg-status-warn-soft text-status-warn",
        down: "border-transparent bg-status-down-soft text-status-down",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  /** Colore del pallino 6px (es. var(--cat-rx)). Omesso = nessun pallino. */
  dotColor?: string
  /** In alternativa a dotColor: classe Tailwind per il pallino (es. bg-indigo-500). */
  dotClassName?: string
}

function Chip({ className, tone, dotColor, dotClassName, children, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ tone }), className)} {...props}>
      {(dotColor || dotClassName) && (
        <span
          aria-hidden="true"
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClassName)}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      )}
      {children}
    </span>
  )
}

export { Chip, chipVariants }
