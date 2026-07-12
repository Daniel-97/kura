/// <reference path="../pb_data/types.d.ts" />
onBootstrap((e) => {
  e.next()

  const host = $os.getenv("SMTP_HOST")
  const port = parseInt($os.getenv("SMTP_PORT") || "587")
  const username = $os.getenv("SMTP_USERNAME")
  const password = $os.getenv("SMTP_PASSWORD")
  const fromAddress = $os.getenv("SMTP_FROM")
  const fromName = $os.getenv("SMTP_FROM_NAME") || "Kura"
  const appUrl = $os.getenv("APP_URL") || "http://localhost:8090"

  if (host && username && password && fromAddress) {
    const settings = $app.settings()

    settings.smtp.enabled = true
    settings.smtp.host = host
    settings.smtp.port = port
    settings.smtp.username = username
    settings.smtp.password = password
    settings.smtp.authMethod = "PLAIN"
    settings.smtp.tls = port === 465

    settings.meta.senderAddress = fromAddress
    settings.meta.senderName = fromName
    settings.meta.appURL = appUrl

    $app.save(settings)
    console.log("[smtp] SMTP configured via env vars")
  } else {
    console.log("[smtp] SMTP env vars not set — email sending disabled")
  }
})
