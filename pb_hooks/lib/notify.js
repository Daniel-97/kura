/// <reference path="../../pb_data/types.d.ts" />
// Shared notification delivery for all dispatchers.
// API: notify(user, { subject, html, text })
//
// Today the only channel is email. Future channels (e.g. ntfy push via
// $http.send) plug in HERE, so dispatchers never need to change.
// Loaded from executor VMs with: require(`${__hooks}/lib/notify.js`)
module.exports = function notify(user, msg) {
  const settings = $app.settings()
  $app.newMailClient().send({
    from: { address: settings.meta.senderAddress, name: settings.meta.senderName },
    to: [{ address: user.get("email") }],
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  })
}
