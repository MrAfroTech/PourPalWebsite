// POS Configuration Manager - Unified config for all POS systems
require('dotenv').config();

class POSConfig {
    constructor() {
        this.configs = {
            square: this.getSquareConfig(),
            clover: this.getCloverConfig(),
            ncr_aloha: this.getNCRConfig(),
            touchbistro: this.getTouchBistroConfig()
        };
        
        this.validateConfigs();
    }

    // Existing Square configuration (you already have this)
    getSquareConfig() {
        return {
            applicationId: process.env.SQUARE_APPLICATION_ID,
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
            webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
            baseUrl: process.env.SQUARE_ENVIRONMENT === 'production' 
                ? 'https://connect.squareup.com' 
                : 'https://connect.squareupsandbox.com',
            webhookEndpoint: `${process.env.WEBHOOK_BASE_URL}/webhooks/square`,
            supportsWebhooks: true,
            authType: 'bearer_token'
        };
    }

    // Existing Clover configuration (you already have this)
    getCloverConfig() {
        return {
            appId: process.env.CLOVER_APP_ID,
            appSecret: process.env.CLOVER_APP_SECRET,
            environment: process.env.CLOVER_ENVIRONMENT || 'sandbox',
            baseUrl: process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com',
            webhookEndpoint: `${process.env.WEBHOOK_BASE_URL}/webhooks/clover`,
            supportsWebhooks: true,
            authType: 'api_key'
        };
    }

    // New NCR Aloha configuration
    getNCRConfig() {
        return {
            clientId: process.env.NCR_CLIENT_ID,
            clientSecret: process.env.NCR_CLIENT_SECRET,
            applicationId: process.env.NCR_APPLICATION_ID,
            environment: process.env.NCR_ENVIRONMENT || 'sandbox',
            baseUrl: process.env.NCR_API_BASE_URL || 'https://gateway-staging.ncrcloud.com',
            tokenUrl: process.env.NCR_TOKEN_URL || 'https://gateway-staging.ncrcloud.com/oauth/token',
            webhookSecret: process.env.NCR_WEBHOOK_SECRET,
            webhookEndpoint: `${process.env.WEBHOOK_BASE_URL}/webhooks/ncr`,
            scope: 'SITES ORDERS MENU CUSTOMERS',
            supportsWebhooks: true,
            authType: 'oauth2',
            tokenRefreshBuffer: 300000 // 5 minutes in milliseconds
        };
    }

    // New TouchBistro configuration
    getTouchBistroConfig() {
        return {
            apiKey: process.env.TOUCHBISTRO_API_KEY,
            partnerId: process.env.TOUCHBISTRO_PARTNER_ID,
            environment: process.env.TOUCHBISTRO_ENVIRONMENT || 'sandbox',
            baseUrl: process.env.TOUCHBISTRO_API_BASE_URL || 'https://sandbox.touchbistro.com/v1',
            pollingInterval: parseInt(process.env.TOUCHBISTRO_POLLING_INTERVAL) || 30000,
            maxPollAttempts: parseInt(process.env.TOUCHBISTRO_MAX_POLL_ATTEMPTS) || 120,
            supportsWebhooks: false, // TouchBistro uses polling
            authType: 'api_key_header'
        };
    }

    // Get configuration for specific POS type
    getConfig(posType) {
        const config = this.configs[posType];
        if (!config) {
            throw new Error(`Configuration not found for POS type: ${posType}`);
        }
        return config;
    }

    // Get all supported POS types
    getSupportedPOSTypes() {
        return Object.keys(this.configs);
    }

    // Validate all configurations
    validateConfigs() {
        const errors = [];

        // Validate Square config
        if (!this.configs.square.applicationId || !this.configs.square.accessToken) {
            errors.push('Square: Missing APPLICATION_ID or ACCESS_TOKEN');
        }

        // Validate Clover config
        if (!this.configs.clover.appId || !this.configs.clover.appSecret) {
            errors.push('Clover: Missing APP_ID or APP_SECRET');
        }

        // Validate NCR Aloha config
        if (!this.configs.ncr_aloha.clientId || !this.configs.ncr_aloha.clientSecret) {
            errors.push('NCR Aloha: Missing CLIENT_ID or CLIENT_SECRET');
        }

        // Validate TouchBistro config
        if (!this.configs.touchbistro.apiKey || !this.configs.touchbistro.partnerId) {
            errors.push('TouchBistro: Missing API_KEY or PARTNER_ID');
        }

        if (errors.length > 0) {
            console.warn('POS Configuration warnings:', errors);
            // Don't throw error in development - some POS systems might not be configured yet
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`POS Configuration errors: ${errors.join(', ')}`);
            }
        }
    }

    // Check if POS type is configured and available
    isPOSAvailable(posType) {
        try {
            const config = this.getConfig(posType);
            
            switch (posType) {
                case 'square':
                    return !!(config.applicationId && config.accessToken);
                case 'clover':
                    return !!(config.appId && config.appSecret);
                case 'ncr_aloha':
                    return !!(config.clientId && config.clientSecret);
                case 'touchbistro':
                    return !!(config.apiKey && config.partnerId);
                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    }

    // Get webhook configuration for a POS type
    getWebhookConfig(posType) {
        const config = this.getConfig(posType);
        
        if (!config.supportsWebhooks) {
            return null;
        }

        return {
            endpoint: config.webhookEndpoint,
            secret: config.webhookSecret || config.webhookSignatureKey,
            supportsWebhooks: config.supportsWebhooks
        };
    }

    // Get polling configuration for a POS type
    getPollingConfig(posType) {
        const config = this.getConfig(posType);
        
        if (config.supportsWebhooks) {
            return null; // No polling needed for webhook-enabled POS
        }

        return {
            interval: config.pollingInterval,
            maxAttempts: config.maxPollAttempts,
            supportsPolling: !config.supportsWebhooks
        };
    }

    // Get authentication headers for a POS type
    getAuthHeaders(posType, accessToken = null) {
        const config = this.getConfig(posType);
        
        switch (config.authType) {
            case 'bearer_token':
                return {
                    'Authorization': `Bearer ${accessToken || config.accessToken}`,
                    'Content-Type': 'application/json'
                };
                
            case 'api_key':
                return {
                    'Authorization': `Bearer ${accessToken || config.accessToken}`,
                    'Content-Type': 'application/json'
                };
                
            case 'oauth2':
                return {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Application-Id': config.applicationId
                };
                
            case 'api_key_header':
                return {
                    'X-API-Key': config.apiKey,
                    'X-Partner-ID': config.partnerId,
                    'Content-Type': 'application/json'
                };
                
            default:
                throw new Error(`Unknown auth type: ${config.authType}`);
        }
    }

    // Environment-specific URL generation
    getAPIUrl(posType, endpoint) {
        const config = this.getConfig(posType);
        return `${config.baseUrl}${endpoint}`;
    }

    // Debug method to show current configuration (without secrets)
    getDebugInfo() {
        const debugInfo = {};
        
        Object.keys(this.configs).forEach(posType => {
            const config = this.configs[posType];
            debugInfo[posType] = {
                environment: config.environment,
                baseUrl: config.baseUrl,
                supportsWebhooks: config.supportsWebhooks,
                authType: config.authType,
                isConfigured: this.isPOSAvailable(posType)
            };
        });
        
        return debugInfo;
    }
}

// Export singleton instance
module.exports = new POSConfig();