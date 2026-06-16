/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Helper: only create if collection doesn't exist (idempotent init).
  const createIfMissing = (factory) => {
    try {
      app.save(factory())
    } catch (e) {
      if (!String(e).match(/must be unique|already exists/i)) throw e
    }
  }

  const usersCol = app.findCollectionByNameOrId("users")

  // ── categories ────────────────────────────────────────────────────
  createIfMissing(() => new Collection({
    name: "categories",
    type: "base",
    fields: [
      { type: "text",     name: "name",  required: true, max: 50 },
      { type: "text",     name: "color", required: true, max: 20 },
      {
        type: "relation", name: "user",  required: true,
        collectionId: usersCol.id, maxSelect: 1,
        cascadeDelete: true,
      },
    ],
    listRule:   '@request.auth.id != "" && user = @request.auth.id',
    viewRule:   '@request.auth.id != "" && user = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
    updateRule: '@request.auth.id != "" && user = @request.auth.id',
    deleteRule: '@request.auth.id != "" && user = @request.auth.id',
  }))

  // ── records ────────────────────────────────────────────────────────
  createIfMissing(() => new Collection({
    name: "records",
    type: "base",
    fields: [
      { type: "text",     name: "title",       required: true,  max: 500 },
      { type: "date",     name: "date",         required: true },
      { type: "text",     name: "description" },
      {
        type: "relation", name: "category",   required: false,
        collectionId: "categories",
        maxSelect: 1,
        cascadeDelete: false,
      },
      { type: "text",     name: "tags" },
      {
        type: "file",     name: "file",
        maxSelect: 5,
        mimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
      },
      {
        type: "relation", name: "user",         required: true,
        collectionId: usersCol.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
    ],
    listRule:   '@request.auth.id != "" && user = @request.auth.id',
    viewRule:   '@request.auth.id != "" && user = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
    updateRule: '@request.auth.id != "" && user = @request.auth.id',
    deleteRule: '@request.auth.id != "" && user = @request.auth.id',
  }))

  // ── blood_pressure ─────────────────────────────────────────────────
  createIfMissing(() => new Collection({
    name: "blood_pressure",
    type: "base",
    fields: [
      { type: "number",  name: "systolic",    required: true,  min: 50,  max: 260 },
      { type: "number",  name: "diastolic",   required: true,  min: 30,  max: 200 },
      { type: "number",  name: "pulse",                        min: 20,  max: 300 },
      { type: "date",    name: "measured_at", required: true },
      { type: "text",    name: "notes" },
      {
        type: "relation", name: "user",        required: true,
        collectionId: usersCol.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
    ],
    listRule:   '@request.auth.id != "" && user = @request.auth.id',
    viewRule:   '@request.auth.id != "" && user = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
    updateRule: '@request.auth.id != "" && user = @request.auth.id',
    deleteRule: '@request.auth.id != "" && user = @request.auth.id',
  }))

  // ── reminders ──────────────────────────────────────────────────────
  createIfMissing(() => {
    const recordsCol = app.findCollectionByNameOrId("records")
    return new Collection({
    name: "reminders",
    type: "base",
    fields: [
      {
        type: "relation", name: "record", required: true,
        collectionId: recordsCol.id, maxSelect: 1,
        cascadeDelete: true,
      },
      {
        type: "relation", name: "user", required: true,
        collectionId: usersCol.id, maxSelect: 1,
        cascadeDelete: true,
      },
      { type: "date", name: "fire_at", required: true },
      { type: "date", name: "sent_at" },
      { type: "text", name: "message" },
    ],
    listRule:   '@request.auth.id != "" && user = @request.auth.id',
    viewRule:   '@request.auth.id != "" && user = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
    updateRule: '@request.auth.id != "" && user = @request.auth.id',
    deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    })
  })

  // ── Disable user registration (default off; ALLOW_REGISTRATION env overrides at boot) ──
  usersCol.createRule = null
  app.save(usersCol)
}, (app) => {
  for (const name of ["reminders", "records", "categories", "blood_pressure"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
  try {
    const users = app.findCollectionByNameOrId("users")
    users.createRule = ""
    app.save(users)
  } catch (_) {}
})
