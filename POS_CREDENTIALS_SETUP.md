# POS System Credentials & Environment Variables Setup Guide

## Overview
This guide outlines the specific credentials and environment variables needed to connect with NCR Aloha and TouchBistro POS systems, similar to your Square and Clover integrations.

---

## NCR Aloha POS Credentials

### Required Environment Variables

```bash
# NCR Aloha API Configuration
NCR_CLIENT_ID=your_client_id_here
NCR_CLIENT_SECRET=your_client_secret_here
NCR_APPLICATION_ID=your_application_id_here
NCR_ENVIRONMENT=sandbox  # or 'production'
NCR_API_BASE_URL=https://gateway-staging.ncrcloud.com  # sandbox
# NCR_API_BASE_URL=https://gateway.ncrcloud.com  # production

# OAuth Token Management
NCR_TOKEN_URL=https://gateway-staging.ncrcloud.com/oauth/token
NCR_SCOPE=SITES ORDERS MENU CUSTOMERS

# Webhook Configuration (for receiving real-time updates)
NCR_WEBHOOK_SECRET=your_webhook_signing_secret
NCR_WEBHOOK_ENDPOINT=https://your-domain.com/webhooks/ncr/order-status
```

### What You Get From NCR Partner Program

**After Partnership Approval:**
1. **Client ID** - Unique identifier for your application
2. **Client Secret** - Secret key for OAuth authentication (keep secure!)
3. **Application ID** - Specific application registration ID
4. **Webhook Signing Secret** - For verifying webhook authenticity
5. **Partner Portal Access** - Dashboard to manage integration settings

### Example .env Entry
```bash
# NCR Aloha Configuration
NCR_CLIENT_ID=ncr_app_12345abcdef
NCR_CLIENT_SECRET=sk_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
NCR_APPLICATION_ID=app_67890fedcba
NCR_ENVIRONMENT=sandbox
NCR_API_BASE_URL=https://gateway-staging.ncrcloud.com
NCR_WEBHOOK_SECRET=whsec_abc123def456ghi789
```

### Required API Scopes
- **SITES** - Access to location/restaurant data
- **ORDERS** - Create and manage orders
- **MENU** - Read menu items, categories, pricing
- **CUSTOMERS** - Customer data management (optional)

---

## TouchBistro POS Credentials

### Required Environment Variables

```bash
# TouchBistro API Configuration
TOUCHBISTRO_API_KEY=your_api_key_here
TOUCHBISTRO_PARTNER_ID=your_partner_id_here
TOUCHBISTRO_ENVIRONMENT=sandbox  # or 'production'
TOUCHBISTRO_API_BASE_URL=https://sandbox.touchbistro.com/v1  # sandbox
# TOUCHBISTRO_API_BASE_URL=https://api.touchbistro.com/v1  # production

# Polling Configuration (since no webhooks)
TOUCHBISTRO_POLLING_INTERVAL=30000  # 30 seconds in milliseconds
TOUCHBISTRO_MAX_POLL_ATTEMPTS=120  # Max polling attempts before timeout
```

### What You Get From TouchBistro Partnership

**After Integrated Partner Approval:**
1. **API Key** - Primary authentication token
2. **Partner ID** - Your unique partner identifier
3. **Sandbox Access** - Testing environment credentials
4. **Documentation Access** - Partner-only API documentation
5. **Technical Support** - Direct line to integration team

### Example .env Entry
```bash
# TouchBistro Configuration
TOUCHBISTRO_API_KEY=tb_live_abc123def456ghi789jkl012mno345
TOUCHBISTRO_PARTNER_ID=partner_98765
TOUCHBISTRO_ENVIRONMENT=sandbox
TOUCHBISTRO_API_BASE_URL=https://sandbox.touchbistro.com/v1
TOUCHBISTRO_POLLING_INTERVAL=30000
```

---

## Complete Environment Variables Template

### .env File Template
```bash
# ================================
# POS SYSTEM CONFIGURATIONS
# ================================

# Square POS (existing)
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SIGNATURE_KEY=your_square_webhook_key

# Clover POS (existing)
CLOVER_APP_ID=your_clover_app_id
CLOVER_APP_SECRET=your_clover_app_secret
CLOVER_ENVIRONMENT=sandbox
CLOVER_API_BASE_URL=https://sandbox.dev.clover.com

# NCR Aloha POS (new)
NCR_CLIENT_ID=your_ncr_client_id
NCR_CLIENT_SECRET=your_ncr_client_secret
NCR_APPLICATION_ID=your_ncr_application_id
NCR_ENVIRONMENT=sandbox
NCR_API_BASE_URL=https://gateway-staging.ncrcloud.com
NCR_WEBHOOK_SECRET=your_ncr_webhook_secret

# TouchBistro POS (new)
TOUCHBISTRO_API_KEY=your_touchbistro_api_key
TOUCHBISTRO_PARTNER_ID=your_touchbistro_partner_id
TOUCHBISTRO_ENVIRONMENT=sandbox
TOUCHBISTRO_API_BASE_URL=https://sandbox.touchbistro.com/v1
TOUCHBISTRO_POLLING_INTERVAL=30000

# ================================
# WEBHOOK ENDPOINTS
# ================================
WEBHOOK_BASE_URL=https://your-domain.com
NCR_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/ncr/order-status
SQUARE_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/square/order-status
CLOVER_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/clover/order-status
# Note: TouchBistro doesn't support webhooks - uses polling instead
```

