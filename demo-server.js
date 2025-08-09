// Demo Server - Test NCR Aloha and TouchBistro integrations without credentials
const express = require('express');
const demoPOSRoutes = require('./api/demo-pos-routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Demo routes
app.use('/api', demoPOSRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🎭 POS Integration Demo Server',
        version: '1.0.0',
        status: 'running',
        demoMode: true,
        availableEndpoints: {
            status: 'GET /api/demo/status',
            restaurants: 'GET /api/demo/restaurants',
            createOrder: 'POST /api/demo/restaurants/:id/orders',
            orderStatus: 'GET /api/demo/orders/:id/status',
            syncMenu: 'POST /api/demo/restaurants/:id/menu/sync',
            getMenu: 'GET /api/demo/restaurants/:id/menu',
            testConnection: 'POST /api/demo/pos/:type/test',
            listOrders: 'GET /api/demo/orders',
            completeFlow: 'POST /api/demo/test/complete-flow/:id',
            clearData: 'DELETE /api/demo/clear'
        },
        quickStart: {
            step1: 'GET /api/demo/restaurants - See available demo restaurants',
            step2: 'POST /api/demo/test/complete-flow/1 - Test complete NCR Aloha flow',
            step3: 'POST /api/demo/test/complete-flow/2 - Test complete TouchBistro flow',
            step4: 'GET /api/demo/orders - Watch order status updates'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        mode: 'demo',
        uptime: process.uptime()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Demo server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        demo: true
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Try GET / for available endpoints',
        demo: true
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🎭 ===============================================
   POS INTEGRATION DEMO SERVER STARTED
🎭 ===============================================

🚀 Server running on: http://localhost:${PORT}
📋 Demo status: http://localhost:${PORT}/api/demo/status
🏪 Demo restaurants: http://localhost:${PORT}/api/demo/restaurants

🧪 QUICK TESTS:
• Test NCR Aloha flow: POST http://localhost:${PORT}/api/demo/test/complete-flow/1
• Test TouchBistro flow: POST http://localhost:${PORT}/api/demo/test/complete-flow/2
• View all orders: GET http://localhost:${PORT}/api/demo/orders

📖 Full API docs: GET http://localhost:${PORT}/

🎯 This demo simulates:
  ✅ NCR Aloha OAuth token management
  ✅ NCR Aloha webhook status updates
  ✅ TouchBistro polling-based status updates
  ✅ Menu synchronization for both systems
  ✅ Order creation and lifecycle management

💡 TIP: Use tools like Postman, curl, or any HTTP client to test the endpoints!

🎭 ===============================================
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Demo server shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Demo server shutting down...');
    process.exit(0);
});