/// <reference path="../pb_data/types.d.ts" />
// Scheduled backups via PocketBase's native system (atomic pb_data
// snapshot + rotation). On by default: health data deserves a safety
// net. Set BACKUP_CRON=off to disable.
onBootstrap((e) => {
  e.next()

  const cron = $os.getenv("BACKUP_CRON") || "0 3 * * *"
  const maxKeep = parseInt($os.getenv("BACKUP_MAX_KEEP") || "7", 10)

  try {
    const settings = $app.settings()
    if (cron.toLowerCase() === "off") {
      settings.backups.cron = ""
      $app.save(settings)
      console.log("[backup] Scheduled backups DISABLED (BACKUP_CRON=off)")
    } else {
      settings.backups.cron = cron
      settings.backups.cronMaxKeep = maxKeep
      $app.save(settings)
      console.log(`[backup] Scheduled backups enabled: "${cron}" (keep last ${maxKeep})`)
    }
  } catch (err) {
    console.error("[backup] Failed to configure scheduled backups:", err)
  }
})
