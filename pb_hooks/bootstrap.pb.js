/// <reference path="../pb_data/types.d.ts" />
// First-boot bootstrap: guarantees a superuser exists (default credentials
// unless overridden) and optionally creates a base app user when both
// USER_EMAIL and USER_PASSWORD are set. Never touches existing accounts.
onBootstrap((e) => {
  e.next()

  try {
    const superusers = $app.findCollectionByNameOrId("_superusers")
    if ($app.countRecords("_superusers") === 0) {
      const email = $os.getenv("ADMIN_EMAIL") || "admin@kura.local"
      const password = $os.getenv("ADMIN_PASSWORD") || "changeme123"
      const record = new Record(superusers, { email })
      record.setPassword(password)
      $app.save(record)
      console.log(`[bootstrap] Default admin created: ${email}`)
    } else {
      console.log("[bootstrap] Superuser already exists — skipping admin creation")
    }
  } catch (err) {
    console.error("[bootstrap] Failed to create default admin:", err)
  }

  try {
    const userEmail = $os.getenv("USER_EMAIL")
    const userPassword = $os.getenv("USER_PASSWORD")
    if (userEmail && userPassword) {
      const usersCol = $app.findCollectionByNameOrId("users")
      let existing = null
      try { existing = $app.findAuthRecordByEmail(usersCol.id, userEmail) } catch (_) {}

      if (!existing) {
        const record = new Record(usersCol, { email: userEmail, verified: true })
        record.setPassword(userPassword)
        $app.save(record)
        console.log(`[bootstrap] Default user created: ${userEmail}`)
      } else {
        console.log(`[bootstrap] User ${userEmail} already exists — skipping`)
      }
    }
  } catch (err) {
    console.error("[bootstrap] Failed to create default user:", err)
  }
})
