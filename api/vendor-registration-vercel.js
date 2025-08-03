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
        return result.data.id; // Return profile ID
    } catch (error) {
        console.error('❌ Error adding contact to Klaviyo:', error);
        console.error('❌ Error details:', error.message);
        throw error;
    }
}

// Helper function to add profile to Klaviyo list
async function addProfileToList(profileId, listId) {
    try {
        console.log('📧 === KLACIYO LIST SUBSCRIPTION START ===');
        console.log('📧 Profile ID to add:', profileId);
        console.log('📧 List ID to add to:', listId);
        console.log('📧 List subscription endpoint:', `https://a.klaviyo.com/api/lists/${listId}/profile-subscription-bulk-create-jobs/`);
        
        const listPayload = {
            data: {
                type: 'profile-subscription-bulk-create-job',
                attributes: {
                    profiles: {
                        data: [
                            {
                                type: 'profile',
                                id: profileId
                            }
                        ]
                    }
                }
            }
        };

        console.log('📧 List subscription payload:', JSON.stringify(listPayload, null, 2));

        const response = await fetch(`https://a.klaviyo.com/api/lists/${listId}/profile-subscription-bulk-create-jobs/`, {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            },
            body: JSON.stringify(listPayload)
        });

        console.log('📧 List subscription response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('📧 List subscription error response:', errorText);
            throw new Error(`Klaviyo list API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Profile added to list:', result);
        return result;
    } catch (error) {
        console.error('❌ Error adding profile to list:', error);
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
            console.log('📧 Starting Klaviyo integration...');
            console.log('📧 Environment variables check:');
            console.log('  - KLAVIYO_API_KEY:', !!process.env.KLAVIYO_PRIVATE_API_KEY);
            console.log('  - KLAVIYO_LIST_ID:', !!process.env.KLAVIYO_LIST_ID);
            console.log('  - KLAVIYO_API_KEY value:', process.env.KLAVIYO_PRIVATE_API_KEY ? 'SET' : 'NOT SET');
            console.log('  - KLAVIYO_LIST_ID value:', process.env.KLAVIYO_LIST_ID || 'NOT SET');
            console.log('  - KLAVIYO_LIST_ID fallback:', KLAVIYO_LIST_ID);
            console.log('📧 All environment variables:', Object.keys(process.env).filter(key => key.includes('KLAVIYO')));
            
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

            // Add profile to the specific list
            try {
                await addProfileToList(klaviyoProfileId, KLAVIYO_LIST_ID);
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
            // Continue with registration even if Klaviyo fails
            klaviyoProfileId = undefined;
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