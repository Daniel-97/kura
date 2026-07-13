/// <reference path="../pb_data/types.d.ts" />

// ── Therapies dispatcher: every minute ────────────────────────────────
// Recurring intakes (next_due) and package-expiry warnings
// (expiry_notice_at). next_due always advances, even for therapies with
// email disabled, so it never goes stale.
cronAdd("therapies-dispatcher", "*/1 * * * *", () => {
  // NB: everything defined inside the callback — jsvm handlers run in
  // separate executor VMs without file-level bindings.
  const notify = require(`${__hooks}/lib/notify.js`)
  const now = new Date()
  const nowStr = now.toISOString().replace("T", " ")

  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

  const LOCALES = {
    it: {
      therapySubject: "Terapia", dosage: "Dosaggio", time: "Orario",
      expirySubject: "Medicinale in scadenza",
      expiresOn: "Scade il", footer: "Kura — Libretto sanitario personale",
      months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
               "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      formatDate: (d, months) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    },
    en: {
      therapySubject: "Therapy", dosage: "Dosage", time: "Time",
      expirySubject: "Medicine expiring",
      expiresOn: "Expires on", footer: "Kura — Personal health record",
      months: ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"],
      formatDate: (d, months) => `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    },
  }

  // Same algorithm as nextOccurrence in
  // frontend/src/features/therapies/therapyUtils.ts — keep in sync.
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const nextOccurrence = (from, every, unit, time) => {
    const out = new Date(from)
    if (unit === "day") {
      out.setDate(out.getDate() + every)
    } else if (unit === "week") {
      out.setDate(out.getDate() + every * 7)
    } else {
      const months = unit === "month" ? every : every * 12
      const total = out.getMonth() + months
      const year = out.getFullYear() + Math.floor(total / 12)
      const month = total % 12
      out.setFullYear(year, month, Math.min(out.getDate(), daysInMonth(year, month)))
    }
    if (time) {
      const parts = time.split(":")
      out.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0)
    }
    return out
  }

  const userLocale = (user) => LOCALES[user.get("language")] || LOCALES.it

  // ── 1. Recurring occurrences due ────────────────────────────────────
  const due = $app.findRecordsByFilter(
    "therapies",
    "next_due != '' && next_due <= {:now} && (end_date = '' || end_date >= {:now})",
    "next_due", 0, 0, { now: nowStr },
  )
  for (const therapy of due) {
    try {
      const user = $app.findRecordById("users", therapy.get("user"))
      if (!user) continue

      if (therapy.get("email_enabled")) {
        const L = userLocale(user)
        const name = therapy.get("name")
        const dosage = therapy.get("dosage") || ""
        const time = therapy.get("time") || ""
        const notes = therapy.get("notes") || ""
        notify(user, {
          subject: `[Kura] ${L.therapySubject}: ${name}`,
          html: [
            `<h1>${escapeHtml(name)}</h1>`,
            dosage ? `<p><strong>${L.dosage}:</strong> ${escapeHtml(dosage)}</p>` : "",
            time ? `<p><strong>${L.time}:</strong> ${time}</p>` : "",
            notes ? `<p>${escapeHtml(notes)}</p>` : "",
            `<hr><p style="color:#888;font-size:12px">${L.footer}</p>`,
          ].filter(Boolean).join("\n"),
          text: [name, dosage, time].filter(Boolean).join("\n"),
        })
      }

      // Always advance past now: one email after downtime, never a backlog.
      let next = new Date(therapy.get("next_due"))
      const every = therapy.get("every") || 1
      const unit = therapy.get("unit") || "day"
      const time = therapy.get("time") || ""
      while (next <= now) next = nextOccurrence(next, every, unit, time)
      therapy.set("next_due", next.toISOString())
      $app.save(therapy)
    } catch (err) {
      console.error(`[therapies] Failed recurrence for ${therapy.id}:`, err)
    }
  }

  // ── 2. Package expiry warnings ──────────────────────────────────────
  const expiring = $app.findRecordsByFilter(
    "therapies",
    "expiry_notice_at != '' && expiry_notice_at <= {:now} && expiry_notified = ''",
    "expiry", 0, 0, { now: nowStr },
  )
  for (const therapy of expiring) {
    try {
      const user = $app.findRecordById("users", therapy.get("user"))
      if (!user) continue

      const L = userLocale(user)
      const name = therapy.get("name")
      const expiry = new Date(therapy.get("expiry"))
      const dateStr = L.formatDate(expiry, L.months)
      notify(user, {
        subject: `[Kura] ${L.expirySubject}: ${name}`,
        html: [
          `<h1>${escapeHtml(name)}</h1>`,
          `<p><strong>${L.expiresOn}:</strong> ${dateStr}</p>`,
          `<hr><p style="color:#888;font-size:12px">${L.footer}</p>`,
        ].join("\n"),
        text: `${name}\n${L.expiresOn}: ${dateStr}`,
      })

      therapy.set("expiry_notified", now.toISOString())
      $app.save(therapy)
    } catch (err) {
      console.error(`[therapies] Failed expiry notice for ${therapy.id}:`, err)
    }
  }
})
