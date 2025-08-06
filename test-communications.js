const axios = require('axios');

// Test the communications functionality
async function testCommunications() {
    try {
        console.log('🧪 Testing Klaviyo communications...');
        
        // Test data
        const testData = {
            profileId: '01HXXXXXXX', // Replace with actual profile ID from a registration
            vendorName: 'Test Vendor',
            businessName: 'Test Bar',
            selectedPlan: 'free',
            phone: '5551234567', // Replace with real phone number for SMS testing
            email: 'test@example.com' // Replace with real email for testing
        };

        console.log('📤 Sending test request...');
        console.log('📋 Test data:', testData);

        const response = await axios.post('http://localhost:3001/api/test-klaviyo-communications', testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Test completed successfully!');
        console.log('📥 Response:', response.data);

        if (response.data.results.email.success) {
            console.log('📧 Email sent successfully');
        } else {
            console.log('❌ Email failed:', response.data.results.email.error);
        }

        if (response.data.results.sms.success) {
            console.log('📱 SMS sent successfully');
        } else {
            console.log('❌ SMS failed:', response.data.results.sms.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCommunications(); 