/// <reference path="../pb_data/types.d.ts" />

// ── Cron dispatcher: every minute ─────────────────────────────────────
cronAdd("reminders-dispatcher", "*/1 * * * *", () => {
  const now = new Date()

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
      const rawDate = new Date(record.get("date"))
      const dateStr = rawDate.toLocaleDateString("it-IT", {
        day: "numeric", month: "long", year: "numeric",
      })
      const timeStr = rawDate.toLocaleTimeString("it-IT", {
        hour: "2-digit", minute: "2-digit",
      })
      const description = record.get("description") || ""
      const reminderMsg = reminder.get("message") || ""

      const subject = `[Kura] Promemoria: ${record.get("title")}`
      const html = [
        `<h1>${record.get("title")}</h1>`,
        category ? `<p><strong>Categoria:</strong> ${category}</p>` : "",
        `<p><strong>Data:</strong> ${dateStr} alle ${timeStr}</p>`,
        description ? `<p>${description}</p>` : "",
        reminderMsg ? `<p><em>${reminderMsg}</em></p>` : "",
        `<hr><p style="color:#888;font-size:12px">Kura — Libretto sanitario personale</p>`,
      ].join("\n")

      const message = {
        from: { address: $app.settings().meta.senderAddress, name: $app.settings().meta.senderName },
        to: [{ address: user.get("email") }],
        subject: subject,
        html: html,
        text: [
          record.get("title"),
          category ? `Categoria: ${category}` : "",
          `Data: ${dateStr} alle ${timeStr}`,
        ].filter(Boolean).join("\n"),
      }

      $app.newMailClient().send(message)

      reminder.set("sent_at", now.toISOString())
      $app.save(reminder)
    } catch (err) {
      console.error(`[reminders] Failed to send reminder ${reminder.getId()}:`, err)
    }
  }
})
