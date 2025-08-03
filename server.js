require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import vendor registration routes
const vendorRegistrationRoutes = require('./api/vendor-registration');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Vendor registration routes
app.use('/api/vendor-registration', vendorRegistrationRoutes);

// Stripe checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('[STRIPE] Creating checkout session');
    const { formData, plan } = req.body;

    // Validate required fields
    if (!formData || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing required form data or plan selection'
      });
    }

    // Define plan prices (in cents)
    const planPrices = {
      basic: 4900, // $49.00
      premium: 9900, // $99.00
      enterprise: 19900 // $199.00
    };

    const price = planPrices[plan];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `EzDrink ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Monthly subscription for ${formData.businessName || 'your business'}`,
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/signup-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/signup`,
      metadata: {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        businessType: formData.businessType,
        yearsInBusiness: formData.yearsInBusiness,
        averageMonthlyRevenue: formData.averageMonthlyRevenue,
        currentPOS: formData.currentPOS,
        numberOfLocations: formData.numberOfLocations,
        plan: plan
      },
    });

    console.log('[STRIPE] Checkout session created:', session.id);
    
    return res.status(200).json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('[STRIPE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Klaviyo connection
app.get('/api/test-klaviyo', async (req, res) => {
  try {
    const axios = require('axios');
    const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
    
    if (!KLAVIYO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'KLAVIYO_PRIVATE_API_KEY not configured'
      });
    }

    // Test Klaviyo API connection
    const response = await axios.get('https://a.klaviyo.com/api/profiles/', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Accept': 'application/json',
        'Revision': '2023-12-15'
      }
    });

    res.json({
      success: true,
      message: 'Klaviyo connection successful',
      profiles_count: response.data.data?.length || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Klaviyo connection failed',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 