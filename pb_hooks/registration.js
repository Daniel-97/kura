/// <reference path="../pb_data/types.d.ts" />
onBootstrap((e) => {
    e.next()
    const allow = $os.getEnv("ALLOW_REGISTRATION") === "true"
    const col = $app.findCollectionByNameOrId("users")
    col.createRule = allow ? "" : null
    $app.save(col)
})
