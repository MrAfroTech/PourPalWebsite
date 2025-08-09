// Demo POS Service - Test NCR Aloha and TouchBistro without real credentials
const crypto = require('crypto');

class DemoPOSService {
    constructor() {
        this.demoOrders = new Map(); // In-memory store for demo orders
        this.demoMenus = new Map(); // In-memory store for demo menus
        this.demoTokens = new Map(); // In-memory store for demo OAuth tokens
        this.pollingIntervals = new Map(); // Store polling intervals
        
        this.initializeDemoData();
    }

    initializeDemoData() {
        // Demo NCR Aloha menu
        this.demoMenus.set('ncr_aloha', {
            categories: [
                {
                    id: "cat_001",
                    name: "Appetizers",
                    items: [
                        { id: "item_001", name: "Wings", price: 12.99, description: "Buffalo wings with celery" },
                        { id: "item_002", name: "Nachos", price: 9.99, description: "Loaded nachos with cheese" }
                    ]
                },
                {
                    id: "cat_002", 
                    name: "Entrees",
                    items: [
                        { id: "item_003", name: "Burger", price: 14.99, description: "Classic cheeseburger" },
                        { id: "item_004", name: "Pasta", price: 16.99, description: "Fettuccine Alfredo" }
                    ]
                }
            ],
            lastSynced: new Date().toISOString()
        });

        // Demo TouchBistro menu
        this.demoMenus.set('touchbistro', {
            categories: [
                {
                    id: "tb_cat_001",
                    name: "Coffee & Tea",
                    items: [
                        { id: "tb_item_001", name: "Espresso", price: 3.50, description: "Double shot espresso" },
                        { id: "tb_item_002", name: "Latte", price: 4.50, description: "Espresso with steamed milk" }
                    ]
                },
                {
                    id: "tb_cat_002",
                    name: "Pastries", 
                    items: [
                        { id: "tb_item_003", name: "Croissant", price: 3.99, description: "Buttery croissant" },
                        { id: "tb_item_004", name: "Muffin", price: 2.99, description: "Blueberry muffin" }
                    ]
                }
            ],
            lastSynced: new Date().toISOString()
        });
    }

    // Demo order creation that simulates different POS systems
    async createOrder(restaurantId, orderData) {
        const posIntegration = await this.getDemoPOSIntegration(restaurantId);
        
        if (!posIntegration) {
            throw new Error(`No demo POS integration found for restaurant ${restaurantId}`);
        }

        console.log(`🎭 DEMO MODE: Creating order for ${posIntegration.pos_type}`);

        switch (posIntegration.pos_type) {
            case 'ncr_aloha':
                return await this.createDemoNCROrder(posIntegration, orderData);
            case 'touchbistro':
                return await this.createDemoTouchBistroOrder(posIntegration, orderData);
            default:
                throw new Error(`Demo mode not implemented for ${posIntegration.pos_type}`);
        }
    }

    async createDemoNCROrder(posIntegration, orderData) {
        // Simulate OAuth token check
        await this.ensureDemoNCRToken(posIntegration);
        
        const orderId = `ncr_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const demoOrder = {
            id: orderId,
            posOrderId: orderId,
            status: 'RECEIVED',
            normalizedStatus: 'received',
            customer: orderData.customer,
            items: orderData.items,
            totalAmount: orderData.totalAmount || this.calculateTotal(orderData.items),
            createdAt: new Date().toISOString(),
            estimatedCompletionTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };

        this.demoOrders.set(orderId, demoOrder);
        
        // Simulate webhook updates after delays
        this.simulateNCRWebhookUpdates(orderId);

        console.log(`✅ DEMO NCR Order created: ${orderId}`);
        
        return {
            orderId,
            posOrderId: orderId,
            status: 'SENT_TO_POS',
            posType: 'ncr_aloha',
            rawResponse: demoOrder
        };
    }

    async createDemoTouchBistroOrder(posIntegration, orderData) {
        const orderId = `tb_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const demoOrder = {
            id: orderId,
            posOrderId: orderId,
            status: 'PENDING',
            normalizedStatus: 'received',
            customer: orderData.customer,
            items: orderData.items,
            totalAmount: orderData.totalAmount || this.calculateTotal(orderData.items),
            createdAt: new Date().toISOString(),
            estimatedCompletionTime: new Date(Date.now() + 12 * 60 * 1000).toISOString() // 12 minutes
        };

        this.demoOrders.set(orderId, demoOrder);
        
        // Start demo polling for this order
        this.startDemoTouchBistroPolling(orderId);

        console.log(`✅ DEMO TouchBistro Order created: ${orderId}`);
        
        return {
            orderId,
            posOrderId: orderId,
            status: 'SENT_TO_POS',
            posType: 'touchbistro',
            rawResponse: demoOrder
        };
    }

