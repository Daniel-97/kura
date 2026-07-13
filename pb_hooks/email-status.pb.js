/// <reference path="../pb_data/types.d.ts" />
// Settings are superuser-only in PocketBase, but the app needs to warn
// users when email toggles can't actually deliver. Expose ONLY a
// boolean (no hosts, no credentials) to authenticated app users.
routerAdd("GET", "/api/kura/email-status", (e) => {
  return e.json(200, { emailEnabled: $app.settings().smtp.enabled === true })
}, $apis.requireAuth())
