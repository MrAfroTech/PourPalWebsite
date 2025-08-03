# Stripe + Klaviyo Integration Setup Guide

## Overview
This integration handles vendor registration with automatic payment processing (Stripe) and email marketing automation (Klaviyo).

## Workflow
1. **User fills registration form** → Contact added to Klaviyo
2. **If Pro/Ultimate plan** → Stripe payment processed
3. **Payment success/failure** → Klaviyo events tracked
4. **Automated email sequences** → Triggered based on payment status

## Setup Steps

### 1. Stripe Setup

#### Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification
3. Get your API keys from the Dashboard

#### Configure API Keys
```bash
# Add to your .env file
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

#### Set Up Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/vendor-registration/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### 2. Klaviyo Setup

#### Create Klaviyo Account
1. Go to [klaviyo.com](https://klaviyo.com) and create an account
2. Set up your business profile

#### Get API Keys
1. Go to Klaviyo → Settings → API Keys
2. Create a Private API Key
3. Add to `.env`:
   ```bash
   KLAVIYO_PRIVATE_API_KEY=pk_your_private_key_here
   ```

#### Create List
1. Go to Klaviyo → Lists & Segments
2. Create new list: "Vendor Registrations"
3. Copy List ID to `.env`:
   ```bash
   KLAVIYO_LIST_ID=your_list_id_here
   ```

### 3. Backend Dependencies

Install required packages:
```bash
npm install stripe axios
```

### 4. Frontend Dependencies

Install Stripe.js:
```bash
npm install @stripe/stripe-js
```

### 5. Environment Variables

Complete your `.env` file:
```bash
# Google Maps Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_DEMO_MODE=true
REACT_APP_ENABLE_CONTINUOUS_TRACKING=false

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Klaviyo Configuration
KLAVIYO_PRIVATE_API_KEY=pk_your_klaviyo_private_api_key_here
KLAVIYO_LIST_ID=your_klaviyo_list_id_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Klaviyo Workflow Setup

### 1. Create Email Templates

#### Welcome Email (Free Plan)
- Trigger: "Free Plan Registration" event
- Content: Welcome message, next steps, platform benefits

#### Payment Success Email (Pro/Ultimate)
- Trigger: "Payment Successful" event
- Content: Welcome, account setup instructions, onboarding

#### Payment Failed Email
- Trigger: "Payment Failed" event
- Content: Payment retry instructions, support contact

### 2. Set Up Automation Flows

#### Free Plan Onboarding
1. Event: "Free Plan Registration"
2. Actions:
   - Send welcome email
   - Add to "Free Plan Users" segment
   - Schedule follow-up in 7 days

#### Paid Plan Onboarding
1. Event: "Payment Successful"
2. Actions:
   - Send welcome email
   - Add to "Paid Users" segment
   - Schedule onboarding sequence
   - Send setup instructions

#### Payment Recovery
1. Event: "Payment Failed"
2. Actions:
   - Send payment retry email
   - Add to "Payment Issues" segment
   - Schedule follow-up in 3 days

## Testing

### Test Stripe Integration
1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test webhook delivery in Stripe Dashboard

### Test Klaviyo Integration
1. Submit test registration
2. Check Klaviyo → Profiles for new contact
3. Verify events in Klaviyo → Metrics

## Production Deployment

### 1. Update Environment Variables
```bash
# Production Stripe keys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key

# Production webhook URL
# Update webhook endpoint to your production domain
```

### 2. Update Webhook URL
In Stripe Dashboard, update webhook endpoint to:
```
https://yourdomain.com/api/vendor-registration/webhook
```

### 3. Test Production Flow
1. Submit real registration with test card
2. Verify Klaviyo contact creation
3. Check email delivery
4. Test payment processing

## Monitoring

### Stripe Dashboard
- Monitor payments in Stripe Dashboard
- Check webhook delivery status
- Review payment analytics

### Klaviyo Dashboard
- Monitor contact growth
- Track email performance
- Review automation metrics

## Troubleshooting

### Common Issues

#### Payment Processing Fails
- Check Stripe API keys
- Verify webhook configuration
- Check server logs for errors

#### Klaviyo Contact Not Created
- Verify Klaviyo API key
- Check API rate limits
- Review contact properties

#### Webhook Not Receiving Events
- Verify webhook URL is accessible
- Check webhook secret
- Test webhook delivery in Stripe Dashboard

### Debug Steps
1. Check server logs for API errors
2. Verify environment variables
3. Test API endpoints directly
4. Monitor network requests in browser

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Validate all inputs** on server side
3. **Use HTTPS** in production
4. **Implement rate limiting** for API endpoints
5. **Monitor for suspicious activity**

## Support

- Stripe Documentation: https://stripe.com/docs
- Klaviyo Documentation: https://help.klaviyo.com
- API Reference: Check the respective platform docs 