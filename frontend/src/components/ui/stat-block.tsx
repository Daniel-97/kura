import * as React from "react"

import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"

// §5.3: numero grande + eyebrow — pattern primario della dashboard e delle
// summary card. `mono`: usare per valori clinici (§3, sempre mono); i
// conteggi generici (es. "12 DOCUMENTS") restano sans per la regola §5.3.
export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode
  label: React.ReactNode
  unit?: React.ReactNode
  mono?: boolean
}

function StatBlock({ value, label, unit, mono, className, ...props }: StatBlockProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p
        className={cn(
          "text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums",
          mono ? "font-mono" : "font-sans"
        )}
      >
        {value}
        {unit && <span className="ml-1.5 text-sm font-normal text-text-muted">{unit}</span>}
      </p>
      <Eyebrow tone="muted">{label}</Eyebrow>
    </div>
  )
}

export { StatBlock }
