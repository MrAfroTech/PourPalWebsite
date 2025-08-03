const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// Klaviyo configuration
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

// Helper function to add contact to Klaviyo
async function addContactToKlaviyo(contactData) {
    try {
        const klaviyoData = {
            data: {
                type: 'profile',
                attributes: {
                    email: contactData.email,
                    phone_number: contactData.phone,
                    first_name: contactData.vendorName,
                    last_name: contactData.businessName,
                    properties: {
                        $consent: ['email', 'sms'],
                        vendor_type: contactData.vendorType,
                        cuisine_type: contactData.cuisineType || '',
                        pos_system: contactData.posSystem || '',
                        business_name: contactData.businessName,
                        plan_selected: contactData.selectedPlan,
                        source: 'ezfest_vendor_registration'
                    }
                }
            }
        };

        const response = await axios.post(
            'https://a.klaviyo.com/api/profiles/',
            klaviyoData,
            {
                headers: {
                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Revision': '2023-12-15'
                }
            }
        );

        console.log('Contact added to Klaviyo:', response.data);
        return response.data.data.id; // Return profile ID
    } catch (error) {
        console.error('Error adding contact to Klaviyo:', error.response?.data || error.message);
        throw error;
    }
}

// Helper function to track event in Klaviyo
async function trackKlaviyoEvent(profileId, eventName, eventData) {
    try {
        const eventPayload = {
            data: {
                type: 'event',
                attributes: {
                    profile: {
                        $id: profileId
                    },
                    metric: {
                        name: eventName
                    },
                    properties: eventData
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

        console.log(`Event tracked in Klaviyo: ${eventName}`);
    } catch (error) {
        console.error('Error tracking Klaviyo event:', error.response?.data || error.message);
        // Don't throw error for event tracking failures
    }
}

// Helper function to create Stripe payment intent
async function createPaymentIntent(amount, currency = 'usd') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

// Main registration endpoint
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Vendor registration request received:', req.body);
        
        const {
            vendorName,
            businessName,
            vendorType,
            cuisineType,
            email,
            phone,
            posSystem,
            selectedPlan,
            paymentMethodId
        } = req.body;

        // Validate required fields
        if (!vendorName || !businessName || !email || !phone || !selectedPlan) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Add contact to Klaviyo first
        let klaviyoProfileId;
        try {
            console.log('📧 Adding contact to Klaviyo...');
            klaviyoProfileId = await addContactToKlaviyo({
                vendorName,
                businessName,
                vendorType,
                cuisineType,
                email,
                phone,
                posSystem,
                selectedPlan
            });

            console.log('✅ Contact added to Klaviyo with ID:', klaviyoProfileId);

            // Track registration event
            await trackKlaviyoEvent(klaviyoProfileId, 'Vendor Registration Started', {
                plan: selectedPlan,
                vendor_type: vendorType,
                business_name: businessName
            });

            console.log('✅ Registration event tracked in Klaviyo');

        } catch (klaviyoError) {
            console.error('❌ Klaviyo error:', klaviyoError);
            // Continue with registration even if Klaviyo fails
        }

        // Handle payment for Pro/Ultimate plans
        if (selectedPlan === 'pro' || selectedPlan === 'ultimate') {
            if (!paymentMethodId) {
                return res.status(400).json({
                    success: false,
                    error: 'Payment method required for paid plans'
                });
            }

            const planAmount = selectedPlan === 'pro' ? 39.99 : 79.99;

            try {
                // Create payment intent
                const paymentIntent = await createPaymentIntent(planAmount);

                // Confirm payment
                const paymentIntentConfirm = await stripe.paymentIntents.confirm(
                    paymentIntent.id,
                    {
                        payment_method: paymentMethodId,
                        return_url: `${process.env.FRONTEND_URL}/signup/success`,
                    }
                );

                if (paymentIntentConfirm.status === 'succeeded') {
                    // Track successful payment
                    if (klaviyoProfileId) {
                        await trackKlaviyoEvent(klaviyoProfileId, 'Payment Successful', {
                            plan: selectedPlan,
                            amount: planAmount,
                            payment_intent_id: paymentIntent.id
                        });
                    }

                    return res.json({
                        success: true,
                        message: 'Registration successful! Payment processed.',
                        paymentIntent: paymentIntentConfirm,
                        klaviyoProfileId
                    });
                } else {
                    // Payment failed
                    if (klaviyoProfileId) {
                        await trackKlaviyoEvent(klaviyoProfileId, 'Payment Failed', {
                            plan: selectedPlan,
                            amount: planAmount,
                            error: paymentIntentConfirm.last_payment_error?.message
                        });
                    }

                    return res.status(400).json({
                        success: false,
                        error: 'Payment failed',
                        details: paymentIntentConfirm.last_payment_error?.message
                    });
                }

            } catch (paymentError) {
                console.error('Payment error:', paymentError);
                
                if (klaviyoProfileId) {
                    await trackKlaviyoEvent(klaviyoProfileId, 'Payment Error', {
                        plan: selectedPlan,
                        error: paymentError.message
                    });
                }

                return res.status(400).json({
                    success: false,
                    error: 'Payment processing failed',
                    details: paymentError.message
                });
            }
        } else {
            // Free plan - no payment required
            if (klaviyoProfileId) {
                await trackKlaviyoEvent(klaviyoProfileId, 'Free Plan Registration', {
                    plan: selectedPlan
                });
            }

            return res.json({
                success: true,
                message: 'Registration successful! Welcome to the free plan.',
                klaviyoProfileId
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'Registration failed',
            details: error.message
        });
    }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            
            // Update Klaviyo with payment success
            // You can extract customer info from payment intent metadata
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            
            // Update Klaviyo with payment failure
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// For Vercel serverless functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = router;
}

// For Express server
if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    module.exports = router;
} 