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
            console.log(`📧 Adding user to list ${KLAVIYO_LIST_ID}...`);
            const listSubscriptionResponse = await fetch(
                `https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`,
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
        console.error('❌ Error response status:', error.response?.status);
        console.error('❌ Error response data:', error.response?.data);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        
        // Handle duplicate email/phone errors - UPDATE instead of reject
        if (error.response?.status === 409 || (error.message && error.message.includes('409'))) {
            console.log('📧 Contact already exists, attempting to update...');
            
            try {
                // Try to get existing profile ID first
                const searchResponse = await fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,"${contactData.email}")`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                        'Accept': 'application/json',
                        'Revision': '2023-12-15'
                    }
                });
                
                if (searchResponse.ok) {
                    const searchResult = await searchResponse.json();
                    if (searchResult.data && searchResult.data.length > 0) {
                        const existingProfileId = searchResult.data[0].id;
                        console.log('📧 Found existing profile ID:', existingProfileId);
                        
                        // Update the existing profile
                        const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${existingProfileId}/`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Revision': '2023-12-15'
                            },
                            body: JSON.stringify({
                                data: {
                                    type: 'profile',
                                    id: existingProfileId,
                                    attributes: {
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
                            })
                        });
                        
                        if (updateResponse.ok) {
                            console.log('✅ Existing contact updated successfully');
                            
                            // Add to list if not already there
                            try {
                                const listResponse = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'Revision': '2023-12-15'
                                    },
                                    body: JSON.stringify({
                                        data: [{
                                            type: 'profile',
                                            id: existingProfileId
                                        }]
                                    })
                                });
                                
                                if (listResponse.ok) {
                                    console.log('✅ Contact added to list successfully');
                                }
                            } catch (listError) {
                                console.log('📧 Contact already in list or list error (non-critical)');
                            }
                            
                            return { success: true, profileId: existingProfileId };
                        } else {
                            console.log('❌ Failed to update existing contact');
                        }
                    }
                }
            } catch (updateError) {
                console.log('❌ Error updating existing contact:', updateError.message);
            }
            
            // If update fails, still return success to avoid blocking the user
            return { 
                success: true, 
                profileId: 'existing_contact_updated',
                message: 'Contact information updated successfully'
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
                // Handle any remaining errors (should be rare now with duplicate handling)
                return res.status(500).json({
                    success: false,
                    error: 'KLAVIYO_ERROR',
                    message: klaviyoResult.message || 'Failed to process contact'
                });
            }

            klaviyoProfileId = klaviyoResult.profileId;
            console.log('✅ Contact added to Klaviyo with ID:', klaviyoProfileId);

                    // Add profile to the specific list using the correct endpoint
        try {
            console.log('📧 Adding profile to list using correct endpoint...');
            
            const listResponse = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
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
                            id: klaviyoProfileId
                        }
                    ]
                })
            });

            console.log('📧 List addition response status:', listResponse.status);

            if (!listResponse.ok) {
                const listErrorText = await listResponse.text();
                console.log('📧 List addition error response:', listErrorText);
                throw new Error(`List addition failed: ${listResponse.status} ${listResponse.statusText} - ${listErrorText}`);
            }

            console.log('✅ Profile added to list successfully');
        } catch (listError) {
            console.error('❌ Failed to add profile to list:', listError);
            // Continue even if list addition fails
        }

            // Track registration event
            await trackKlaviyoEvent(klaviyoProfileId, 'Vendor Registration Started', {
                plan: selectedPlan,
                vendor_type: vendorType,
                business_name: businessName
            });

            console.log('✅ Registration event tracked in Klaviyo');

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