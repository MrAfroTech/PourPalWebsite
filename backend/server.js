// server.js - Debug version for email troubleshooting
require('dotenv').config();

// Print environment variables for debugging
console.log('==================== ENVIRONMENT CHECK ====================');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Present' : '✗ Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Present' : '✗ Missing');
console.log('AWS_REGION:', process.env.AWS_REGION || 'default: us-east-2');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'default: team@ezdrink.us');
console.log('===========================================================');

const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// AWS SES Setup
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-2'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  console.log('[HEALTH CHECK] Endpoint accessed');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// GET endpoint for testing
app.get('/api/send-email', (req, res) => {
  console.log('[GET /api/send-email] Endpoint accessed');
  res.status(200).json({
    success: true,
    message: 'Send Report endpoint is live. Use POST to send an email.'
  });
});

// POST endpoint for sending emails
// In your server.js file, replace the regular sendEmail with sendTemplatedEmail
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('[DEBUG] Request body keys:', Object.keys(req.body));
    
    const { userData, cashFinderData, deliveryMethod } = req.body;

    // Validate input
    if (!userData || !userData.email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required user email'
      });
    }
    
    // Prepare template data with fallbacks for all variables
    const templateData = {
      name: userData.name || 'Bar Owner',
      email: userData.email,
      company: userData.company || 'Your Bar',
      base_url: 'https://ezdrink.us',
      unsubscribe_url: `https://ezdrink.us/unsubscribe?email=${userData.email}`,
      privacy_url: 'https://ezdrink.us/privacy'
    };
    
    // Add report data if available
    if (cashFinderData) {
      templateData.peakHourLoss = cashFinderData.peakHourLoss || '';
      templateData.inventoryWaste = cashFinderData.inventoryWaste || '';
      templateData.totalOpportunity = cashFinderData.totalOpportunity || '';
    }
    
    // Build parameters for SES sendTemplatedEmail
    const params = {
      Source: process.env.EMAIL_FROM || 'team@ezdrink.us',
      Destination: {
        ToAddresses: [userData.email]
      },
      Template: 'CashFinderReport',
      TemplateData: JSON.stringify(templateData)
    };
    
    console.log('[DEBUG] Using template data:', JSON.stringify(templateData, null, 2));
    
    // Send the templated email
    const result = await ses.sendTemplatedEmail(params).promise();
    
    return res.status(200).json({
      success: true,
      message: 'Cash Finder Report sent via email',
      messageId: result.MessageId,
      actualMethod: 'email'
    });
  } catch (error) {
    console.error('[SEND REPORT ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send Cash Finder Report',
      error: error.message
    });
  }
});

// SMS endpoint stub
app.post('/api/send-sms', (req, res) => {
  console.log('[POST /api/send-sms] Request received - SMS not implemented yet');
  return res.status(200).json({
    success: true,
    message: 'SMS delivery will be available soon',
    actualMethod: 'email'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n[SERVER] Listening on port ${PORT} at ${new Date().toISOString()}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('[SERVER] Ready to receive requests\n');
});

// Add this to your server.js
app.get('/api/test-template-email', async (req, res) => {
  try {
    // Hardcoded test with verified email
    const params = {
      Source: process.env.EMAIL_FROM || 'team@ezdrink.us',
      Destination: {
        ToAddresses: ['maurice@mauricethefirst.com'] // Use an email you've verified in SES
      },
      Template: 'CashFinderReport',
      TemplateData: JSON.stringify({
        name: 'Test User',
        email: 'maurice@mauricethefirst.com',
        company: 'Test Bar',
        base_url: 'https://ezdrink.us',
        unsubscribe_url: 'https://ezdrink.us/unsubscribe?email=test@example.com',
        privacy_url: 'https://ezdrink.us/privacy'
      })
    };
    
    console.log('[TEST] Sending test template email with params:', JSON.stringify(params, null, 2));
    
    const result = await ses.sendTemplatedEmail(params).promise();
    
    return res.status(200).json({
      success: true,
      message: 'Test template email sent!',
      messageId: result.MessageId
    });
  } catch (error) {
    console.error('[TEST ERROR] Full error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      time: error.time
    });
  }
});

module.exports = app;