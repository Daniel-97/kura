/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCol = app.findCollectionByNameOrId("users")

  // ── records ──────────────────────────────────────────────────────────────
  const records = new Collection({
    name: "records",
    type: "base",
    fields: [
      { type: "text",     name: "title",       required: true,  max: 500 },
      { type: "date",     name: "date",         required: true },
      { type: "text",     name: "description" },
      {
        type: "select",   name: "category",    required: true,
        maxSelect: 1,
        values: ["visita", "esame", "referto", "altro"],
      },
      // Comma-separated free-form tags; filter with `tags ~ "value"` (LIKE)
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
  })
  app.save(records)

  // ── blood_pressure ────────────────────────────────────────────────────────
  const bp = new Collection({
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
  })
  app.save(bp)
}, (app) => {
  for (const name of ["records", "blood_pressure"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
})
