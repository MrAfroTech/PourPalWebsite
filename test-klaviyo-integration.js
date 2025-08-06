// test-klaviyo-integration.js
const axios = require('axios');

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
    source: 'test_integration'
  }
};

async function testKlaviyoIntegration() {
  console.log('🧪 Testing Klaviyo Sales Funnel Integration...\n');

  try {
    // Test 1: Klaviyo webhook endpoint
    console.log('1️⃣ Testing Klaviyo webhook endpoint...');
    const klaviyoWebhookResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, {
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
              id: 'test_profile_id'
            }
          }
        }
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      }
    });
    
    console.log('✅ Klaviyo webhook test passed');
    console.log('Response:', klaviyoWebhookResponse.data);

    // Test 2: Stripe webhook endpoint
    console.log('\n2️⃣ Testing Stripe webhook endpoint...');
    const stripeWebhookResponse = await axios.post(`${BASE_URL}/api/webhooks/stripe`, {
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
    }, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      }
    });
    
    console.log('✅ Stripe webhook test passed');
    console.log('Response:', stripeWebhookResponse.data);

    // Test 3: Email engagement event
    console.log('\n3️⃣ Testing email engagement event...');
    const emailEngagementResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, {
      data: [{
        type: 'email.opened',
        attributes: {
          campaign_id: 'test_campaign_123'
        },
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id'
            }
          },
          campaign: {
            data: {
              id: 'test_campaign_123'
            }
          }
        }
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      }
    });
    
    console.log('✅ Email engagement test passed');
    console.log('Response:', emailEngagementResponse.data);

    // Test 4: SMS engagement event
    console.log('\n4️⃣ Testing SMS engagement event...');
    const smsEngagementResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, {
      data: [{
        type: 'sms.delivered',
        attributes: {},
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id'
            }
          }
        }
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      }
    });
    
    console.log('✅ SMS engagement test passed');
    console.log('Response:', smsEngagementResponse.data);

    // Test 5: List subscription event
    console.log('\n5️⃣ Testing list subscription event...');
    const listSubscriptionResponse = await axios.post(`${BASE_URL}/api/webhooks/klaviyo`, {
      data: [{
        type: 'list.subscribed',
        attributes: {},
        relationships: {
          profile: {
            data: {
              id: 'test_profile_id'
            }
          },
          list: {
            data: {
              id: process.env.KLAVIYO_LIST_ID || 'test_list_id'
            }
          }
        }
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      }
    });
    
    console.log('✅ List subscription test passed');
    console.log('Response:', listSubscriptionResponse.data);

    console.log('\n🎉 All tests passed! Klaviyo integration is working correctly.');
    console.log('\n📊 Next steps:');
    console.log('1. Set up your actual Klaviyo webhook URL');
    console.log('2. Configure your Stripe webhook endpoint');
    console.log('3. Create email templates in Klaviyo');
    console.log('4. Test with real customer data');
    console.log('5. Monitor engagement scores and automation flows');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 3001');
    console.log('2. Check that all environment variables are set');
    console.log('3. Verify the webhook endpoints are accessible');
    console.log('4. Check server logs for detailed error messages');
  }
}

// Run the test
if (require.main === module) {
  testKlaviyoIntegration();
}

module.exports = { testKlaviyoIntegration }; 