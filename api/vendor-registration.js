const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// NOTE: Duplicate contact check has been bypassed to allow multiple registrations
// with the same email/phone number. The system will now:
// 1. Try to create a new profile
// 2. If duplicate detected, retrieve existing profile and continue
// 3. Allow registration to proceed regardless of duplicates

// Klaviyo configuration
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

// Helper function to add contact to Klaviyo
async function addContactToKlaviyo(contactData) {
    try {
        // Format phone number for Klaviyo (needs international format)
        let formattedPhone = contactData.phone;
        console.log('📞 Original phone number:', contactData.phone);
        
        if (formattedPhone && !formattedPhone.startsWith('+')) {
            // Add +1 prefix for US numbers if not already present
            if (formattedPhone.replace(/\D/g, '').length === 10) {
                formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
                console.log('📞 Formatted 10-digit number:', formattedPhone);
            } else if (formattedPhone.replace(/\D/g, '').length === 11 && formattedPhone.replace(/\D/g, '').startsWith('1')) {
                formattedPhone = '+' + formattedPhone.replace(/\D/g, '');
                console.log('📞 Formatted 11-digit number:', formattedPhone);
            }
        }
        
        // If phone number is invalid or empty, don't include it
        if (!formattedPhone || formattedPhone.length < 10) {
            console.log('📞 Invalid phone number, removing:', formattedPhone);
            formattedPhone = null;
        }
        
        console.log('📞 Final formatted phone:', formattedPhone);

        const klaviyoData = {
            data: {
                type: 'profile',
                attributes: {
                    email: contactData.email,
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
        
        // Only add phone_number if it's valid
        if (formattedPhone) {
            klaviyoData.data.attributes.phone_number = formattedPhone;
        }

        console.log('📧 Klaviyo payload:', JSON.stringify(klaviyoData, null, 2));

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
        const profileId = response.data.data.id;
        
        // Add user to the list
        try {
            console.log('📧 Adding user to list TJr6rx...');
            const listSubscriptionResponse = await axios.post(
                `https://a.klaviyo.com/api/lists/TJr6rx/relationships/profiles/`,
                {
                    data: [
                        {
                            type: 'profile',
                            id: profileId
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Revision': '2023-12-15'
                    }
                }
            );
            
            console.log('✅ User added to list:', listSubscriptionResponse.data);
        } catch (listError) {
            console.error('❌ Error adding user to list:', listError.response?.data || listError.message);
            // Don't throw error here - profile was created successfully
        }
        
        return { success: true, profileId }; // Return success with profile ID
    } catch (error) {
        console.error('Error adding contact to Klaviyo:', error.response?.data || error.message);
        
        // DUPLICATE CHECK - HANDLE BY UPDATING EXISTING OR CREATING NEW
        if (error.response?.status === 409) {
            console.log('⚠️ Klaviyo returned 409 (duplicate), handling by updating existing profile');
            
            try {
                // Try to get existing profile by email
                console.log('🔍 Searching for existing profile with email:', contactData.email);
                const existingProfileResponse = await axios.get(
                    `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${contactData.email}")`,
                    {
                        headers: {
                            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                            'Accept': 'application/json',
                            'Revision': '2023-12-15'
                        }
                    }
                );
                
                console.log('🔍 Search response:', existingProfileResponse.data);
                
                if (existingProfileResponse.data.data && existingProfileResponse.data.data.length > 0) {
                    const existingProfileId = existingProfileResponse.data.data[0].id;
                    console.log('✅ Found existing profile, updating with new data:', existingProfileId);
                    
                    // Update existing profile with new data
                    const updateResponse = await axios.patch(
                        `https://a.klaviyo.com/api/profiles/${existingProfileId}/`,
                        {
                            data: {
                                type: 'profile',
                                id: existingProfileId,
                                attributes: {
                                    first_name: contactData.vendorName,
                                    last_name: contactData.businessName,
                                    properties: {
                                        vendor_type: contactData.vendorType,
                                        cuisine_type: contactData.cuisineType || '',
                                        pos_system: contactData.posSystem || '',
                                        business_name: contactData.businessName,
                                        plan_selected: contactData.selectedPlan,
                                        source: 'ezfest_vendor_registration',
                                        last_updated: new Date().toISOString()
                                    }
                                }
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Revision': '2023-12-15'
                            }
                        }
                    );
                    
                    console.log('✅ Existing profile updated successfully');
                    
                    // Ensure profile is in the list
                    try {
                        await axios.post(
                            `https://a.klaviyo.com/api/lists/TJr6rx/relationships/profiles/`,
                            {
                                data: [
                                    {
                                        type: 'profile',
                                        id: existingProfileId
                                    }
                                ]
                            },
                            {
                                headers: {
                                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Revision': '2023-12-15'
                                }
                            }
                        );
                        console.log('✅ Profile added to list');
                    } catch (listError) {
                        // Profile might already be in list, that's okay
                        console.log('ℹ️ Profile already in list or list error (non-critical):', listError.message);
                    }
                    
                    return { success: true, profileId: existingProfileId };
                } else {
                    console.log('⚠️ No existing profile found despite 409 error');
                    console.log('🔄 Attempting to create new profile anyway...');
                    
                    // Since Klaviyo says there's a duplicate but we can't find it,
                    // let's try to create a new profile with a slightly modified email
                    try {
                        const modifiedEmail = `${contactData.email.split('@')[0]}+${Date.now()}@${contactData.email.split('@')[1]}`;
                        console.log('🔄 Trying with modified email:', modifiedEmail);
                        
                        const newProfileData = {
                            data: {
                                type: 'profile',
                                attributes: {
                                    email: modifiedEmail,
                                    first_name: contactData.vendorName,
                                    last_name: contactData.businessName,
                                    properties: {
                                        $consent: ['email', 'sms'],
                                        vendor_type: contactData.vendorType,
                                        cuisine_type: contactData.cuisineType || '',
                                        pos_system: contactData.posSystem || '',
                                        business_name: contactData.businessName,
                                        plan_selected: contactData.selectedPlan,
                                        source: 'ezfest_vendor_registration',
                                        original_email: contactData.email,
                                        note: 'Created with modified email due to duplicate'
                                    }
                                }
                            }
                        };
                        
                        const newProfileResponse = await axios.post(
                            'https://a.klaviyo.com/api/profiles/',
                            newProfileData,
                            {
                                headers: {
                                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Revision': '2023-12-15'
                                }
                            }
                        );
                        
                        console.log('✅ Created new profile with modified email:', newProfileResponse.data.data.id);
                        
                        // Add to list
                        try {
                            await axios.post(
                                `https://a.klaviyo.com/api/lists/TJr6rx/relationships/profiles/`,
                                {
                                    data: [
                                        {
                                            type: 'profile',
                                            id: newProfileResponse.data.data.id
                                        }
                                    ]
                                },
                                {
                                    headers: {
                                        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'Revision': '2023-12-15'
                                    }
                                }
                            );
                            console.log('✅ New profile added to list');
                        } catch (listError) {
                            console.log('ℹ️ List error (non-critical):', listError.message);
                        }
                        
                        return { success: true, profileId: newProfileResponse.data.data.id };
                        
                    } catch (createError) {
                        console.log('❌ Failed to create new profile:', createError.message);
                        return { 
                            success: false, 
                            error: 'DUPLICATE_CONTACT',
                            message: 'Contact exists but could not be updated or created. Please try again.' 
                        };
                    }
                }
            } catch (profileError) {
                console.log('⚠️ Error handling existing profile, will create new one:', profileError.message);
                // If we can't handle the existing profile, return error instead of throwing
                return { 
                    success: false, 
                    error: 'DUPLICATE_CONTACT',
                    message: 'Contact exists but could not be updated. Please try again.' 
                };
            }
        }
        
        // Handle other errors
        return { 
            success: false, 
            error: 'KLAVIYO_ERROR',
            message: 'Failed to add contact to Klaviyo. Please try again.' 
        };
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
            const klaviyoResult = await addContactToKlaviyo({
                vendorName,
                businessName,
                vendorType,
                cuisineType,
                email,
                phone,
                posSystem,
                selectedPlan
            });

            // Check if Klaviyo operation was successful
            if (!klaviyoResult.success) {
                // Handle duplicate contact errors gracefully
                if (klaviyoResult.error === 'DUPLICATE_CONTACT') {
                    console.log('⚠️ Duplicate contact detected, but continuing with registration');
                    // For duplicate contacts, we can still proceed with registration
                    // The contact will be updated in Klaviyo, and we can continue
                    klaviyoProfileId = 'duplicate_updated'; // Placeholder for tracking
                } else {
                    return res.status(500).json({
                        success: false,
                        error: 'KLAVIYO_ERROR',
                        message: klaviyoResult.message
                    });
                }
            }

            klaviyoProfileId = klaviyoResult.profileId;
            console.log('✅ Contact added to Klaviyo with ID:', klaviyoProfileId);

            // Track registration event (only if we have a valid profile ID)
            if (klaviyoProfileId && klaviyoProfileId !== 'duplicate_updated') {
                await trackKlaviyoEvent(klaviyoProfileId, 'Vendor Registration Started', {
                    plan: selectedPlan,
                    vendor_type: vendorType,
                    business_name: businessName
                });
                console.log('✅ Registration event tracked in Klaviyo');
            } else if (klaviyoProfileId === 'duplicate_updated') {
                console.log('ℹ️ Skipping event tracking for duplicate contact update');
            }

        } catch (klaviyoError) {
            console.error('❌ Klaviyo error:', klaviyoError);
            return res.status(500).json({
                success: false,
                error: 'KLAVIYO_ERROR',
                message: 'Failed to add contact to Klaviyo. Please try again.'
            });
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
                    if (klaviyoProfileId && klaviyoProfileId !== 'duplicate_updated') {
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
                    if (klaviyoProfileId && klaviyoProfileId !== 'duplicate_updated') {
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
                
                if (klaviyoProfileId && klaviyoProfileId !== 'duplicate_updated') {
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
            if (klaviyoProfileId && klaviyoProfileId !== 'duplicate_updated') {
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