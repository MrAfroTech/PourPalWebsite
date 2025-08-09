// POS Integration Startup Script
// This script initializes and starts all POS integrations

const ExtendedPOSService = require('../services/extendedPOSService');
const ExtendedPOSModels = require('../models/extendedPOSModels');
const posConfig = require('../config/posConfig');

class POSStartupManager {
    constructor() {
        this.posService = new ExtendedPOSService();
        this.pollingIntervals = new Map();
    }

    async initialize() {
        console.log('🚀 Starting POS Integration System...');
        
        try {
            // 1. Check database connection
            await this.checkDatabase();
            
            // 2. Validate configurations
            await this.validateConfigurations();
            
            // 3. Initialize OAuth tokens for NCR Aloha
            await this.initializeOAuthTokens();
            
            // 4. Start TouchBistro polling for active orders
            await this.startPollingManager();
            
            // 5. Clean up expired data
            await this.cleanup();
            
            console.log('✅ POS Integration System started successfully');
            return true;
        } catch (error) {
            console.error('❌ POS Integration System startup failed:', error);
            throw error;
        }
    }

    async checkDatabase() {
        console.log('📊 Checking database connection...');
        
        try {
            const dbHealth = await ExtendedPOSModels.checkDatabaseConnection();
            console.log(`✅ Database connected - Server time: ${dbHealth.current_time}`);
            
            const stats = await ExtendedPOSModels.getSystemStats();
            console.log('📈 System stats:', stats);
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async validateConfigurations() {
        console.log('⚙️ Validating POS configurations...');
        
        const supportedTypes = posConfig.getSupportedPOSTypes();
        const configStatus = {};
        
        supportedTypes.forEach(posType => {
            const isAvailable = posConfig.isPOSAvailable(posType);
            configStatus[posType] = isAvailable;
            
            const status = isAvailable ? '✅' : '⚠️';
            console.log(`${status} ${posType}: ${isAvailable ? 'Configured' : 'Not configured'}`);
        });
        
        const availableCount = Object.values(configStatus).filter(Boolean).length;
        console.log(`🎯 ${availableCount}/${supportedTypes.length} POS systems configured`);
        
        if (availableCount === 0) {
            throw new Error('No POS systems are configured');
        }
    }

    async initializeOAuthTokens() {
        console.log('🔑 Initializing OAuth tokens (NCR Aloha)...');
        
        if (!posConfig.isPOSAvailable('ncr_aloha')) {
            console.log('⏭️ NCR Aloha not configured, skipping OAuth initialization');
            return;
        }

        try {
            // Get all NCR Aloha integrations
            const ncrIntegrations = await this.getNCRIntegrations();
            
            for (const integration of ncrIntegrations) {
                try {
                    await this.posService.ensureValidNCRToken(integration);
                    console.log(`✅ NCR token refreshed for restaurant ${integration.restaurant_id}`);
                } catch (error) {
                    console.error(`❌ Token refresh failed for restaurant ${integration.restaurant_id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ OAuth initialization failed:', error);
        }
    }

    async startPollingManager() {
        console.log('📡 Starting TouchBistro polling manager...');
        
        if (!posConfig.isPOSAvailable('touchbistro')) {
            console.log('⏭️ TouchBistro not configured, skipping polling manager');
            return;
        }

        try {
            // Get all active TouchBistro orders that need polling
            const activeOrders = await ExtendedPOSModels.getActivePollingOrders();
            const touchBistroOrders = activeOrders.filter(order => order.pos_type === 'touchbistro');
            
            console.log(`📊 Found ${touchBistroOrders.length} active TouchBistro orders to poll`);
            
            // Start polling for each active order
            for (const order of touchBistroOrders) {
                this.startOrderPolling(order);
            }
            
            // Set up cleanup interval
            this.startPollingCleanup();
            
        } catch (error) {
            console.error('❌ Polling manager startup failed:', error);
        }
    }

    startOrderPolling(order) {
        const pollId = `${order.pos_integration_id}-${order.order_id}`;
        
        if (this.pollingIntervals.has(pollId)) {
            return; // Already polling
        }

        console.log(`🔄 Starting polling for order ${order.order_id}`);
        
        const intervalId = setInterval(async () => {
            try {
                await this.posService.pollTouchBistroOrderStatus(order, order.order_id);
            } catch (error) {
                console.error(`❌ Polling error for order ${order.order_id}:`, error.message);
                
                // Stop polling after too many failures
                if (order.poll_count > 10) {
                    console.log(`⏹️ Stopping polling for order ${order.order_id} due to repeated failures`);
                    clearInterval(intervalId);
                    this.pollingIntervals.delete(pollId);
                    await ExtendedPOSModels.stopPolling(order.order_id);
                }
            }
        }, 30000); // 30 second interval
        
        this.pollingIntervals.set(pollId, intervalId);
    }

    startPollingCleanup() {
        // Clean up completed/cancelled orders every 5 minutes
        setInterval(async () => {
            try {
                const activeOrders = await ExtendedPOSModels.getActivePollingOrders();
                const completedStatuses = ['completed', 'cancelled', 'picked_up'];
                
                for (const order of activeOrders) {
                    if (completedStatuses.includes(order.status)) {
                        const pollId = `${order.pos_integration_id}-${order.order_id}`;
                        
                        if (this.pollingIntervals.has(pollId)) {
                            clearInterval(this.pollingIntervals.get(pollId));
                            this.pollingIntervals.delete(pollId);
                            await ExtendedPOSModels.stopPolling(order.order_id);
                            console.log(`🛑 Stopped polling for completed order ${order.order_id}`);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Polling cleanup error:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    async cleanup() {
        console.log('🧹 Cleaning up expired data...');
        
        try {
            // Clean up expired OAuth tokens
            const expiredTokens = await ExtendedPOSModels.deleteExpiredTokens();
            if (expiredTokens.length > 0) {
                console.log(`🗑️ Cleaned up ${expiredTokens.length} expired tokens`);
            }
            
            // Stop polling for old orders (older than 24 hours)
            const oldPollingOrders = await this.getOldPollingOrders();
            for (const order of oldPollingOrders) {
                await ExtendedPOSModels.stopPolling(order.order_id);
            }
            
            if (oldPollingOrders.length > 0) {
                console.log(`🗑️ Stopped polling for ${oldPollingOrders.length} old orders`);
            }
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }

    async getNCRIntegrations() {
        // This would query your database for NCR integrations
        // Implement based on your database structure
        return [];
    }

    async getOldPollingOrders() {
        // This would query for polling orders older than 24 hours
        // Implement based on your database structure
        return [];
    }

    // Graceful shutdown
    async shutdown() {
        console.log('🛑 Shutting down POS Integration System...');
        
        // Stop all polling intervals
        for (const [pollId, intervalId] of this.pollingIntervals) {
            clearInterval(intervalId);
            console.log(`⏹️ Stopped polling: ${pollId}`);
        }
        
        this.pollingIntervals.clear();
        console.log('✅ POS Integration System shutdown complete');
    }

    // Health check method
    async healthCheck() {
        const health = {
            status: 'healthy',
            timestamp: new Date(),
            services: {}
        };

        try {
            // Check database
            await ExtendedPOSModels.checkDatabaseConnection();
            health.services.database = { status: 'healthy' };
        } catch (error) {
            health.services.database = { status: 'unhealthy', error: error.message };
            health.status = 'unhealthy';
        }

        // Check POS configurations
        const posTypes = posConfig.getSupportedPOSTypes();
        health.services.pos = {};
        
        posTypes.forEach(posType => {
            health.services.pos[posType] = {
                configured: posConfig.isPOSAvailable(posType),
                status: posConfig.isPOSAvailable(posType) ? 'available' : 'not_configured'
            };
        });

        // Check polling status
        health.services.polling = {
            activePolls: this.pollingIntervals.size,
            status: 'operational'
        };

        return health;
    }
}

// Export for use in your main application
module.exports = POSStartupManager;

// If run directly, start the system
if (require.main === module) {
    const startupManager = new POSStartupManager();
    
    startupManager.initialize()
        .then(() => {
            console.log('🎉 POS Integration System is running!');
            
            // Set up graceful shutdown
            process.on('SIGINT', async () => {
                console.log('\n🛑 Received SIGINT, shutting down gracefully...');
                await startupManager.shutdown();
                process.exit(0);
            });
            
            process.on('SIGTERM', async () => {
                console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
                await startupManager.shutdown();
                process.exit(0);
            });
        })
        .catch((error) => {
            console.error('💥 Startup failed:', error);
            process.exit(1);
        });
}