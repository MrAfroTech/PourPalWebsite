// Extended POS Models - Database models for NCR Aloha and TouchBistro integration
// This extends your existing database models for Square and Clover

const { Pool } = require('pg');

// Database connection (use your existing connection)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ExtendedPOSModels {
    
    // Enhanced POS Integration model (extends your existing one)
    static async createPOSIntegration(data) {
        const query = `
            INSERT INTO pos_integrations (
                restaurant_id, pos_type, api_credentials_encrypted, 
                oauth_access_token, oauth_refresh_token, oauth_token_expires_at,
                oauth_scope, partner_id, site_id, location_id, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        
        const values = [
            data.restaurant_id,
            data.pos_type,
            data.api_credentials_encrypted,
            data.oauth_access_token || null,
            data.oauth_refresh_token || null,
            data.oauth_token_expires_at || null,
            data.oauth_scope || null,
            data.partner_id || null,
            data.site_id || null,
            data.location_id || null,
            data.is_active !== false
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getPOSIntegration(restaurantId) {
        const query = `
            SELECT pi.*, ot.access_token, ot.refresh_token, ot.expires_at as token_expires_at
            FROM pos_integrations pi
            LEFT JOIN oauth_tokens ot ON pi.id = ot.pos_integration_id
            WHERE pi.restaurant_id = $1 AND pi.is_active = true
        `;
        
        const result = await pool.query(query, [restaurantId]);
        return result.rows[0];
    }

    static async updatePOSIntegration(id, data) {
        const fields = [];
        const values = [];
        let valueIndex = 1;

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = $${valueIndex}`);
                values.push(data[key]);
                valueIndex++;
            }
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE pos_integrations 
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${valueIndex}
            RETURNING *
        `;
        
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // OAuth Token Management (for NCR Aloha)
    static async saveOAuthToken(posIntegrationId, tokenData) {
        const query = `
            INSERT INTO oauth_tokens (
                pos_integration_id, access_token, refresh_token, 
                token_type, expires_at, scope
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (pos_integration_id) 
            DO UPDATE SET 
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                expires_at = EXCLUDED.expires_at,
                scope = EXCLUDED.scope,
                updated_at = NOW()
            RETURNING *
        `;
        
        const values = [
            posIntegrationId,
            tokenData.access_token,
            tokenData.refresh_token,
            tokenData.token_type || 'Bearer',
            tokenData.expires_at,
            tokenData.scope
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getOAuthToken(posIntegrationId) {
        const query = `
            SELECT * FROM oauth_tokens 
            WHERE pos_integration_id = $1
        `;
        
        const result = await pool.query(query, [posIntegrationId]);
        return result.rows[0];
    }

    static async deleteExpiredTokens() {
        const query = `
            DELETE FROM oauth_tokens 
            WHERE expires_at < NOW() - INTERVAL '1 day'
            RETURNING pos_integration_id
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    // Polling Status Management (for TouchBistro)
    static async createPollingStatus(data) {
        const query = `
            INSERT INTO polling_status (
                pos_integration_id, order_id, last_poll_at, 
                poll_count, is_active
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [
            data.pos_integration_id,
            data.order_id,
            data.last_poll_at || new Date(),
            data.poll_count || 0,
            data.is_active !== false
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updatePollingStatus(id, data) {
        const query = `
            UPDATE polling_status 
            SET last_poll_at = $1, poll_count = poll_count + 1, is_active = $2
            WHERE id = $3
            RETURNING *
        `;
        
        const values = [
            data.last_poll_at || new Date(),
            data.is_active,
            id
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getActivePollingOrders() {
        const query = `
            SELECT ps.*, pi.pos_type, pi.location_id, pi.site_id
            FROM polling_status ps
            JOIN pos_integrations pi ON ps.pos_integration_id = pi.id
            WHERE ps.is_active = true AND pi.is_active = true
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    static async stopPolling(orderId) {
        const query = `
            UPDATE polling_status 
            SET is_active = false 
            WHERE order_id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [orderId]);
        return result.rows[0];
    }

    // Enhanced Order Management
    static async createOrder(orderData) {
        const query = `
            INSERT INTO orders (
                restaurant_id, customer_id, pos_type, pos_order_id,
                pos_site_id, pos_location_id, order_data, status, 
                total_amount, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *
        `;
        
        const values = [
            orderData.restaurant_id,
            orderData.customer_id,
            orderData.pos_type,
            orderData.pos_order_id,
            orderData.pos_site_id || null,
            orderData.pos_location_id || null,
            JSON.stringify(orderData.order_data),
            orderData.status || 'pending',
            orderData.total_amount
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updateOrderStatus(orderId, statusData) {
        const query = `
            UPDATE orders 
            SET status = $1, pos_status = $2, updated_at = NOW()
            WHERE pos_order_id = $3 OR id = $3
            RETURNING *
        `;
        
        const values = [
            statusData.normalizedStatus,
            statusData.rawStatus,
            orderId
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getOrdersByRestaurant(restaurantId, limit = 50) {
        const query = `
            SELECT * FROM orders 
            WHERE restaurant_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        
        const result = await pool.query(query, [restaurantId, limit]);
        return result.rows;
    }

    static async getOrdersByPOSType(posType, limit = 100) {
        const query = `
            SELECT o.*, r.name as restaurant_name
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.pos_type = $1 
            ORDER BY o.created_at DESC 
            LIMIT $2
        `;
        
        const result = await pool.query(query, [posType, limit]);
        return result.rows;
    }

    // Menu Management
    static async saveMenu(restaurantId, menuData, posType) {
        const query = `
            INSERT INTO menus (
                restaurant_id, pos_type, menu_data, last_synced_at
            ) VALUES ($1, $2, $3, NOW())
            ON CONFLICT (restaurant_id, pos_type)
            DO UPDATE SET 
                menu_data = EXCLUDED.menu_data,
                last_synced_at = NOW()
            RETURNING *
        `;
        
        const values = [
            restaurantId,
            posType,
            JSON.stringify(menuData)
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getMenu(restaurantId, posType) {
        const query = `
            SELECT * FROM menus 
            WHERE restaurant_id = $1 AND pos_type = $2
        `;
        
        const result = await pool.query(query, [restaurantId, posType]);
        return result.rows[0];
    }

    // Webhook Signature Management
    static async saveWebhookSignature(posType, webhookSecret) {
        const query = `
            INSERT INTO webhook_signatures (pos_type, webhook_secret)
            VALUES ($1, $2)
            ON CONFLICT (pos_type)
            DO UPDATE SET webhook_secret = EXCLUDED.webhook_secret
            RETURNING *
        `;
        
        const result = await pool.query(query, [posType, webhookSecret]);
        return result.rows[0];
    }

    static async getWebhookSignature(posType) {
        const query = `
            SELECT webhook_secret FROM webhook_signatures 
            WHERE pos_type = $1 AND is_active = true
        `;
        
        const result = await pool.query(query, [posType]);
        return result.rows[0]?.webhook_secret;
    }

    // Analytics and Reporting
    static async getPOSPerformanceMetrics(startDate, endDate) {
        const query = `
            SELECT 
                pos_type,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                COUNT(DISTINCT restaurant_id) as restaurant_count,
                AVG(total_amount) as avg_order_value
            FROM orders 
            WHERE created_at BETWEEN $1 AND $2
            GROUP BY pos_type
        `;
        
        const result = await pool.query(query, [startDate, endDate]);
        return result.rows;
    }

    static async getRestaurantPOSStatus() {
        const query = `
            SELECT 
                r.id,
                r.name,
                pi.pos_type,
                pi.is_active,
                CASE 
                    WHEN pi.pos_type = 'ncr_aloha' THEN (
                        ot.expires_at > NOW() + INTERVAL '5 minutes'
                    )
                    ELSE true
                END as token_valid,
                COUNT(o.id) as orders_today
            FROM restaurants r
            LEFT JOIN pos_integrations pi ON r.id = pi.restaurant_id
            LEFT JOIN oauth_tokens ot ON pi.id = ot.pos_integration_id
            LEFT JOIN orders o ON r.id = o.restaurant_id 
                AND o.created_at >= CURRENT_DATE
            GROUP BY r.id, r.name, pi.pos_type, pi.is_active, ot.expires_at
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    // Health Check Methods
    static async checkDatabaseConnection() {
        const query = 'SELECT NOW() as current_time';
        const result = await pool.query(query);
        return result.rows[0];
    }

    static async getSystemStats() {
        const queries = [
            { name: 'total_restaurants', query: 'SELECT COUNT(*) FROM restaurants' },
            { name: 'total_integrations', query: 'SELECT COUNT(*) FROM pos_integrations WHERE is_active = true' },
            { name: 'total_orders', query: 'SELECT COUNT(*) FROM orders' },
            { name: 'orders_today', query: 'SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE' }
        ];

        const stats = {};
        for (const q of queries) {
            const result = await pool.query(q.query);
            stats[q.name] = parseInt(result.rows[0].count);
        }
        
        return stats;
    }
}

module.exports = ExtendedPOSModels;