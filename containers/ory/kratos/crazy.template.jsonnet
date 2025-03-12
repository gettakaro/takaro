// Postmark API integration template for Ory Kratos
function(ctx) {
  // Extract basic fields from the context
  local recipient = ctx.recipient,
  local template_type = ctx.template_type,
  
  // Extract data from template_data if it exists
  local hasTemplateData = "template_data" in ctx,
  local templateData = if hasTemplateData then ctx.template_data else {},
  
  // Extract recovery-specific fields
  local recoveryCode = if hasTemplateData && "recovery_code" in templateData then templateData.recovery_code 
                       else if "recovery_code" in ctx then ctx.recovery_code 
                       else null,
  
  // Handle other template-specific fields
  local recoveryUrl = if hasTemplateData && "recovery_url" in templateData then templateData.recovery_url 
                      else if "recovery_url" in ctx then ctx.recovery_url 
                      else null,
  local verificationCode = if hasTemplateData && "verification_code" in templateData then templateData.verification_code 
                           else if "verification_code" in ctx then ctx.verification_code 
                           else null,
  local verificationUrl = if hasTemplateData && "verification_url" in templateData then templateData.verification_url 
                          else if "verification_url" in ctx then ctx.verification_url 
                          else null,
  local loginCode = if hasTemplateData && "login_code" in templateData then templateData.login_code 
                    else if "login_code" in ctx then ctx.login_code 
                    else null,
  local registrationCode = if hasTemplateData && "registration_code" in templateData then templateData.registration_code 
                           else if "registration_code" in ctx then ctx.registration_code 
                           else null,
  
  // Generate subject based on template type
  local generatedSubject = 
    if template_type == "recovery_code_valid" then "Recover access to your account"
    else if template_type == "verification_valid" then "Verify your email address"
    else if template_type == "login_code_valid" then "Your login code"
    else if template_type == "registration_code_valid" then "Your registration code"
    else "Notification from Takaro",
  
  // Generate body based on template type and available codes
  local generatedBody = 
    if template_type == "recovery_code_valid" && recoveryCode != null then 
      "Hi,\n\nplease recover access to your account by entering the following code:\n\n" + recoveryCode + "\n"
    else if template_type == "verification_valid" && verificationCode != null then 
      "Hi,\n\nplease verify your email address by entering the following code:\n\n" + verificationCode + "\n"
    else if template_type == "login_code_valid" && loginCode != null then 
      "Hi,\n\nplease log in to your account by entering the following code:\n\n" + loginCode + "\n"
    else if template_type == "registration_code_valid" && registrationCode != null then 
      "Hi,\n\nplease complete your registration by entering the following code:\n\n" + registrationCode + "\n"
    else "Hi,\n\nThis is a notification from Takaro.\n",
  
  // Try to use provided subject/body first, then fall back to generated ones
  local subject = if hasTemplateData && "subject" in templateData && templateData.subject != null 
                  then templateData.subject 
                  else if "subject" in ctx && ctx.subject != null 
                  then ctx.subject 
                  else generatedSubject,
  
  local body = if hasTemplateData && "body" in templateData && templateData.body != null 
               then templateData.body 
               else if "body" in ctx && ctx.body != null 
               then ctx.body 
               else generatedBody,
  
  // Construct the Postmark API request
  From: "noreply@takaro.io",
  To: recipient,
  Subject: subject,
  TextBody: body,
  MessageStream: "outbound"
}