    // Simulate NCR Aloha OAuth token management
    async ensureDemoNCRToken(posIntegration) {
        const tokenKey = `ncr_token_${posIntegration.id}`;
        let tokenData = this.demoTokens.get(tokenKey);
        
        if (!tokenData || this.isDemoTokenExpired(tokenData)) {
            tokenData = await this.refreshDemoNCRToken(posIntegration);
        }
        
        return tokenData.access_token;
    }

    async refreshDemoNCRToken(posIntegration) {
        console.log(`🔄 DEMO: Refreshing NCR OAuth token for integration ${posIntegration.id}`);
        
        const tokenData = {
            access_token: `demo_ncr_token_${Date.now()}`,
            refresh_token: `demo_ncr_refresh_${Date.now()}`,
            expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour
            scope: 'SITES ORDERS MENU'
        };

        const tokenKey = `ncr_token_${posIntegration.id}`;
        this.demoTokens.set(tokenKey, tokenData);
        
        console.log(`✅ DEMO: NCR token refreshed, expires at ${tokenData.expires_at}`);
        return tokenData;
    }

    isDemoTokenExpired(tokenData) {
        return new Date() >= new Date(tokenData.expires_at);
    }

    // Simulate NCR webhook status updates
    simulateNCRWebhookUpdates(orderId) {
        const statusUpdates = [
            { delay: 2000, status: 'PREPARING', normalizedStatus: 'preparing' },
            { delay: 8000, status: 'READY', normalizedStatus: 'ready' },
            { delay: 15000, status: 'COMPLETED', normalizedStatus: 'completed' }
        ];

        statusUpdates.forEach(update => {
            setTimeout(() => {
                const order = this.demoOrders.get(orderId);
                if (order) {
                    order.status = update.status;
                    order.normalizedStatus = update.normalizedStatus;
                    order.updatedAt = new Date().toISOString();
                    
                    console.log(`📡 DEMO NCR Webhook: Order ${orderId} status changed to ${update.status}`);
                    
                    // Trigger webhook handler simulation
                    this.simulateWebhookDelivery('ncr_aloha', {
                        eventType: 'ORDER_STATUS_CHANGED',
                        orderId: orderId,
                        status: update.status,
                        timestamp: new Date().toISOString()
                    });
                }
            }, update.delay);
        });
    }

    // Simulate TouchBistro polling
    startDemoTouchBistroPolling(orderId) {
        const pollId = `demo_poll_${orderId}`;
        let pollCount = 0;
        
        const statusUpdates = [
            { after: 3, status: 'IN_PROGRESS', normalizedStatus: 'preparing' },
            { after: 7, status: 'READY', normalizedStatus: 'ready' },
            { after: 12, status: 'PICKED_UP', normalizedStatus: 'completed' }
        ];

        const intervalId = setInterval(() => {
            pollCount++;
            const order = this.demoOrders.get(orderId);
            
            if (!order) {
                clearInterval(intervalId);
                this.pollingIntervals.delete(pollId);
                return;
            }

            // Check if status should update
            const updateDue = statusUpdates.find(update => 
                pollCount >= update.after && order.status !== update.status
            );

            if (updateDue) {
                order.status = updateDue.status;
                order.normalizedStatus = updateDue.normalizedStatus;
                order.updatedAt = new Date().toISOString();
                
                console.log(`🔄 DEMO TouchBistro Poll: Order ${orderId} status changed to ${updateDue.status}`);
            }

            // Stop polling if completed
            if (order.normalizedStatus === 'completed') {
                clearInterval(intervalId);
                this.pollingIntervals.delete(pollId);
                console.log(`⏹️ DEMO: Stopped polling for completed order ${orderId}`);
            }
        }, 3000); // Poll every 3 seconds (faster for demo)

        this.pollingIntervals.set(pollId, intervalId);
        console.log(`🔄 DEMO: Started TouchBistro polling for order ${orderId}`);
    }

