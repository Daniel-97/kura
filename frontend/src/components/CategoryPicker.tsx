import type { CategoryColor } from '@/lib/types'
import { CATEGORY_COLORS, SWATCH_CLASSES } from '@/lib/category-styles'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  value: CategoryColor
  onChange: (color: CategoryColor) => void
  ariaLabel?: string
}

export default function CategoryPicker({ value, onChange, ariaLabel }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 border-background ring-1 ring-border transition-transform hover:scale-110',
            SWATCH_CLASSES[color],
            value === color && 'ring-2 ring-foreground scale-110',
          )}
        />
      ))}
    </div>
  )
}
