# Extended Environment Variables for NCR Aloha & TouchBistro Integration

## New Environment Variables Needed

### NCR Aloha Configuration
```bash
# NCR Aloha API Configuration
NCR_CLIENT_ID=your_ncr_client_id_here
NCR_CLIENT_SECRET=your_ncr_client_secret_here
NCR_APPLICATION_ID=your_ncr_application_id_here
NCR_ENVIRONMENT=sandbox
NCR_API_BASE_URL=https://gateway-staging.ncrcloud.com
NCR_TOKEN_URL=https://gateway-staging.ncrcloud.com/oauth/token
NCR_WEBHOOK_SECRET=your_ncr_webhook_secret_here

# Production URLs (when ready)
# NCR_API_BASE_URL=https://gateway.ncrcloud.com
# NCR_TOKEN_URL=https://gateway.ncrcloud.com/oauth/token
```

### TouchBistro Configuration
```bash
# TouchBistro API Configuration
TOUCHBISTRO_API_KEY=your_touchbistro_api_key_here
TOUCHBISTRO_PARTNER_ID=your_touchbistro_partner_id_here
TOUCHBISTRO_ENVIRONMENT=sandbox
TOUCHBISTRO_API_BASE_URL=https://sandbox.touchbistro.com/v1
TOUCHBISTRO_POLLING_INTERVAL=30000

# Production URLs (when ready)
# TOUCHBISTRO_API_BASE_URL=https://api.touchbistro.com/v1
```

## Complete .env Template (Including Existing)
```bash
# ================================
# EXISTING POS SYSTEMS
# ================================

# Square POS
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SIGNATURE_KEY=your_square_webhook_key

# Clover POS
CLOVER_APP_ID=your_clover_app_id
CLOVER_APP_SECRET=your_clover_app_secret
CLOVER_ENVIRONMENT=sandbox
CLOVER_API_BASE_URL=https://sandbox.dev.clover.com

# ================================
# NEW POS SYSTEMS
# ================================

# NCR Aloha POS
NCR_CLIENT_ID=your_ncr_client_id_here
NCR_CLIENT_SECRET=your_ncr_client_secret_here
NCR_APPLICATION_ID=your_ncr_application_id_here
NCR_ENVIRONMENT=sandbox
NCR_API_BASE_URL=https://gateway-staging.ncrcloud.com
NCR_TOKEN_URL=https://gateway-staging.ncrcloud.com/oauth/token
NCR_WEBHOOK_SECRET=your_ncr_webhook_secret_here

# TouchBistro POS
TOUCHBISTRO_API_KEY=your_touchbistro_api_key_here
TOUCHBISTRO_PARTNER_ID=your_touchbistro_partner_id_here
TOUCHBISTRO_ENVIRONMENT=sandbox
TOUCHBISTRO_API_BASE_URL=https://sandbox.touchbistro.com/v1
TOUCHBISTRO_POLLING_INTERVAL=30000

# ================================
# WEBHOOK CONFIGURATION
# ================================
WEBHOOK_BASE_URL=https://your-domain.com
SQUARE_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/square
CLOVER_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/clover
NCR_WEBHOOK_ENDPOINT=${WEBHOOK_BASE_URL}/webhooks/ncr
# TouchBistro doesn't support webhooks - uses polling
```

## Key Differences from Square/Clover

### Authentication
- **Square/Clover**: Direct API tokens (simple)
- **NCR Aloha**: OAuth 2.0 with token refresh (more complex)
- **TouchBistro**: API Key + Partner ID headers (simple)

### Real-time Updates
- **Square/Clover**: Webhooks ✅
- **NCR Aloha**: Webhooks ✅
- **TouchBistro**: Polling only (no webhooks)

### Environment Variables Complexity
- **Square/Clover**: 4-5 variables each
- **NCR Aloha**: 7 variables (due to OAuth)
- **TouchBistro**: 5 variables (due to polling config)