/// <reference path="../pb_data/types.d.ts" />

// ── Cron dispatcher: every minute ─────────────────────────────────────
cronAdd("reminders-dispatcher", "*/1 * * * *", () => {
  // Delivery is channel-agnostic: see pb_hooks/lib/notify.js
  const notify = require(`${__hooks}/lib/notify.js`)
  const now = new Date()

  // NB: everything is defined inside the callback on purpose — jsvm
  // handlers run in separate executor VMs without file-level bindings.
  //
  // User-provided fields end up inside the email HTML: escape them so
  // markup in titles/notes can't inject content into the message.
  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

  // Goja has no ICU: toLocaleDateString ignores locale and options, so
  // dates are formatted by hand in the user's preferred language.
  const LOCALES = {
    it: {
      subject: "Promemoria", category: "Categoria", date: "Data",
      footer: "Kura — Libretto sanitario personale",
      months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
               "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      formatDate: (d, months) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
      atTime: (dateStr, timeStr) => `${dateStr} alle ${timeStr}`,
    },
    en: {
      subject: "Reminder", category: "Category", date: "Date",
      footer: "Kura — Personal health record",
      months: ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"],
      formatDate: (d, months) => `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      atTime: (dateStr, timeStr) => `${dateStr} at ${timeStr}`,
    },
  }
  const pad2 = (n) => String(n).padStart(2, "0")

  // Filter DB-side: an empty date field comes back as a truthy DateTime
  // object in JS, so a `!r.get("sent_at")` check would never match.
  const pending = $app.findRecordsByFilter(
    "reminders",
    "sent_at = '' && fire_at <= {:now}",
    "fire_at", 0, 0,
    { now: now.toISOString().replace("T", " ") },
  )

  for (const reminder of pending) {
    try {
      const record = $app.findRecordById("records", reminder.get("record"))
      const user = $app.findRecordById("users", reminder.get("user"))
      if (!record || !user) continue

      // record.get("category") is the relation id; resolve it to the name.
      let category = ""
      const categoryId = record.get("category")
      if (categoryId) {
        try {
          category = $app.findRecordById("categories", categoryId).get("name")
        } catch (_) {
          // category was deleted; leave the label empty
        }
      }
      const L = LOCALES[user.get("language")] || LOCALES.it

      const rawDate = new Date(record.get("date"))
      const dateStr = L.formatDate(rawDate, L.months)
      const timeStr = `${pad2(rawDate.getHours())}:${pad2(rawDate.getMinutes())}`
      const whenStr = L.atTime(dateStr, timeStr)
      const description = record.get("description") || ""
      const reminderMsg = reminder.get("message") || ""

      const subject = `[Kura] ${L.subject}: ${record.get("title")}`
      const html = [
        `<h1>${escapeHtml(record.get("title"))}</h1>`,
        category ? `<p><strong>${L.category}:</strong> ${escapeHtml(category)}</p>` : "",
        `<p><strong>${L.date}:</strong> ${whenStr}</p>`,
        description ? `<p>${escapeHtml(description)}</p>` : "",
        reminderMsg ? `<p><em>${escapeHtml(reminderMsg)}</em></p>` : "",
        `<hr><p style="color:#888;font-size:12px">${L.footer}</p>`,
      ].join("\n")

      notify(user, {
        subject: subject,
        html: html,
        text: [
          record.get("title"),
          category ? `${L.category}: ${category}` : "",
          `${L.date}: ${whenStr}`,
        ].filter(Boolean).join("\n"),
      })

      reminder.set("sent_at", now.toISOString())
      $app.save(reminder)
    } catch (err) {
      // jsvm records expose .id, not .getId(); a throwing catch would
      // abort the whole dispatcher run and mask the original error.
      console.error(`[reminders] Failed to send reminder ${reminder.id}:`, err)
    }
  }
})