    // Get demo order status
    async getDemoOrderStatus(orderId) {
        const order = this.demoOrders.get(orderId);
        
        if (!order) {
            throw new Error(`Demo order ${orderId} not found`);
        }

        return {
            orderId: order.id,
            status: order.normalizedStatus,
            posStatus: order.status,
            estimatedCompletionTime: order.estimatedCompletionTime,
            updatedAt: order.updatedAt || order.createdAt
        };
    }

    // Demo menu synchronization
    async syncDemoMenu(restaurantId) {
        const posIntegration = await this.getDemoPOSIntegration(restaurantId);
        
        if (!posIntegration) {
            throw new Error(`No demo POS integration found for restaurant ${restaurantId}`);
        }

        console.log(`📋 DEMO: Syncing menu for ${posIntegration.pos_type}`);
        
        const menuData = this.demoMenus.get(posIntegration.pos_type);
        
        if (!menuData) {
            throw new Error(`Demo menu not available for ${posIntegration.pos_type}`);
        }

        // Add some artificial delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`✅ DEMO: Menu synced for ${posIntegration.pos_type}`);
        
        return menuData;
    }

    // Simulate webhook delivery
    simulateWebhookDelivery(posType, webhookData) {
        console.log(`📨 DEMO Webhook Delivered (${posType}):`, {
            eventType: webhookData.eventType,
            orderId: webhookData.orderId,
            status: webhookData.status
        });
        
        // In real implementation, this would trigger your webhook handler
        // For demo, we just log it
    }

    // Demo POS integration lookup
    async getDemoPOSIntegration(restaurantId) {
        // Create demo integrations for testing
        const demoIntegrations = {
            '1': { id: 1, restaurant_id: '1', pos_type: 'ncr_aloha', site_id: 'demo_site_123' },
            '2': { id: 2, restaurant_id: '2', pos_type: 'touchbistro', location_id: 'demo_location_456' },
            '3': { id: 3, restaurant_id: '3', pos_type: 'ncr_aloha', site_id: 'demo_site_789' },
            '4': { id: 4, restaurant_id: '4', pos_type: 'touchbistro', location_id: 'demo_location_012' }
        };

        return demoIntegrations[restaurantId] || demoIntegrations['1']; // Default to NCR for testing
    }

    // Test connection
    async testDemoConnection(posType) {
        console.log(`🧪 DEMO: Testing ${posType} connection...`);
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const results = {
            ncr_aloha: {
                success: true,
                sitesCount: 3,
                tokenValid: true,
                message: 'Demo NCR connection successful'
            },
            touchbistro: {
                success: true,
                restaurantsCount: 5,
                pollingActive: true,
                message: 'Demo TouchBistro connection successful'
            }
        };

        return results[posType] || { success: false, error: 'Demo not available for this POS type' };
    }

    // Utility methods
    calculateTotal(items) {
        return items.reduce((total, item) => {
            const price = item.price || 10.00; // Default demo price
            return total + (price * item.quantity);
        }, 0);
    }

    // Get all demo orders
    getAllDemoOrders() {
        return Array.from(this.demoOrders.values());
    }

    // Get demo order by ID
    getDemoOrder(orderId) {
        return this.demoOrders.get(orderId);
    }

    // Clear demo data
    clearDemoData() {
        this.demoOrders.clear();
        this.demoTokens.clear();
        
        // Clear all polling intervals
        this.pollingIntervals.forEach(intervalId => clearInterval(intervalId));
        this.pollingIntervals.clear();
        
        console.log('🧹 DEMO: All demo data cleared');
    }

    // Get demo system status
    getDemoStatus() {
        return {
            mode: 'demo',
            activeOrders: this.demoOrders.size,
            activePolling: this.pollingIntervals.size,
            availableMenus: Array.from(this.demoMenus.keys()),
            demoTokens: this.demoTokens.size
        };
    }
}

module.exports = DemoPOSService;