// Klaviyo configuration
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID || 'TJr6rx'; // Fallback to the specific list ID

// Debug environment variables at module level
console.log('🔧 === MODULE LEVEL ENVIRONMENT CHECK ===');
console.log('🔧 KLAVIYO_API_KEY exists:', !!process.env.KLAVIYO_PRIVATE_API_KEY);
console.log('🔧 KLAVIYO_API_KEY value:', process.env.KLAVIYO_PRIVATE_API_KEY ? 'SET' : 'NOT SET');
console.log('🔧 KLAVIYO_LIST_ID exists:', !!process.env.KLAVIYO_LIST_ID);
console.log('🔧 KLAVIYO_LIST_ID value:', process.env.KLAVIYO_LIST_ID || 'NOT SET');
console.log('🔧 All env vars with KLAVIYO:', Object.keys(process.env).filter(key => key.includes('KLAVIYO')));
console.log('🔧 === END MODULE LEVEL CHECK ===');

// Helper function to send immediate welcome email via Klaviyo
async function sendWelcomeEmail(profileId, contactData) {
    try {
        console.log('📧 Sending welcome email via Klaviyo...');
        
        const emailData = {
            data: {
                type: 'email',
                attributes: {
                    profile: {
                        $id: profileId
                    },
                    subject: `Welcome to EzDrink, ${contactData.vendorName}!`,
                    template_id: process.env.KLAVIYO_WELCOME_EMAIL_TEMPLATE_ID || 'welcome_vendor_email',
                    context: {
                        vendor_name: contactData.vendorName,
                        business_name: contactData.businessName,
                        plan: contactData.selectedPlan,
                        setup_url: `${process.env.FRONTEND_URL || 'https://ezdrink.us'}/setup/${profileId}`
                    }
                }
            }
        };

        const response = await fetch('https://a.klaviyo.com/api/emails/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Klaviyo email API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Welcome email sent via Klaviyo:', result);
        return { success: true, messageId: result.data.id };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to send immediate welcome SMS via Klaviyo
async function sendWelcomeSMS(profileId, contactData) {
    try {
        console.log('📱 Sending welcome SMS via Klaviyo...');
        
        // Format phone number for SMS
        let formattedPhone = contactData.phone;
        if (formattedPhone && !formattedPhone.startsWith('+')) {
            if (formattedPhone.replace(/\D/g, '').length === 10) {
                formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
            } else if (formattedPhone.replace(/\D/g, '').length === 11 && formattedPhone.replace(/\D/g, '').startsWith('1')) {
                formattedPhone = '+' + formattedPhone.replace(/\D/g, '');
            }
        }
        
        if (!formattedPhone || formattedPhone.length < 10) {
            console.log('📱 Invalid phone number for SMS, skipping');
            return { success: false, error: 'Invalid phone number' };
        }

        const smsData = {
            data: {
                type: 'sms',
                attributes: {
                    profile: {
                        $id: profileId
                    },
                    message: `Welcome to EzDrink, ${contactData.vendorName}! Your ${contactData.selectedPlan} plan is now active. We'll be in touch within 24 hours to complete your setup. Reply STOP to unsubscribe.`,
                    template_id: process.env.KLAVIYO_WELCOME_SMS_TEMPLATE_ID || 'welcome_vendor_sms'
                }
            }
        };

        const response = await fetch('https://a.klaviyo.com/api/sms/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            },
            body: JSON.stringify(smsData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Klaviyo SMS API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Welcome SMS sent via Klaviyo:', result);
        return { success: true, messageId: result.data.id };
    } catch (error) {
        console.error('❌ Error sending welcome SMS:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to add contact to Klaviyo
async function addContactToKlaviyo(contactData) {
    try {
        console.log('📧 === KLACIYO CONTACT CREATION START ===');
        console.log('📧 Klaviyo API Key available:', !!KLAVIYO_API_KEY);
        console.log('📧 Klaviyo API Key length:', KLAVIYO_API_KEY ? KLAVIYO_API_KEY.length : 0);
        console.log('📧 Klaviyo List ID available:', !!KLAVIYO_LIST_ID);
        console.log('📧 Klaviyo List ID value:', KLAVIYO_LIST_ID);
        console.log('📧 Contact data for Klaviyo:', contactData);
        console.log('📧 API endpoint being called: https://a.klaviyo.com/api/profiles/');
        
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

        console.log('📧 Klaviyo request payload:', JSON.stringify(klaviyoData, null, 2));

        console.log('📧 Making API call with key:', KLAVIYO_API_KEY ? `${KLAVIYO_API_KEY.substring(0, 10)}...` : 'NOT SET');
        
        const response = await fetch('https://a.klaviyo.com/api/profiles/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            },
            body: JSON.stringify(klaviyoData)
        });

        console.log('📧 Klaviyo response status:', response.status);
        console.log('📧 Klaviyo response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('📧 Klaviyo error response:', errorText);
            throw new Error(`Klaviyo API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Contact added to Klaviyo:', result);
        console.log('✅ Klaviyo Profile ID:', result.data.id);
        const profileId = result.data.id;
        
        // Add user to the list
        try {
            console.log('📧 Adding user to list TJr6rx...');
            const listSubscriptionResponse = await fetch(
                `https://a.klaviyo.com/api/lists/TJr6rx/relationships/profiles/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Revision': '2023-12-15'
                    },
                    body: JSON.stringify({
                        data: [
                            {
                                type: 'profile',
                                id: profileId
                            }
                        ]
                    })
                }
            );
            
            if (listSubscriptionResponse.ok) {
                const listResult = await listSubscriptionResponse.json();
                console.log('✅ User added to list:', listResult);
            } else {
                const listError = await listSubscriptionResponse.text();
                console.error('❌ Error adding user to list:', listError);
            }
        } catch (listError) {
            console.error('❌ Error adding user to list:', listError);
            // Don't throw error here - profile was created successfully
        }
        
        return { success: true, profileId }; // Return success with profile ID
    } catch (error) {
        console.error('❌ Error adding contact to Klaviyo:', error);
        console.error('❌ Error details:', error.message);
        
        // Handle duplicate email/phone errors
        if (error.message && error.message.includes('409')) {
            return { 
                success: false, 
                error: 'DUPLICATE_CONTACT',
                message: 'This contact already exists. Please use a different email or phone number.' 
            };
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

        const response = await fetch('https://a.klaviyo.com/api/events/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            },
            body: JSON.stringify(eventPayload)
        });

        if (!response.ok) {
            throw new Error(`Klaviyo event API error: ${response.status} ${response.statusText}`);
        }

        console.log(`Event tracked in Klaviyo: ${eventName}`);
    } catch (error) {
        console.error('Error tracking Klaviyo event:', error);
        // Don't throw error for event tracking failures
    }
}

// Vercel serverless function handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        // Add contact to Klaviyo
        let klaviyoProfileId;
        let emailResult = { success: false };
        let smsResult = { success: false };
        
        try {
            console.log('📧 === KLACIYO INTEGRATION START ===');
            console.log('📧 Using API Key:', KLAVIYO_API_KEY ? `${KLAVIYO_API_KEY.substring(0, 10)}...` : 'NOT SET');
            console.log('📧 Using List ID:', KLAVIYO_LIST_ID);
            console.log('📧 Contact data:', { vendorName, businessName, vendorType, cuisineType, email, phone, posSystem, selectedPlan });
            console.log('📧 Environment variables check:');
            console.log('  - KLAVIYO_API_KEY:', !!process.env.KLAVIYO_PRIVATE_API_KEY);
            console.log('  - KLAVIYO_LIST_ID:', !!process.env.KLAVIYO_LIST_ID);
            console.log('  - KLAVIYO_API_KEY value:', process.env.KLAVIYO_PRIVATE_API_KEY ? 'SET' : 'NOT SET');
            console.log('  - KLAVIYO_LIST_ID value:', process.env.KLAVIYO_LIST_ID || 'NOT SET');
            console.log('  - KLAVIYO_LIST_ID fallback:', KLAVIYO_LIST_ID);
            console.log('  - KLAVIYO_LIST_ID fallback:', KLAVIYO_LIST_ID);
            console.log('📧 All environment variables:', Object.keys(process.env).filter(key => key.includes('KLAVIYO')));
            
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
                if (klaviyoResult.error === 'DUPLICATE_CONTACT') {
                    return res.status(409).json({
                        success: false,
                        error: 'DUPLICATE_CONTACT',
                        message: klaviyoResult.message
                    });
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

            // Track registration event
            await trackKlaviyoEvent(klaviyoProfileId, 'Vendor Registration Started', {
                plan: selectedPlan,
                vendor_type: vendorType,
                business_name: businessName
            });

            console.log('✅ Registration event tracked in Klaviyo');

            // Send immediate welcome communications
            const contactData = {
                vendorName,
                businessName,
                vendorType,
                cuisineType,
                email,
                phone,
                posSystem,
                selectedPlan
            };

            // Send welcome email
            emailResult = await sendWelcomeEmail(klaviyoProfileId, contactData);
            if (emailResult.success) {
                console.log('✅ Welcome email sent successfully');
            } else {
                console.log('⚠️ Welcome email failed:', emailResult.error);
            }

            // Send welcome SMS if phone number is valid
            if (phone && phone.replace(/\D/g, '').length >= 10) {
                smsResult = await sendWelcomeSMS(klaviyoProfileId, contactData);
                if (smsResult.success) {
                    console.log('✅ Welcome SMS sent successfully');
                } else {
                    console.log('⚠️ Welcome SMS failed:', smsResult.error);
                }
            } else {
                console.log('📱 No valid phone number provided, skipping SMS');
            }

        } catch (klaviyoError) {
            console.error('❌ Klaviyo integration failed:', klaviyoError);
            console.error('❌ Klaviyo error message:', klaviyoError.message);
            console.error('❌ Klaviyo error stack:', klaviyoError.stack);
            // Continue with registration even if Klaviyo fails
            klaviyoProfileId = undefined;
            
            // Return error details in response for debugging
            return res.json({
                success: false,
                error: 'Klaviyo integration failed',
                klaviyoError: klaviyoError.message,
                data: {
                    vendorName,
                    businessName,
                    vendorType,
                    cuisineType,
                    email,
                    phone,
                    selectedPlan
                }
            });
        }

        // For now, just return success for free plan
        if (selectedPlan === 'free') {
            console.log('✅ Free plan registration successful');
            console.log('📧 Final Klaviyo Profile ID being returned:', klaviyoProfileId);
            console.log('📧 Response payload:', {
                success: true,
                message: 'Registration successful! Welcome to the free plan.',
                klaviyoProfileId,
                communications: {
                    email: emailResult.success,
                    sms: phone && phone.replace(/\D/g, '').length >= 10 ? smsResult.success : false
                },
                data: {
                    vendorName,
                    businessName,
                    vendorType,
                    cuisineType,
                    email,
                    phone,
                    selectedPlan
                }
            });
            return res.json({
                success: true,
                message: 'Registration successful! Welcome to the free plan.',
                klaviyoProfileId,
                communications: {
                    email: emailResult.success,
                    sms: phone && phone.replace(/\D/g, '').length >= 10 ? smsResult.success : false
                },
                klaviyoDebug: {
                    apiKeyUsed: KLAVIYO_API_KEY ? 'YES' : 'NO',
                    listIdUsed: KLAVIYO_LIST_ID,
                    profileId: klaviyoProfileId
                },
                data: {
                    vendorName,
                    businessName,
                    vendorType,
                    cuisineType,
                    email,
                    phone,
                    selectedPlan
                }
            });
        }

        // For paid plans, return error for now (payment processing not implemented yet)
        return res.status(400).json({
            success: false,
            error: 'Paid plans not implemented yet'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'Registration failed',
            details: error.message
        });
    }
} 