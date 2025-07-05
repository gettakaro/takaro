// This is a version of the template for ory v1.3.0
function(ctx) {
  From: "noreply@takaro.io",
  To: ctx.recipient,
  Subject: if "template_data" in ctx && "subject" in ctx.template_data then ctx.template_data.subject else null,
  TextBody: if "template_data" in ctx && "body" in ctx.template_data then ctx.template_data.body else "",
  HtmlBody: if "template_data" in ctx && "body" in ctx.template_data then ctx.template_data.body else "",
  MessageStream: "outbound"
}