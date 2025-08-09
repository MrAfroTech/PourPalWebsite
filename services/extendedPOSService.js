// Extended POS Service - Adds NCR Aloha and TouchBistro to existing Square/Clover integration
const axios = require('axios');
const crypto = require('crypto');

// Import your existing POS clients (assuming you have these)
// const SquareClient = require('./squareClient');
// const CloverClient = require('./cloverClient');

class ExtendedPOSService {
    constructor() {
        this.posClients = new Map();
        this.pollingIntervals = new Map();
        this.oauthTokens = new Map();
        
        // Initialize all POS clients
        this.initializePOSClients();
    }

    initializePOSClients() {
        // Your existing Square and Clover clients would go here
        // this.posClients.set('square', new SquareClient(...));
        // this.posClients.set('clover', new CloverClient(...));
        
        // New NCR Aloha client
        this.posClients.set('ncr_aloha', new NCRAlohaClient({
            clientId: process.env.NCR_CLIENT_ID,
            clientSecret: process.env.NCR_CLIENT_SECRET,
            applicationId: process.env.NCR_APPLICATION_ID,
            baseUrl: process.env.NCR_API_BASE_URL,
            tokenUrl: process.env.NCR_TOKEN_URL
        }));
        
        // New TouchBistro client
        this.posClients.set('touchbistro', new TouchBistroClient({
            apiKey: process.env.TOUCHBISTRO_API_KEY,
            partnerId: process.env.TOUCHBISTRO_PARTNER_ID,
            baseUrl: process.env.TOUCHBISTRO_API_BASE_URL,
            pollingInterval: parseInt(process.env.TOUCHBISTRO_POLLING_INTERVAL) || 30000
        }));
    }

    // Unified method to create orders across all POS systems
    async createOrder(restaurantId, orderData) {
        const posIntegration = await this.getPOSIntegration(restaurantId);
        
        if (!posIntegration) {
            throw new Error(`No POS integration found for restaurant ${restaurantId}`);
        }

        const client = this.posClients.get(posIntegration.pos_type);
        if (!client) {
            throw new Error(`Unsupported POS type: ${posIntegration.pos_type}`);
        }

        try {
            let result;
            
            switch (posIntegration.pos_type) {
                case 'square':
                    result = await this.createSquareOrder(client, posIntegration, orderData);
                    break;
                case 'clover':
                    result = await this.createCloverOrder(client, posIntegration, orderData);
                    break;
                case 'ncr_aloha':
                    result = await this.createNCROrder(client, posIntegration, orderData);
                    break;
                case 'touchbistro':
                    result = await this.createTouchBistroOrder(client, posIntegration, orderData);
                    break;
                default:
                    throw new Error(`Unsupported POS type: ${posIntegration.pos_type}`);
            }

            // Start status tracking
            await this.startOrderStatusTracking(posIntegration, result.orderId);
            
            return result;
        } catch (error) {
            console.error(`Order creation failed for ${posIntegration.pos_type}:`, error);
            throw error;
        }
    }

