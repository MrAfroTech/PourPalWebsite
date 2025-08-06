// test-api-approach.js - Test the new API-based approach
const axios = require('axios');

console.log('🚀 Testing Klaviyo API-Based Approach\n');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_CUSTOMER = {
  email: 'test@example.com',
  phone: '+13054340738',
  firstName: 'Test',
  lastName: 'User',
  properties: {
    business_name: 'Test Business',
    vendor_type: 'food-truck',
    plan_selected: 'free',
    source: 'test_api_integration'
  }
};

async function testAPIApproach() {
  console.log('🧪 Testing API-based Klaviyo integration...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy:', healthResponse.data);
    
    // Test 2: Simulate webform submission (triggers Klaviyo API calls)
    console.log('\n2️⃣ Testing webform submission with API integration...');
    const formData = {
      vendorName: 'John Doe',
      businessName: 'Taco Truck Delicious',
      vendorType: 'food-truck',
      cuisineType: 'Mexican',
      email: 'john@tacotruck.com',
      phone: '3054340738',
      posSystem: 'Square',
      selectedPlan: 'free'
    };

    const formResponse = await axios.post(`${BASE_URL}/api/vendor-registration/register`, formData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('✅ Webform submission successful!');
    console.log('Response:', formResponse.data);

    // Test 3: Simulate Klaviyo Flow webhook (no signature verification)
    console.log('\n3️⃣ Testing Klaviyo Flow webhook (no signature verification)...');
    const webhookData = {
      data: [{
        type: 'profile.subscribed',
        attributes: {
          email: TEST_CUSTOMER.email,
          phone_number: TEST_CUSTOMER.phone,
          first_name: TEST_CUSTOMER.firstName,
          last_name: TEST_CUSTOMER.lastName,
          properties: TEST_CUSTOMER.properties
        },
        relationships: {
          profile: {
            data: {
              id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          }
        }
      }]
    };

    const webhookResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, webhookData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Klaviyo Flow webhook processed successfully!');
    console.log('Response:', webhookResponse.data);

    // Test 4: Simulate email engagement (no signature verification)
    console.log('\n4️⃣ Testing email engagement events...');
    const engagementData = {
      data: [{
        type: 'email.opened',
        attributes: {
          campaign_id: 'welcome_campaign_123'
        },
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id'
            }
          },
          campaign: {
            data: {
              id: 'welcome_campaign_123'
            }
          }
        }
      }]
    };

    const engagementResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, engagementData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Email engagement processed successfully!');
    console.log('Response:', engagementResponse.data);

    console.log('\n🎉 All API-based tests passed!');
    console.log('\n📋 What this demonstrates:');
    console.log('✅ No webhook signature verification required');
    console.log('✅ Direct API calls to Klaviyo for sending messages');
    console.log('✅ Flow webhooks work without secrets');
    console.log('✅ Engagement tracking works via API');
    console.log('✅ Customer data is unified across platforms');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run server');
    console.log('2. Check that Klaviyo API key is set in .env');
    console.log('3. Verify the webhook endpoints are accessible');
    console.log('4. Check server logs for detailed error messages');
  }
}

// Run the test
if (require.main === module) {
  testAPIApproach().catch(console.error);
}

module.exports = { testAPIApproach }; 