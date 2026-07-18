import * as React from "react"

import { cn } from "@/lib/utils"

// §3.2: heading a due tonalità — solo per onboarding, empty state, saluto
// dashboard. Mai nelle UI dense (tabelle, form, modali): lì l'heading
// resta sans semplice (usare .page-header).
export interface TwoToneHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  emphasis: React.ReactNode
  as?: "h1" | "h2" | "p"
}

function TwoToneHeading({ children, emphasis, as: Comp = "p", className, ...props }: TwoToneHeadingProps) {
  const Tag = Comp as React.ElementType
  return (
    <Tag
      className={cn("text-[23px] font-semibold leading-[28px] tracking-[-0.02em]", className)}
      {...props}
    >
      {children}
      <em className="font-serif text-[1.06em] font-normal italic text-text-secondary">{emphasis}</em>
    </Tag>
  )
}

export { TwoToneHeading }