    // NCR Aloha order creation (OAuth-based)
    async createNCROrder(client, posIntegration, orderData) {
        // Ensure we have a valid token
        const accessToken = await this.ensureValidNCRToken(posIntegration);
        
        const ncrOrderData = {
            orders: [{
                source: "SEAMLESS_MARKETPLACE",
                orderType: "TAKEOUT",
                customer: {
                    name: orderData.customer.name,
                    phone: orderData.customer.phone,
                    email: orderData.customer.email
                },
                items: orderData.items.map(item => ({
                    id: item.posItemId,
                    quantity: item.quantity,
                    modifiers: item.modifiers || []
                })),
                timing: {
                    requestedTime: orderData.requestedTime || new Date().toISOString()
                }
            }]
        };

        const response = await axios.post(
            `${client.baseUrl}/sites/${posIntegration.site_id}/orders`,
            ncrOrderData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Application-Id': client.applicationId
                }
            }
        );

        return {
            orderId: response.data.orders[0].id,
            posOrderId: response.data.orders[0].id,
            status: 'SENT_TO_POS',
            rawResponse: response.data
        };
    }

    // TouchBistro order creation (API Key-based)
    async createTouchBistroOrder(client, posIntegration, orderData) {
        const touchBistroOrderData = {
            order: {
                orderType: "TAKEOUT",
                source: "SEAMLESS",
                customer: {
                    name: orderData.customer.name,
                    phone: orderData.customer.phone,
                    email: orderData.customer.email
                },
                items: orderData.items.map(item => ({
                    menuItemId: item.posItemId,
                    quantity: item.quantity,
                    addOns: item.modifiers || [],
                    specialInstructions: item.notes || ""
                })),
                requestedTime: orderData.requestedTime || new Date().toISOString(),
                notes: orderData.specialInstructions || ""
            }
        };

        const response = await axios.post(
            `${client.baseUrl}/restaurants/${posIntegration.location_id}/orders`,
            touchBistroOrderData,
            {
                headers: {
                    'X-API-Key': client.apiKey,
                    'X-Partner-ID': client.partnerId,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Start polling for this order since TouchBistro doesn't have webhooks
        this.startTouchBistroPolling(posIntegration, response.data.order.id);

        return {
            orderId: response.data.order.id,
            posOrderId: response.data.order.id,
            status: 'SENT_TO_POS',
            rawResponse: response.data
        };
    }

    // OAuth token management for NCR Aloha
    async ensureValidNCRToken(posIntegration) {
        const tokenData = await this.getOAuthToken(posIntegration.id);
        
        if (!tokenData || this.isTokenExpired(tokenData)) {
            return await this.refreshNCRToken(posIntegration);
        }
        
        return tokenData.access_token;
    }

    async refreshNCRToken(posIntegration) {
        const client = this.posClients.get('ncr_aloha');
        const tokenData = await this.getOAuthToken(posIntegration.id);
        
        let response;
        
        if (tokenData && tokenData.refresh_token) {
            // Use refresh token
            response = await axios.post(client.tokenUrl, {
                grant_type: 'refresh_token',
                refresh_token: tokenData.refresh_token,
                client_id: client.clientId,
                client_secret: client.clientSecret
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        } else {
            // Use client credentials
            response = await axios.post(client.tokenUrl, {
                grant_type: 'client_credentials',
                client_id: client.clientId,
                client_secret: client.clientSecret,
                scope: 'SITES ORDERS MENU'
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        }

        const newTokenData = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: new Date(Date.now() + (response.data.expires_in * 1000)),
            scope: response.data.scope
        };

        await this.saveOAuthToken(posIntegration.id, newTokenData);
        return newTokenData.access_token;
    }

    // TouchBistro polling management
    startTouchBistroPolling(posIntegration, orderId) {
        const pollId = `${posIntegration.id}-${orderId}`;
        
        if (this.pollingIntervals.has(pollId)) {
            return; // Already polling this order
        }

        const intervalId = setInterval(async () => {
            try {
                const status = await this.pollTouchBistroOrderStatus(posIntegration, orderId);
                await this.updateOrderStatus(orderId, status);
                
                // Stop polling if order is complete
                if (['PICKED_UP', 'CANCELLED'].includes(status.status)) {
                    clearInterval(intervalId);
                    this.pollingIntervals.delete(pollId);
                }
            } catch (error) {
                console.error(`Polling error for order ${orderId}:`, error);
            }
        }, 30000); // Poll every 30 seconds

        this.pollingIntervals.set(pollId, intervalId);
    }

    async pollTouchBistroOrderStatus(posIntegration, orderId) {
        const client = this.posClients.get('touchbistro');
        
        const response = await axios.get(
            `${client.baseUrl}/orders/${orderId}`,
            {
                headers: {
                    'X-API-Key': client.apiKey,
                    'X-Partner-ID': client.partnerId
                }
            }
        );

        return this.normalizeTouchBistroStatus(response.data.order);
    }

    // Status normalization across POS systems
    normalizeOrderStatus(status, posType) {
        const statusMappings = {
            ncr_aloha: {
                'RECEIVED': 'received',
                'PREPARING': 'preparing',
                'READY': 'ready',
                'COMPLETED': 'completed',
                'CANCELLED': 'cancelled'
            },
            touchbistro: {
                'PENDING': 'received',
                'IN_PROGRESS': 'preparing',
                'READY': 'ready',
                'PICKED_UP': 'completed',
                'CANCELLED': 'cancelled'
            },
            square: {
                'OPEN': 'received',
                'IN_PROGRESS': 'preparing',
                'READY': 'ready',
                'COMPLETED': 'completed',
                'CANCELED': 'cancelled'
            },
            clover: {
                'OPEN': 'received',
                'IN_PROGRESS': 'preparing',
                'READY': 'ready',
                'PAID': 'completed',
                'CANCELED': 'cancelled'
            }
        };

        return statusMappings[posType][status] || status.toLowerCase();
    }

    normalizeTouchBistroStatus(orderData) {
        return {
            orderId: orderData.id,
            status: this.normalizeOrderStatus(orderData.status, 'touchbistro'),
            estimatedCompletionTime: orderData.estimatedCompletionTime,
            rawStatus: orderData.status
        };
    }

    // Menu synchronization across POS systems
    async syncMenu(restaurantId) {
        const posIntegration = await this.getPOSIntegration(restaurantId);
        const client = this.posClients.get(posIntegration.pos_type);

        let menuData;

        switch (posIntegration.pos_type) {
            case 'ncr_aloha':
                menuData = await this.syncNCRMenu(client, posIntegration);
                break;
            case 'touchbistro':
                menuData = await this.syncTouchBistroMenu(client, posIntegration);
                break;
            // Add your existing Square/Clover menu sync here
            default:
                throw new Error(`Menu sync not implemented for ${posIntegration.pos_type}`);
        }

        return this.normalizeMenuFormat(menuData, posIntegration.pos_type);
    }

    async syncNCRMenu(client, posIntegration) {
        const accessToken = await this.ensureValidNCRToken(posIntegration);
        
        const response = await axios.get(
            `${client.baseUrl}/sites/${posIntegration.site_id}/menu`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Application-Id': client.applicationId
                }
            }
        );

        return response.data;
    }

    async syncTouchBistroMenu(client, posIntegration) {
        const response = await axios.get(
            `${client.baseUrl}/restaurants/${posIntegration.location_id}/menu`,
            {
                headers: {
                    'X-API-Key': client.apiKey,
                    'X-Partner-ID': client.partnerId
                }
            }
        );

        return response.data;
    }

    // Webhook handling for NCR Aloha (extends your existing webhook system)
    async handleNCRWebhook(webhookData, signature) {
        // Verify webhook signature
        if (!this.verifyWebhookSignature(webhookData, signature, 'ncr_aloha')) {
            throw new Error('Invalid webhook signature');
        }

        const { eventType, siteId, orderId, status } = webhookData;

        if (eventType === 'ORDER_STATUS_CHANGED') {
            const normalizedStatus = this.normalizeOrderStatus(status, 'ncr_aloha');
            await this.updateOrderStatus(orderId, {
                status: normalizedStatus,
                rawStatus: status,
                timestamp: new Date()
            });
        }
    }

    verifyWebhookSignature(payload, signature, posType) {
        const webhookSecret = process.env[`${posType.toUpperCase()}_WEBHOOK_SECRET`];
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    // Database helper methods (you'll implement these based on your existing DB layer)
    async getPOSIntegration(restaurantId) {
        // Implement based on your existing database layer
        // This should return the POS integration details for the restaurant
    }

    async getOAuthToken(posIntegrationId) {
        // Implement OAuth token retrieval from database
    }

    async saveOAuthToken(posIntegrationId, tokenData) {
        // Implement OAuth token saving to database
    }

    async updateOrderStatus(orderId, statusData) {
        // Implement order status update in your database
    }

    isTokenExpired(tokenData) {
        return new Date() >= new Date(tokenData.expires_at);
    }

    normalizeMenuFormat(menuData, posType) {
        // Implement menu format normalization across different POS systems
        // Return a standardized menu format
    }
}

// NCR Aloha Client Class
class NCRAlohaClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.applicationId = config.applicationId;
        this.baseUrl = config.baseUrl;
        this.tokenUrl = config.tokenUrl;
    }
}

// TouchBistro Client Class
class TouchBistroClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.partnerId = config.partnerId;
        this.baseUrl = config.baseUrl;
        this.pollingInterval = config.pollingInterval;
    }
}

module.exports = ExtendedPOSService;