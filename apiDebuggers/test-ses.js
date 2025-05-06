// api/test-ses.js
// Simple test endpoint to diagnose SES issues
const AWS = require('aws-sdk');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  console.log('SES Test API endpoint called');

  // For clearer diagnostics, log ALL environment variables
  console.log('All environment variables:');
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('AWS_')) {
      if (key === 'AWS_SECRET_ACCESS_KEY') {
        console.log(`${key}: [REDACTED]`);
      } else {
        console.log(`${key}: ${process.env[key]}`);
      }
    }
  });

  try {
    // First check - are we using temporary credentials by mistake?
    if (process.env.AWS_SESSION_TOKEN) {
      return res.status(400).json({
        success: false,
        message: 'Error: AWS_SESSION_TOKEN is set. For permanent credentials, this should NOT be set.'
      });
    }

    // Verify AWS access key format
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
      return res.status(400).json({
        success: false,
        message: 'Error: AWS_ACCESS_KEY_ID is missing or invalid. It should start with "AKIA" for permanent credentials.'
      });
    }

    // Create SES client with explicit credentials
    const ses = new AWS.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION || 'us-east-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    console.log('Attempting to list verified email addresses...');
    
    // Simple SES operation to test credentials
    const verifiedEmails = await ses.listVerifiedEmailAddresses().promise();
    
    console.log('Success! Verified emails:', verifiedEmails.VerifiedEmailAddresses);
    
    return res.status(200).json({
      success: true,
      message: 'SES credentials are working correctly',
      verifiedEmails: verifiedEmails.VerifiedEmailAddresses
    });
  } catch (error) {
    console.error('Error testing SES:', error);
    
    // Provide specific guidance based on error
    let troubleshooting = 'General troubleshooting:';
    
    if (error.code === 'InvalidClientTokenId') {
      troubleshooting = `
      1. Double-check that you've copied the EXACT access key ID from AWS
      2. Make sure the access key is active (not deleted or disabled)
      3. Verify you're using the correct AWS region (${process.env.AWS_REGION || 'us-east-2'})
      4. Check that the IAM user has SES permissions
      `;
    } else if (error.code === 'SignatureDoesNotMatch') {
      troubleshooting = `
      1. Your Access Key ID appears valid, but the Secret Access Key is incorrect
      2. Generate a new access key pair in AWS IAM and update both values
      `;
    } else if (error.code === 'AccessDenied') {
      troubleshooting = `
      1. Your credentials are valid, but the IAM user lacks SES permissions
      2. Add the AmazonSESFullAccess policy to your IAM user
      `;
    }
    
    return res.status(500).json({
      success: false,
      message: 'SES credentials test failed',
      error: error.message,
      code: error.code,
      troubleshooting
    });
  }
};