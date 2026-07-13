/** Design system §6: tracciato ECG del logo per usi decorativi.
 *  §1.3: massimo una occorrenza per schermata. */
export default function EcgTrace({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 -10 290 200" className={`text-kura-300 ${className}`} aria-hidden="true">
      <path
        d="M0 40 L86 120 H132 L162 44 L196 176 L226 120 H290"
        fill="none" stroke="currentColor" strokeWidth={14}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}
