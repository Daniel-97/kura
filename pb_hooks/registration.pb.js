/// <reference path="../pb_data/types.d.ts" />
onBootstrap((e) => {
    e.next()
    const allow = $os.getenv("ALLOW_REGISTRATION") === "true"
    try {
        const col = $app.findCollectionByNameOrId("users")
        col.createRule = allow ? "" : null
        $app.save(col)
        console.log("[registration] User registration is " + (allow ? "ENABLED" : "DISABLED"))
    } catch (err) {
        console.error("[registration] Failed to configure registration rule:", err)
    }
})
