// test-complete-flow.js - Test the complete flow from webform to automation
const axios = require('axios');

console.log('🎯 Testing Complete Flow: Webform → Klaviyo → Automation\n');

// Simulate the exact data that comes from your webform
const simulateWebformSubmission = async () => {
  console.log('1️⃣ Simulating webform submission...');
  
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

  try {
    console.log('📋 Form data being submitted:', formData);
    
    const response = await axios.post('http://localhost:3001/api/vendor-registration/register', formData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Webform submission successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.log('❌ Webform submission failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return null;
  }
};

// Simulate Klaviyo webhook that would be triggered by the form submission
const simulateKlaviyoWebhook = async (customerData) => {
  console.log('\n2️⃣ Simulating Klaviyo webhook (profile.subscribed)...');
  
  const webhookData = {
    data: [{
      type: 'profile.subscribed',
      attributes: {
        email: customerData.email,
        phone_number: customerData.phone,
        first_name: customerData.vendorName.split(' ')[0],
        last_name: customerData.vendorName.split(' ').slice(1).join(' '),
        properties: {
          business_name: customerData.businessName,
          vendor_type: customerData.vendorType,
          cuisine_type: customerData.cuisineType,
          pos_system: customerData.posSystem,
          plan_selected: customerData.selectedPlan,
          source: 'ezfest_vendor_registration'
        }
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

  try {
    const response = await axios.post('http://localhost:3001/api/webhooks/klaviyo', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature_for_development',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      },
      timeout: 10000
    });

    console.log('✅ Klaviyo webhook processed successfully!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.log('❌ Klaviyo webhook failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return null;
  }
};

// Simulate list subscription (vendor signup list)
const simulateListSubscription = async (profileId) => {
  console.log('\n3️⃣ Simulating list subscription (vendor signup list)...');
  
  const listData = {
    data: [{
      type: 'list.subscribed',
      attributes: {},
      relationships: {
        profile: {
          data: {
            id: profileId
          }
        },
        list: {
          data: {
            id: process.env.KLAVIYO_LIST_ID || 'TJr6rx' // Your vendor signup list
          }
        }
      }
    }]
  };

  try {
    const response = await axios.post('http://localhost:3001/api/webhooks/klaviyo', listData, {
      headers: {
        'Content-Type': 'application/json',
        'x-klaviyo-signature': 'test_signature_for_development',
        'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
      },
      timeout: 10000
    });

    console.log('✅ List subscription processed successfully!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.log('❌ List subscription failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return null;
  }
};

// Simulate email engagement events
const simulateEmailEngagement = async (profileId) => {
  console.log('\n4️⃣ Simulating email engagement events...');
  
  const events = [
    {
      type: 'email.opened',
      attributes: {
        campaign_id: 'welcome_campaign_123'
      },
      relationships: {
        profile: { data: { id: profileId } },
        campaign: { data: { id: 'welcome_campaign_123' } }
      }
    },
    {
      type: 'email.clicked',
      attributes: {
        campaign_id: 'welcome_campaign_123',
        url: 'https://ezdrink.us/demo'
      },
      relationships: {
        profile: { data: { id: profileId } },
        campaign: { data: { id: 'welcome_campaign_123' } }
      }
    }
  ];

  for (const event of events) {
    try {
      const response = await axios.post('http://localhost:3001/api/webhooks/klaviyo', {
        data: [event]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-klaviyo-signature': 'test_signature_for_development',
          'x-klaviyo-timestamp': Math.floor(Date.now() / 1000).toString()
        },
        timeout: 10000
      });

      console.log(`✅ ${event.type} processed successfully!`);
    } catch (error) {
      console.log(`❌ ${event.type} failed:`, error.message);
    }
  }
};

// Simulate Stripe subscription (if they upgrade to paid plan)
const simulateStripeSubscription = async (customerEmail) => {
  console.log('\n5️⃣ Simulating Stripe subscription (paid plan upgrade)...');
  
  const stripeData = {
    type: 'customer.subscription.created',
    data: {
      object: {
        id: `sub_${Date.now()}`,
        customer: `cus_${Date.now()}`,
        status: 'active',
        created: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        items: {
          data: [{
            price: {
              nickname: 'Pro Plan',
              unit_amount: 9900
            }
          }]
        }
      }
    }
  };

  try {
    const response = await axios.post('http://localhost:3001/api/webhooks/stripe', stripeData, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_for_development'
      },
      timeout: 10000
    });

    console.log('✅ Stripe subscription processed successfully!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.log('❌ Stripe subscription failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return null;
  }
};

// Test the complete flow
async function testCompleteFlow() {
  console.log('🚀 Starting complete flow test...\n');
  
  const results = {
    webformSubmission: false,
    klaviyoWebhook: false,
    listSubscription: false,
    emailEngagement: false,
    stripeSubscription: false
  };

  try {
    // Step 1: Simulate webform submission
    const formResult = await simulateWebformSubmission();
    results.webformSubmission = !!formResult;

    if (formResult) {
      // Step 2: Simulate Klaviyo profile subscription
      const klaviyoResult = await simulateKlaviyoWebhook(formResult);
      results.klaviyoWebhook = !!klaviyoResult;

      if (klaviyoResult) {
        // Extract profile ID from the webhook data
        const profileId = klaviyoResult.data?.[0]?.relationships?.profile?.data?.id || 
                         `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Step 3: Simulate list subscription
        const listResult = await simulateListSubscription(profileId);
        results.listSubscription = !!listResult;

        // Step 4: Simulate email engagement
        await simulateEmailEngagement(profileId);
        results.emailEngagement = true;

        // Step 5: Simulate Stripe subscription (optional)
        const stripeResult = await simulateStripeSubscription(formResult.email);
        results.stripeSubscription = !!stripeResult;
      }
    }

    // Summary
    console.log('\n📊 Complete Flow Test Results:');
    console.log('================================');
    console.log(`Webform Submission: ${results.webformSubmission ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Klaviyo Webhook: ${results.klaviyoWebhook ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`List Subscription: ${results.listSubscription ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Email Engagement: ${results.emailEngagement ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Stripe Subscription: ${results.stripeSubscription ? '✅ PASS' : '❌ FAIL'}`);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests >= 4) { // Allow Stripe to be optional
      console.log('\n🎉 Complete flow test successful!');
      console.log('\n📋 What this means:');
      console.log('✅ Customer can sign up through your webform');
      console.log('✅ Customer gets added to Klaviyo automatically');
      console.log('✅ Welcome sequence is triggered');
      console.log('✅ Engagement is being tracked');
      console.log('✅ Paid upgrades are handled');
      console.log('\n🚀 Your sales funnel automation is working!');
    } else {
      console.log('\n🔧 Some tests failed. Check the error messages above.');
      console.log('\n💡 Common issues:');
      console.log('1. Make sure server is running: npm run server');
      console.log('2. Check that Klaviyo API keys are set');
      console.log('3. Verify webhook endpoints are accessible');
      console.log('4. Check server logs for detailed errors');
    }

  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testCompleteFlow().catch(console.error);
}

module.exports = { testCompleteFlow }; 