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

        if (!response.ok) {
            throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Contact added to Klaviyo:', result);
        return result.data.id; // Return profile ID
    } catch (error) {
        console.error('Error adding contact to Klaviyo:', error);
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

        // For now, just return success for free plan
        if (selectedPlan === 'free') {
            console.log('✅ Free plan registration successful');
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