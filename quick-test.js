// quick-test.js - Quick test for Klaviyo integration
const axios = require('axios');

console.log('🧪 Quick Test for Klaviyo Sales Funnel Integration\n');

// Test if server is running
async function testServerConnection() {
  try {
    console.log('1️⃣ Testing server connection...');
    const response = await axios.get('http://localhost:3001/api/health', {
      timeout: 5000
    });
    console.log('✅ Server is running!');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run server');
    return false;
  }
}

// Test Klaviyo webhook endpoint
async function testKlaviyoWebhook() {
  try {
    console.log('\n2️⃣ Testing Klaviyo webhook endpoint...');
    
    const testData = {
      data: [{
        type: 'profile.subscribed',
        attributes: {
          email: 'test@example.com',
          phone_number: '+13054340738',
          first_name: 'Test',
          last_name: 'User',
          properties: {
            business_name: 'Test Business',
            vendor_type: 'food-truck',
            plan_selected: 'free',
            source: 'test_integration'
          }
        },
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id_123'
            }
          }
        }
      }]
    };

    const response = await axios.post('http://localhost:3001/api/webhooks/klaviyo', testData, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature_for_development',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      },
      timeout: 10000
    });

    console.log('✅ Klaviyo webhook test passed!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Klaviyo webhook test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Test Stripe webhook endpoint
async function testStripeWebhook() {
  try {
    console.log('\n3️⃣ Testing Stripe webhook endpoint...');
    
    const testData = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
          created: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          items: {
            data: [{
              price: {
                nickname: 'Basic Plan',
                unit_amount: 4900
              }
            }]
          }
        }
      }
    };

    const response = await axios.post('http://localhost:3001/api/webhooks/stripe', testData, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_for_development'
      },
      timeout: 10000
    });

    console.log('✅ Stripe webhook test passed!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Stripe webhook test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Test engagement events
async function testEngagementEvents() {
  try {
    console.log('\n4️⃣ Testing engagement events...');
    
    // Test email opened event
    const emailEvent = {
      data: [{
        type: 'email.opened',
        attributes: {
          campaign_id: 'test_campaign_123'
        },
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id_123'
            }
          },
          campaign: {
            data: {
              id: 'test_campaign_123'
            }
          }
        }
      }]
    };

    const response = await axios.post('http://localhost:3001/api/webhooks/klaviyo', emailEvent, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature_for_development',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      },
      timeout: 10000
    });

    console.log('✅ Engagement events test passed!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Engagement events test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
  }
    return false;
  }
}

// Main test function
async function runQuickTest() {
  console.log('🚀 Starting quick test...\n');
  
  const results = {
    serverConnection: await testServerConnection(),
    klaviyoWebhook: false,
    stripeWebhook: false,
    engagementEvents: false
  };

  if (results.serverConnection) {
    results.klaviyoWebhook = await testKlaviyoWebhook();
    results.stripeWebhook = await testStripeWebhook();
    results.engagementEvents = await testEngagementEvents();
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Server Connection: ${results.serverConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Klaviyo Webhook: ${results.klaviyoWebhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stripe Webhook: ${results.stripeWebhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Engagement Events: ${results.engagementEvents ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your Klaviyo integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Set up your actual Klaviyo API keys in .env file');
    console.log('2. Configure webhook URLs in Klaviyo dashboard');
    console.log('3. Test with real customer data');
    console.log('4. Monitor the automation flows');
  } else {
    console.log('\n🔧 Some tests failed. Check the error messages above.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure the server is running: npm run server');
    console.log('2. Check that all required files are in place');
    console.log('3. Verify the webhook endpoints are accessible');
    console.log('4. Check server logs for detailed error messages');
  }
}

// Run the test
if (require.main === module) {
  runQuickTest().catch(console.error);
}

module.exports = { runQuickTest }; 