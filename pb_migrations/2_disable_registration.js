/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  // null = nobody can register via API; admin creates users manually from /_/
  users.createRule = null
  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")
  users.createRule = ""
  app.save(users)
})
