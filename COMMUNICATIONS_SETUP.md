# SMS and Email Communications Setup

This guide explains how to set up actual SMS and email sending through Klaviyo for your vendor registration form.

## What's Been Added

### 1. Immediate Communications
When a vendor registers, the system now sends:
- **Welcome Email** - Immediate email confirmation
- **Welcome SMS** - Immediate SMS confirmation (if phone provided)

### 2. New Functions Added
- `sendWelcomeEmail()` - Sends welcome email via Klaviyo
- `sendWelcomeSMS()` - Sends welcome SMS via Klaviyo
- Test endpoint for debugging communications

## Setup Steps

### 1. Create Klaviyo Email Template
1. Go to your Klaviyo dashboard
2. Navigate to **Templates** → **Email Templates**
3. Create a new template called `welcome_vendor_email`
4. Use these variables in your template:
   - `{{vendor_name}}` - Vendor's name
   - `{{business_name}}` - Business name
   - `{{plan}}` - Selected plan (free/pro/ultimate)
   - `{{setup_url}}` - Setup link

### 2. Create Klaviyo SMS Template
1. Go to **Templates** → **SMS Templates**
2. Create a new template called `welcome_vendor_sms`
3. Use these variables:
   - `{{vendor_name}}` - Vendor's name
   - `{{plan}}` - Selected plan

### 3. Environment Variables
Add these to your `.env` file:
```env
KLAVIYO_WELCOME_EMAIL_TEMPLATE_ID=welcome_vendor_email
KLAVIYO_WELCOME_SMS_TEMPLATE_ID=welcome_vendor_sms
```

### 4. Test the Communications

#### Option A: Test via API
```bash
node test-communications.js
```

#### Option B: Test via Registration
1. Fill out the vendor registration form
2. Check the response for `communications` object
3. Verify emails/SMS are received

## How It Works

### Registration Flow
1. User submits vendor registration form
2. Contact is added to Klaviyo
3. **Immediate welcome email** is sent
4. **Immediate welcome SMS** is sent (if phone provided)
5. User receives confirmation with communication status

### Response Format
```json
{
  "success": true,
  "message": "Registration successful!",
  "klaviyoProfileId": "01HXXXXXXX",
  "communications": {
    "email": true,
    "sms": true
  }
}
```

## Troubleshooting

### Email Not Sending
1. Check Klaviyo API key is correct
2. Verify email template exists in Klaviyo
3. Check Klaviyo logs for errors

### SMS Not Sending
1. Verify phone number format (10+ digits)
2. Check SMS is enabled in Klaviyo
3. Ensure SMS template exists

### Testing
Use the test endpoint:
```bash
curl -X POST http://localhost:3001/api/test-klaviyo-communications \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "YOUR_PROFILE_ID",
    "vendorName": "Test Vendor",
    "businessName": "Test Bar",
    "selectedPlan": "free",
    "phone": "5551234567",
    "email": "test@example.com"
  }'
```

## Template Examples

### Email Template
```
Subject: Welcome to EzDrink, {{vendor_name}}!

Hi {{vendor_name}},

Welcome to EzDrink! Your {{plan}} plan is now active.

Business: {{business_name}}
Plan: {{plan}}

We'll be in touch within 24 hours to complete your setup.

Setup your account: {{setup_url}}

Best regards,
The EzDrink Team
```

### SMS Template
```
Welcome to EzDrink, {{vendor_name}}! Your {{plan}} plan is now active. We'll be in touch within 24 hours to complete your setup. Reply STOP to unsubscribe.
```

## Next Steps

1. **Customize templates** in Klaviyo dashboard
2. **Test with real data** using the test script
3. **Monitor delivery** in Klaviyo analytics
4. **Set up follow-up sequences** for ongoing communication 