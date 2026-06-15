/// <reference path="../pb_data/types.d.ts" />

// ── Cron dispatcher: every minute ─────────────────────────────────────
cronAdd("reminders-dispatcher", "*/1 * * * *", () => {
  const now = new Date()

  const all = $app.findAllRecords("reminders")
  const pending = all.filter((r) => !r.get("sent_at"))

  for (const reminder of pending) {
    const fireAt = new Date(reminder.get("fire_at"))
    if (fireAt > now) continue

    try {
      const record = $app.findRecordById("records", reminder.get("record"))
      const user = $app.findRecordById("users", reminder.get("user"))
      if (!record || !user) continue

      const category = record.get("category") || ""
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
        `<p><strong>Categoria:</strong> ${category}</p>`,
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
        text: `${record.get("title")}\nCategoria: ${category}\nData: ${dateStr} alle ${timeStr}`,
      }

      $app.newMailClient().send(message)

      reminder.set("sent_at", now.toISOString())
      $app.save(reminder)
    } catch (err) {
      console.error(`[reminders] Failed to send reminder ${reminder.getId()}:`, err)
    }
  }
})
