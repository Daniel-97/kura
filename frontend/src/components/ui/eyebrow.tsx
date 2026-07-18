import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// §3.1: label mono maiuscola che apre ogni sezione/gruppo di card — il
// backbone della navigazione visiva. tone="muted" per i gruppi secondari.
const eyebrowVariants = cva(
  "font-mono text-[13px] font-medium uppercase leading-[18px] tracking-[0.08em]",
  {
    variants: {
      tone: {
        accent: "text-brand-accent",
        muted: "text-text-muted",
      },
    },
    defaultVariants: { tone: "accent" },
  }
)

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof eyebrowVariants> {
  as?: "p" | "span" | "h2" | "h3"
}

function Eyebrow({ className, tone, as: Comp = "p", ...props }: EyebrowProps) {
  const Tag = Comp as React.ElementType
  return <Tag className={cn(eyebrowVariants({ tone }), className)} {...props} />
}

export { Eyebrow, eyebrowVariants }
