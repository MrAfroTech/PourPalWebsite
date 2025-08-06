# Klaviyo Sales Funnel Integration - Complete Setup Guide

## 🎯 Overview

This system provides a comprehensive sales funnel automation that triggers when users are added to your "Vendor Signup" Klaviyo list. It includes multi-channel flows, cross-platform integration, engagement scoring, and behavioral campaigns.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Klaviyo      │    │   Your Backend  │    │   Cross-Platform│
│   Webhooks     │───▶│   Intelligence  │───▶│   Integrations  │
│                │    │   Hub           │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Customer      │
                       │   Database      │
                       │   (Unified)     │
                       └─────────────────┘
```

## 🔧 Required Environment Variables

### Core Klaviyo Configuration
```bash
# Klaviyo API Keys
KLAVIYO_PRIVATE_API_KEY=pk_your_klaviyo_private_api_key_here
KLAVIYO_LIST_ID=your_klaviyo_list_id_here
KLAVIYO_WEBHOOK_SECRET=whsec_your_klaviyo_webhook_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Cross-Platform Webhook Secrets (Optional)
CLOVER_WEBHOOK_SECRET=your_clover_webhook_secret_here
SQUARE_WEBHOOK_SECRET=your_square_webhook_secret_here
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📋 Setup Steps

### 1. Klaviyo Configuration

