// Check Klaviyo configuration
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

    try {
        console.log('🔍 Checking Klaviyo configuration...');
        console.log('API Key exists:', !!KLAVIYO_API_KEY);
        console.log('List ID exists:', !!KLAVIYO_LIST_ID);

        if (!KLAVIYO_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'KLAVIYO_PRIVATE_API_KEY not configured'
            });
        }

        // Test 1: Get all lists
        console.log('📋 Fetching Klaviyo lists...');
        const listsResponse = await fetch('https://a.klaviyo.com/api/lists/', {
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            }
        });

        if (!listsResponse.ok) {
            throw new Error(`Klaviyo lists API error: ${listsResponse.status} ${listsResponse.statusText}`);
        }

        const listsData = await listsResponse.json();
        console.log('✅ Lists fetched successfully');

        // Test 2: Get profiles (contacts)
        console.log('👥 Fetching Klaviyo profiles...');
        const profilesResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'Accept': 'application/json',
                'Revision': '2023-12-15'
            }
        });

        if (!profilesResponse.ok) {
            throw new Error(`Klaviyo profiles API error: ${profilesResponse.status} ${profilesResponse.statusText}`);
        }

        const profilesData = await profilesResponse.json();
        console.log('✅ Profiles fetched successfully');

        return res.json({
            success: true,
            message: 'Klaviyo connection successful',
            configuration: {
                apiKeyConfigured: !!KLAVIYO_API_KEY,
                listIdConfigured: !!KLAVIYO_LIST_ID,
                listId: KLAVIYO_LIST_ID
            },
            lists: {
                count: listsData.data?.length || 0,
                lists: listsData.data?.map(list => ({
                    id: list.id,
                    name: list.attributes?.name,
                    type: list.attributes?.type
                })) || []
            },
            profiles: {
                count: profilesData.data?.length || 0,
                profiles: profilesData.data?.map(profile => ({
                    id: profile.id,
                    email: profile.attributes?.email,
                    firstName: profile.attributes?.first_name,
                    lastName: profile.attributes?.last_name
                })) || []
            }
        });

    } catch (error) {
        console.error('❌ Klaviyo check failed:', error);
        return res.status(500).json({
            success: false,
            error: 'Klaviyo connection failed',
            details: error.message
        });
    }
} 