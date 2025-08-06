require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeKeys() {
    console.log('🔑 Testing Stripe API keys...');
    
    try {
        // Test the secret key by making a simple API call
        const account = await stripe.accounts.retrieve();
        console.log('✅ Secret key is valid!');
        console.log('📊 Account ID:', account.id);
        console.log('🌍 Account country:', account.country);
        
        // Test the publishable key format
        const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        if (publishableKey && publishableKey.startsWith('pk_test_')) {
            console.log('✅ Publishable key format is correct!');
            console.log('🔑 Publishable key:', publishableKey.substring(0, 20) + '...');
        } else {
            console.log('❌ Publishable key format is incorrect or missing');
        }
        
    } catch (error) {
        console.log('❌ Secret key is invalid:', error.message);
    }
}

testStripeKeys(); 