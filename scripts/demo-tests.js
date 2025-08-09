// Demo Test Scripts - Automated tests for NCR Aloha and TouchBistro demo mode
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

class DemoTester {
    constructor() {
        this.results = [];
    }

    async runAllTests() {
        console.log('🧪 Starting POS Integration Demo Tests...\n');

        try {
            await this.testServerHealth();
            await this.testDemoStatus();
            await this.testRestaurantList();
            await this.testNCRAlohaFlow();
            await this.testTouchBistroFlow();
            await this.testMenuSync();
            await this.testConnectionTests();
            await this.testOrderTracking();
            await this.printSummary();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }
    }

    async testServerHealth() {
        console.log('🏥 Testing server health...');
        try {
            const response = await axios.get(`${BASE_URL}/../health`);
            this.logSuccess('Server health check', response.data);
        } catch (error) {
            this.logError('Server health check', error);
        }
    }

    async testDemoStatus() {
        console.log('📊 Testing demo status...');
        try {
            const response = await axios.get(`${BASE_URL}/demo/status`);
            this.logSuccess('Demo status', response.data.status);
        } catch (error) {
            this.logError('Demo status', error);
        }
    }

    async testRestaurantList() {
        console.log('🏪 Testing restaurant list...');
        try {
            const response = await axios.get(`${BASE_URL}/demo/restaurants`);
            this.logSuccess('Restaurant list', `Found ${response.data.restaurants.length} demo restaurants`);
        } catch (error) {
            this.logError('Restaurant list', error);
        }
    }

    async testNCRAlohaFlow() {
        console.log('🔷 Testing NCR Aloha complete flow...');
        try {
            // Test complete flow
            const flowResponse = await axios.post(`${BASE_URL}/demo/test/complete-flow/1`);
            this.logSuccess('NCR Aloha complete flow', flowResponse.data.message);

            // Wait a bit for status updates
            await this.sleep(3000);

            // Check order status
            const orderId = flowResponse.data.steps.orderCreation.orderId;
            const statusResponse = await axios.get(`${BASE_URL}/demo/orders/${orderId}/status`);
            this.logSuccess('NCR Aloha order status', `Status: ${statusResponse.data.status.status}`);

            return orderId;
        } catch (error) {
            this.logError('NCR Aloha flow', error);
            return null;
        }
    }

    async testTouchBistroFlow() {
        console.log('🔶 Testing TouchBistro complete flow...');
        try {
            // Test complete flow
            const flowResponse = await axios.post(`${BASE_URL}/demo/test/complete-flow/2`);
            this.logSuccess('TouchBistro complete flow', flowResponse.data.message);

            // Wait a bit for polling updates
            await this.sleep(4000);

            // Check order status
            const orderId = flowResponse.data.steps.orderCreation.orderId;
            const statusResponse = await axios.get(`${BASE_URL}/demo/orders/${orderId}/status`);
            this.logSuccess('TouchBistro order status', `Status: ${statusResponse.data.status.status}`);

            return orderId;
        } catch (error) {
            this.logError('TouchBistro flow', error);
            return null;
        }
    }

    async testMenuSync() {
        console.log('📋 Testing menu synchronization...');
        try {
            // Test NCR menu sync
            const ncrMenuResponse = await axios.post(`${BASE_URL}/demo/restaurants/1/menu/sync`);
            this.logSuccess('NCR menu sync', `${ncrMenuResponse.data.menuData.categories.length} categories synced`);

            // Test TouchBistro menu sync  
            const tbMenuResponse = await axios.post(`${BASE_URL}/demo/restaurants/2/menu/sync`);
            this.logSuccess('TouchBistro menu sync', `${tbMenuResponse.data.menuData.categories.length} categories synced`);

            // Get synced menus
            const ncrMenu = await axios.get(`${BASE_URL}/demo/restaurants/1/menu`);
            const tbMenu = await axios.get(`${BASE_URL}/demo/restaurants/2/menu`);
            
            this.logSuccess('Menu retrieval', `NCR: ${ncrMenu.data.posType}, TouchBistro: ${tbMenu.data.posType}`);
        } catch (error) {
            this.logError('Menu sync', error);
        }
    }

    async testConnectionTests() {
        console.log('🔌 Testing POS connections...');
        try {
            // Test NCR connection
            const ncrTest = await axios.post(`${BASE_URL}/demo/pos/ncr_aloha/test`);
            this.logSuccess('NCR connection test', ncrTest.data.testResult.message);

            // Test TouchBistro connection
            const tbTest = await axios.post(`${BASE_URL}/demo/pos/touchbistro/test`);
            this.logSuccess('TouchBistro connection test', tbTest.data.testResult.message);
        } catch (error) {
            this.logError('Connection tests', error);
        }
    }

