const axios = require('axios');
require('dotenv').config();

async function testKlaviyoConnection() {
    console.log('🧪 Testing Klaviyo Connection...');
    
    const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
    
    if (!KLAVIYO_API_KEY) {
        console.error('❌ KLAVIYO_PRIVATE_API_KEY not found in environment variables');
        return;
    }
    
    console.log('✅ Klaviyo API Key found');
    
    try {
        // Test 1: Check if we can connect to Klaviyo API
        console.log('📡 Testing API connection...');
        const response = await axios.get('https://a.klaviyo.com/api/profiles/', {
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            }
        });
        
        console.log('✅ Klaviyo API connection successful');
        console.log(`📊 Found ${response.data.data?.length || 0} profiles`);
        
        // Test 2: Try to create a test contact
        console.log('👤 Testing contact creation...');
        const testContact = {
            data: {
                type: 'profile',
                attributes: {
                    email: 'test@example.com',
                    phone_number: '+1234567890',
                    first_name: 'Test',
                    last_name: 'Vendor',
                    properties: {
                        $consent: ['email', 'sms'],
                        vendor_type: 'food-truck',
                        cuisine_type: 'mexican',
                        pos_system: 'square',
                        business_name: 'Test Food Truck',
                        plan_selected: 'free',
                        source: 'test_klaviyo_integration'
                    }
                }
            }
        };
        
        const createResponse = await axios.post(
            'https://a.klaviyo.com/api/profiles/',
            testContact,
            {
                headers: {
                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Revision': '2023-12-15'
                }
            }
        );
        
        console.log('✅ Test contact created successfully');
        console.log('🆔 Contact ID:', createResponse.data.data.id);
        
        // Test 3: Track an event
        console.log('📈 Testing event tracking...');
        const eventPayload = {
            data: {
                type: 'event',
                attributes: {
                    profile: {
                        $id: createResponse.data.data.id
                    },
                    metric: {
                        name: 'Test Registration'
                    },
                    properties: {
                        plan: 'free',
                        vendor_type: 'food-truck',
                        business_name: 'Test Food Truck'
                    }
                }
            }
        };
        
        await axios.post(
            'https://a.klaviyo.com/api/events/',
            eventPayload,
            {
                headers: {
                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Revision': '2023-12-15'
                }
            }
        );
        
        console.log('✅ Event tracked successfully');
        console.log('🎉 All Klaviyo tests passed!');
        
    } catch (error) {
        console.error('❌ Klaviyo test failed:');
        console.error('Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.error('🔑 Authentication failed - check your API key');
        } else if (error.response?.status === 403) {
            console.error('🚫 Permission denied - check your API key permissions');
        } else if (error.response?.status === 429) {
            console.error('⏰ Rate limit exceeded - try again later');
        }
    }
}

// Run the test
testKlaviyoConnection(); 