// api/debug-creds.js
// Minimal script to examine exactly what credentials AWS SDK is finding
const AWS = require('aws-sdk');

module.exports = async (req, res) => {
  console.log('Debug credentials API called');

  try {
    // Create config object directly from environment variables
    const config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-2'
    };

    // Log safe version of our config (no secrets)
    console.log('Explicit config:', {
      accessKeyId: config.accessKeyId ? `${config.accessKeyId.substring(0, 4)}...` : 'not set',
      hasSecretKey: !!config.secretAccessKey,
      region: config.region
    });

    // Check if AWS.config already has credentials (from environment)
    console.log('Default AWS.config state:');
    console.log('- Has credentials:', !!AWS.config.credentials);
    console.log('- Credential type:', AWS.config.credentials ? AWS.config.credentials.constructor.name : 'none');
    console.log('- Credential accessKeyId:', AWS.config.credentials ? 
      (AWS.config.credentials.accessKeyId ? `${AWS.config.credentials.accessKeyId.substring(0, 4)}...` : 'not set') : 
      'none');
    console.log('- Has sessionToken:', AWS.config.credentials ? 
      (!!AWS.config.credentials.sessionToken) : 
      'none');

    // Now try getting credentials from the provider chain
    console.log('Checking credential provider chain...');
    // This will force AWS SDK to go through its credential resolution process
    const credentialProvider = new AWS.CredentialProviderChain();
    
    try {
      const resolvedCredentials = await credentialProvider.resolvePromise();
      console.log('Chain resolved credentials:');
      console.log('- Type:', resolvedCredentials.constructor.name);
      console.log('- Access Key ID:', resolvedCredentials.accessKeyId ? 
        `${resolvedCredentials.accessKeyId.substring(0, 4)}...` : 'not set');
      console.log('- Has session token:', !!resolvedCredentials.sessionToken);
    } catch (chainError) {
      console.log('Chain credential resolution error:', chainError);
    }

    // Try forcing environment credentials
    console.log('Trying to force environment credentials...');
    process.env.AWS_SDK_LOAD_CONFIG = '0'; // Disable loading config file
    const envCreds = new AWS.EnvironmentCredentials('AWS');
    console.log('Environment credentials:');
    console.log('- Access Key ID:', envCreds.accessKeyId ? 
      `${envCreds.accessKeyId.substring(0, 4)}...` : 'not set');
    console.log('- Has secret key:', !!envCreds.secretAccessKey);
    console.log('- Has session token:', !!envCreds.sessionToken);

    // Test with explicit credentials
    console.log('Testing with explicit credentials...');
    const ses = new AWS.SES({
      apiVersion: '2010-12-01',
      ...config // Use our explicit config
    });

    // Actually use SES to test the connection
    console.log('Attempting SES operation...');
    try {
      const result = await ses.listVerifiedEmailAddresses().promise();
      console.log('SES operation successful:', result.VerifiedEmailAddresses);
      
      return res.status(200).json({
        success: true,
        message: 'Credentials worked with explicit configuration',
        verifiedEmails: result.VerifiedEmailAddresses
      });
    } catch (sesError) {
      console.error('SES operation failed:', sesError.code, sesError.message);
      
      return res.status(500).json({
        success: false,
        message: 'Explicit credentials failed for SES operation',
        error: sesError.message,
        code: sesError.code,
        debugInfo: {
          configAccessKeyIdPrefix: config.accessKeyId ? config.accessKeyId.substring(0, 4) : 'none',
          hasConfigSecretKey: !!config.secretAccessKey,
          configRegion: config.region
        }
      });
    }
  } catch (error) {
    console.error('Credential debug error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Credential debugging failed',
      error: error.message
    });
  }
};