    async testOrderTracking() {
        console.log('📦 Testing order tracking...');
        try {
            // Create a custom order
            const orderData = {
                customer: {
                    name: 'Demo Tester',
                    phone: '+1555123456',
                    email: 'demo@test.com'
                },
                items: [
                    { id: 'item_001', name: 'Test Burger', quantity: 1, price: 15.99 },
                    { id: 'item_002', name: 'Test Fries', quantity: 1, price: 4.99 }
                ]
            };

            const orderResponse = await axios.post(`${BASE_URL}/demo/restaurants/1/orders`, orderData);
            const orderId = orderResponse.data.order.orderId;
            
            this.logSuccess('Custom order creation', `Order ID: ${orderId}`);

            // Track status changes over time
            console.log('   📊 Tracking status changes for 10 seconds...');
            for (let i = 0; i < 5; i++) {
                await this.sleep(2000);
                const statusResponse = await axios.get(`${BASE_URL}/demo/orders/${orderId}/status`);
                console.log(`   ⏱️  ${i * 2 + 2}s: ${statusResponse.data.status.status}`);
            }

            this.logSuccess('Order tracking', 'Status changes monitored');
        } catch (error) {
            this.logError('Order tracking', error);
        }
    }

    async testBulkOrders() {
        console.log('📈 Testing bulk order creation...');
        try {
            const promises = [];
            
            // Create 5 orders across different restaurants
            for (let i = 1; i <= 5; i++) {
                const restaurantId = ((i - 1) % 4) + 1; // Cycle through restaurants 1-4
                
                const orderData = {
                    customer: {
                        name: `Bulk Customer ${i}`,
                        phone: `+155512345${i}`,
                        email: `bulk${i}@test.com`
                    },
                    items: [
                        { id: `item_${i}`, name: `Bulk Item ${i}`, quantity: 1, price: 9.99 + i }
                    ]
                };

                promises.push(
                    axios.post(`${BASE_URL}/demo/restaurants/${restaurantId}/orders`, orderData)
                );
            }

            const results = await Promise.all(promises);
            this.logSuccess('Bulk orders', `Created ${results.length} orders successfully`);

            // Check all orders
            const allOrdersResponse = await axios.get(`${BASE_URL}/demo/orders`);
            this.logSuccess('Order listing', `Total orders: ${allOrdersResponse.data.count}`);
        } catch (error) {
            this.logError('Bulk orders', error);
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logSuccess(test, result) {
        console.log(`   ✅ ${test}: ${result}`);
        this.results.push({ test, status: 'PASS', result });
    }

    logError(test, error) {
        const message = error.response?.data?.error || error.message;
        console.log(`   ❌ ${test}: ${message}`);
        this.results.push({ test, status: 'FAIL', error: message });
    }

    async printSummary() {
        console.log('\n🎯 ===============================================');
        console.log('   TEST SUMMARY');
        console.log('🎯 ===============================================\n');

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total:  ${this.results.length}\n`);

        if (failed > 0) {
            console.log('❌ Failed Tests:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   • ${r.test}: ${r.error}`));
            console.log();
        }

        // Get final system status
        try {
            const statusResponse = await axios.get(`${BASE_URL}/demo/status`);
            const ordersResponse = await axios.get(`${BASE_URL}/demo/orders`);
            
            console.log('📊 Final System Status:');
            console.log(`   • Demo Mode: Active`);
            console.log(`   • Active Orders: ${statusResponse.data.status.activeOrders}`);
            console.log(`   • Active Polling: ${statusResponse.data.status.activePolling}`);
            console.log(`   • Total Orders Created: ${ordersResponse.data.count}`);
        } catch (error) {
            console.log('   ⚠️  Could not retrieve final status');
        }

        console.log('\n🎉 Demo test suite completed!');
        console.log('💡 You can now test individual endpoints or run the demo server');
        console.log('🔗 Demo server: http://localhost:3001');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new DemoTester();
    
    // Check if server is running
    axios.get(`${BASE_URL}/../health`)
        .then(() => {
            console.log('🎭 Demo server detected, starting tests...\n');
            return tester.runAllTests();
        })
        .catch(() => {
            console.log('❌ Demo server not running!');
            console.log('🚀 Please start the demo server first:');
            console.log('   node demo-server.js');
            console.log('   Then run: node scripts/demo-tests.js');
        });
}

module.exports = DemoTester;