#### A. Get Your Klaviyo API Keys
1. Go to [Klaviyo Dashboard](https://app.klaviyo.com/)
2. Navigate to **Settings → API Keys**
3. Copy your **Private API Key**
4. Note your **List ID** (the list where vendor signups are added)

#### B. Create Klaviyo Webhook
1. In Klaviyo Dashboard, go to **Settings → Webhooks**
2. Click **Create Webhook**
3. Configure:
   - **URL**: `https://yourdomain.com/api/webhooks/klaviyo`
   - **Events**: Select all relevant events (profile.subscribed, email.opened, etc.)
   - **Secret**: Generate a secure webhook secret
4. Copy the webhook secret to your environment variables

### 2. Stripe Configuration

#### A. Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → API Keys**
3. Copy your **Secret Key** and **Publishable Key**

#### B. Create Stripe Webhook
1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Events**: Select relevant events (customer.subscription.created, invoice.payment_succeeded, etc.)
4. Copy the webhook secret to your environment variables

### 3. Cross-Platform Integration (Optional)

#### A. Clover Integration
1. Get your Clover API credentials
2. Set up webhook endpoint: `/api/webhooks/clover`
3. Add `CLOVER_WEBHOOK_SECRET` to environment variables

#### B. Square Integration
1. Get your Square API credentials
2. Set up webhook endpoint: `/api/webhooks/square`
3. Add `SQUARE_WEBHOOK_SECRET` to environment variables

#### C. Shopify Integration
1. Get your Shopify API credentials
2. Set up webhook endpoint: `/api/webhooks/shopify`
3. Add `SHOPIFY_WEBHOOK_SECRET` to environment variables

## 🚀 Installation & Deployment

### 1. Install Dependencies
```bash
npm install axios crypto express cors dotenv stripe
```

### 2. Set Environment Variables
Create a `.env` file in your project root:
```bash
# Copy the environment variables from above
```

### 3. Start the Server
```bash
npm run server
```

### 4. Test Webhook Endpoints
```bash
# Test Klaviyo webhook
curl -X POST http://localhost:3001/api/webhooks/klaviyo \
  -H "Content-Type: application/json" \
  -H "x-klaviyo-signature: test" \
  -H "x-klaviyo-timestamp: $(date +%s)" \
  -d '{"data":[{"type":"profile.subscribed","attributes":{"email":"test@example.com"}}]}'

# Test Stripe webhook
curl -X POST http://localhost:3001/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{"type":"customer.subscription.created","data":{"object":{"id":"sub_123"}}}'
```

## 📊 Multi-Channel Flow Logic

### Welcome Sequence (Immediate)
- **Email**: Welcome email with setup guide
- **SMS**: Welcome message (if phone available)
- **Trigger**: New profile subscription

### Nurture Sequence (Days 2-14)
- **Day 2**: "How EzDrink Saves You 30% on Wait Times"
- **Day 4**: "See How Top Bars Increase Revenue by 25%"
- **Day 7**: "Your Competitors Are Missing This Opportunity"
- **Day 10**: "3 Ways EzDrink Pays for Itself"
- **Day 14**: "Ready to Transform Your Business?"

### Conversion Sequence (Days 15-30)
- **Day 15**: "Limited Time: 50% Off Your First Month"
- **Day 18**: "Case Study: How Joe's Bar Increased Revenue"
- **Day 22**: "Your Custom Demo is Ready"
- **Day 25**: "Final Reminder: Special Pricing Ends Soon"
- **Day 29**: "Last Chance: Don't Miss This Opportunity"

## 🎯 Engagement Scoring System

### Activity Scores
- **Email Opened**: +5 points
- **Email Clicked**: +10 points
- **SMS Sent**: +2 points
- **SMS Delivered**: +3 points
- **Purchase**: +20 points
- **Website Visit**: +3 points
- **Chatbot Interaction**: +5 points

### Engagement Levels
- **High**: 80-100 points
- **Medium**: 50-79 points
- **Low**: 0-49 points

## 🔄 Cross-Platform Event Integration

### Stripe Events
- `customer.subscription.created` → Trigger subscription welcome
- `invoice.payment_succeeded` → Update revenue, trigger success sequence
- `invoice.payment_failed` → Trigger payment failure sequence
- `customer.subscription.deleted` → Trigger cancellation sequence

### POS System Events
- `order.created` → Update customer data, trigger order success
- `payment.created` → Update revenue data
- `customer.created` → Link to existing customer profile

## 📈 Behavioral Campaigns

### High Engagement (80+ points)
- Premium content
- Early access to features
- VIP customer treatment

### Medium Engagement (50-79 points)
- Nurturing content
- Feature highlights
- Social proof

### Low Engagement (0-49 points)
- Re-engagement campaigns
- Special offers
- Basic educational content

## 🛡️ Security Features

### Webhook Signature Verification
- Klaviyo: HMAC SHA-256
- Stripe: Built-in signature verification
- Cross-platform: Configurable signature verification

### Rate Limiting
- Email: 3 per day, 1 per hour
- SMS: 2 per day, 1 per hour
- Cross-channel coordination prevents spam

## 📊 Monitoring & Analytics

### Engagement Reports
```javascript
// Generate engagement report
const report = await engagementService.generateEngagementReport();
console.log(report);
```

### Customer Segmentation
```javascript
// Get customers by engagement level
const highEngagement = await customerService.getCustomersByEngagementLevel('high');
const lowEngagement = await customerService.getCustomersByEngagementLevel('low');
```

### Cross-Platform Data
```javascript
// Get unified customer data
const customerData = await crossPlatformIntegration.getUnifiedCustomerData(customerId);
```

## 🔧 Customization

### Email Templates
Create email templates in Klaviyo with these variables:
- `{{ firstName }}`
- `{{ businessName }}`
- `{{ vendorType }}`
- `{{ planSelected }}`
- `{{ engagementScore }}`

### SMS Templates
Configure SMS templates with similar variables for personalization.

### A/B Testing
The system supports A/B testing through Klaviyo's built-in testing features.

## 🚨 Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
- Check webhook URL is accessible
- Verify signature verification
- Check server logs for errors

#### 2. Engagement Scores Not Updating
- Verify Klaviyo profile ID mapping
- Check engagement service logs
- Ensure customer exists in database

#### 3. Cross-Platform Data Not Syncing
- Verify API credentials
- Check webhook signatures
- Ensure customer matching logic

### Debug Commands
```bash
# Check webhook endpoints
curl -X GET http://localhost:3001/api/health

# Test Klaviyo API connection
curl -X GET https://a.klaviyo.com/api/profiles/ \
  -H "Authorization: Klaviyo-API-Key YOUR_KEY"

# View server logs
tail -f logs/server.log
```

## 📚 API Reference

### Webhook Endpoints
- `POST /api/webhooks/klaviyo` - Klaviyo events
- `POST /api/webhooks/stripe` - Stripe events
- `POST /api/webhooks/clover` - Clover events
- `POST /api/webhooks/square` - Square events
- `POST /api/webhooks/shopify` - Shopify events

### Customer Management
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (GDPR)

### Engagement Analytics
- `GET /api/engagement/report` - Generate engagement report
- `GET /api/engagement/:customerId` - Get customer engagement
- `GET /api/engagement/segments` - Get customer segments

## 🔄 GDPR Compliance

### Data Export
```javascript
const customerData = await customerService.exportCustomerData(customerId);
```

### Data Deletion
```javascript
await customerService.deleteCustomer(customerId);
```

### Consent Management
- Track email/SMS opt-in status
- Respect unsubscribe requests
- Handle data deletion requests

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
NODE_ENV=production
PORT=3001
```

### 2. Database Setup (Recommended)
Replace in-memory storage with:
- PostgreSQL for customer data
- Redis for engagement scoring
- MongoDB for activity logs

### 3. Monitoring
- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Set up log aggregation (ELK Stack)

### 4. Scaling
- Use load balancer for multiple instances
- Implement caching for API responses
- Set up queue system for background jobs

## 📞 Support

For technical support or questions about this integration system, please refer to the code comments or create an issue in the repository.

---

**Note**: This system is designed to be scalable and production-ready. Make sure to test thoroughly in a staging environment before deploying to production. 