---

## Credential Security Best Practices

### Environment-Specific Configurations

```javascript
// config/pos-config.js
const posConfig = {
  ncr: {
    clientId: process.env.NCR_CLIENT_ID,
    clientSecret: process.env.NCR_CLIENT_SECRET,
    applicationId: process.env.NCR_APPLICATION_ID,
    environment: process.env.NCR_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.NCR_API_BASE_URL,
    webhookSecret: process.env.NCR_WEBHOOK_SECRET
  },
  touchbistro: {
    apiKey: process.env.TOUCHBISTRO_API_KEY,
    partnerId: process.env.TOUCHBISTRO_PARTNER_ID,
    environment: process.env.TOUCHBISTRO_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.TOUCHBISTRO_API_BASE_URL,
    pollingInterval: parseInt(process.env.TOUCHBISTRO_POLLING_INTERVAL) || 30000
  }
};

module.exports = posConfig;
```

### Credential Validation
```javascript
// utils/credential-validator.js
function validatePOSCredentials() {
  const requiredNCR = [
    'NCR_CLIENT_ID',
    'NCR_CLIENT_SECRET', 
    'NCR_APPLICATION_ID'
  ];
  
  const requiredTouchBistro = [
    'TOUCHBISTRO_API_KEY',
    'TOUCHBISTRO_PARTNER_ID'
  ];
  
  const missing = [];
  
  requiredNCR.forEach(key => {
    if (!process.env[key]) missing.push(key);
  });
  
  requiredTouchBistro.forEach(key => {
    if (!process.env[key]) missing.push(key);
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## Setup Process Summary

### NCR Aloha Setup Steps
1. **Apply for NCR Partner Program** → developer.ncr.com
2. **Complete Business Review** → 4-8 weeks process
3. **Receive Developer Credentials** → Client ID, Secret, App ID
4. **Configure Sandbox Environment** → Test API access
5. **Set Up Webhook Endpoints** → For real-time order updates
6. **Complete Integration Certification** → Required before production

### TouchBistro Setup Steps  
1. **Apply for Integrated Partner Status** → integratedpartners@touchbistro.com
2. **Complete Partnership Review** → 2-6 weeks process
3. **Receive API Credentials** → API Key and Partner ID
4. **Access Partner Documentation** → Full API specs
5. **Configure Polling System** → Since no webhooks available
6. **Complete Integration Testing** → Partner approval process

---

## Testing Your Connections

### NCR Aloha Connection Test
```javascript
// test/ncr-connection-test.js
async function testNCRConnection() {
  try {
    // Step 1: Get OAuth token
    const tokenResponse = await fetch(`${NCR_API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${NCR_CLIENT_ID}&client_secret=${NCR_CLIENT_SECRET}&scope=SITES`
    });
    
    const { access_token } = await tokenResponse.json();
    
    // Step 2: Test API access
    const sitesResponse = await fetch(`${NCR_API_BASE_URL}/sites`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    if (sitesResponse.ok) {
      console.log('✅ NCR Aloha connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ NCR Aloha connection failed:', error);
    return false;
  }
}
```

### TouchBistro Connection Test
```javascript
// test/touchbistro-connection-test.js
async function testTouchBistroConnection() {
  try {
    const response = await fetch(`${TOUCHBISTRO_API_BASE_URL}/restaurants`, {
      headers: {
        'X-API-Key': TOUCHBISTRO_API_KEY,
        'X-Partner-ID': TOUCHBISTRO_PARTNER_ID,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ TouchBistro connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ TouchBistro connection failed:', error);
    return false;
  }
}
```

---

## Key Differences from Square/Clover

### Authentication Methods
- **Square/Clover**: Direct API tokens
- **NCR Aloha**: OAuth 2.0 with token refresh
- **TouchBistro**: API Key + Partner ID headers

### Real-time Updates
- **Square/Clover**: Webhook support
- **NCR Aloha**: Advanced webhook system
- **TouchBistro**: No webhooks - polling required

### Partnership Requirements
- **Square/Clover**: Self-service developer access
- **NCR Aloha**: Enterprise partnership required
- **TouchBistro**: Integrated partner program required

### Setup Complexity
- **Square/Clover**: Immediate access after app creation
- **NCR Aloha**: 4-8 week partnership approval process  
- **TouchBistro**: 2-6 week integrated partner review

---

## Next Steps

1. **Immediate Actions:**
   - Apply for NCR Partner Program
   - Apply for TouchBistro Integrated Partner Status
   - Set up placeholder environment variables

2. **While Waiting for Approval:**
   - Design unified POS abstraction layer
   - Create credential management system
   - Build testing framework

3. **Post-Approval:**
   - Configure sandbox credentials
   - Test API connections
   - Begin integration development

Remember: Unlike Square and Clover which offer immediate developer access, both NCR and TouchBistro require business partnerships, so start the application process early!