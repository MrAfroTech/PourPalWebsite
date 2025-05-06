// standalone-aws-debug.js
// Run this directly with: node standalone-aws-debug.js
const AWS = require('aws-sdk');
require('dotenv').config(); // Load .env file if present

// Debug Environment Variables
console.log('\n=== AWS ENVIRONMENT VARIABLES ===');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 
  `Present (starts with ${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}... ends with ...${process.env.AWS_ACCESS_KEY_ID.substring(process.env.AWS_ACCESS_KEY_ID.length - 4)})` : 
  'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 
  'Present (redacted for security)' : 
  'Not set');
console.log('AWS_SESSION_TOKEN:', process.env.AWS_SESSION_TOKEN ? 
  `Present (length: ${process.env.AWS_SESSION_TOKEN.length})` : 
  'Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

// Load .env file directly for comparison
let dotenvVars = {};
let envFileExists = false;
try {
  const fs = require('fs');
  const path = require('path');
  
  // Try multiple possible .env locations
  const possibleEnvPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'api', '.env'),
    path.join(process.cwd(), '..', '.env'),
  ];
  
  let envPath = null;
  for (const potentialPath of possibleEnvPaths) {
    if (fs.existsSync(potentialPath)) {
      envPath = potentialPath;
      envFileExists = true;
      break;
    }
  }
  
  if (envPath) {
    console.log(`\n=== .ENV FILE FOUND ===`);
    console.log(`Path: ${envPath}`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('='); // Handle values that contain = characters
        if (key && value) {
          dotenvVars[key.trim()] = value.trim();
        }
      }
    });
    
    console.log('\n=== .ENV COMPARISON WITH ENVIRONMENT ===');
    console.log('AWS_ACCESS_KEY_ID:', dotenvVars.AWS_ACCESS_KEY_ID ? 
      (dotenvVars.AWS_ACCESS_KEY_ID === process.env.AWS_ACCESS_KEY_ID ? 'Matches environment' : 'Different from environment') : 
      'Not in .env file');
    console.log('AWS_SECRET_ACCESS_KEY:', dotenvVars.AWS_SECRET_ACCESS_KEY ? 
      (dotenvVars.AWS_SECRET_ACCESS_KEY === process.env.AWS_SECRET_ACCESS_KEY ? 'Matches environment' : 'Different from environment') : 
      'Not in .env file');
    console.log('AWS_SESSION_TOKEN:', dotenvVars.AWS_SESSION_TOKEN ? 
      (dotenvVars.AWS_SESSION_TOKEN === process.env.AWS_SESSION_TOKEN ? 'Matches environment' : 'Different from environment') : 
      'Not in .env file');
    console.log('AWS_REGION:', dotenvVars.AWS_REGION ? 
      (dotenvVars.AWS_REGION === process.env.AWS_REGION ? 'Matches environment' : 'Different from environment') : 
      'Not in .env file');
  } else {
    console.log('\n=== NO .ENV FILE FOUND IN COMMON LOCATIONS ===');
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Test AWS configurations asynchronously
async function runTests() {
  console.log('\n=== TESTING AWS CONFIGURATIONS ===');
  
  // 1. Test with environment variables
  console.log('\n1. Testing with ENVIRONMENT VARIABLES:');
  await testConfig({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  // 2. Test with AWS SDK default chain
  console.log('\n2. Testing with AWS SDK DEFAULT CREDENTIAL CHAIN:');
  await testConfig(null);

  // 3. Test with .env variables if different
  if (envFileExists && 
      (dotenvVars.AWS_ACCESS_KEY_ID !== process.env.AWS_ACCESS_KEY_ID || 
       dotenvVars.AWS_SECRET_ACCESS_KEY !== process.env.AWS_SECRET_ACCESS_KEY ||
       dotenvVars.AWS_SESSION_TOKEN !== process.env.AWS_SESSION_TOKEN)) {
    console.log('\n3. Testing with .ENV FILE VALUES:');
    await testConfig({
      accessKeyId: dotenvVars.AWS_ACCESS_KEY_ID,
      secretAccessKey: dotenvVars.AWS_SECRET_ACCESS_KEY,
      sessionToken: dotenvVars.AWS_SESSION_TOKEN,
      region: dotenvVars.AWS_REGION || process.env.AWS_REGION || 'us-east-1'
    });
  }

  // 4. Test without session token (if one exists)
  if (process.env.AWS_SESSION_TOKEN) {
    console.log('\n4. Testing WITHOUT SESSION TOKEN:');
    await testConfig({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // No session token
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }
  
  // 5. Try to get credentials from the AWS CLI
  try {
    console.log('\n5. Trying to use AWS CLI CREDENTIALS:');
    const { execSync } = require('child_process');
    try {
      // Create temporary AWS SDK credentials using the CLI's SharedIniFileCredentials
      const credentials = new AWS.SharedIniFileCredentials();
      console.log('SharedIniFileCredentials loaded:');
      console.log('  Access Key ID:', credentials.accessKeyId ? 
        `Present (starts with ${credentials.accessKeyId.substring(0, 4)}...)` : 'Not present');
      console.log('  Secret Access Key:', credentials.secretAccessKey ? 'Present (redacted)' : 'Not present');
      console.log('  Session Token:', credentials.sessionToken ? 'Present' : 'Not present');
      
      // Test STS with these credentials
      const stsConfig = new AWS.Config({
        credentials: credentials
      });
      const sts = new AWS.STS(stsConfig);
      
      try {
        const identity = await sts.getCallerIdentity().promise();
        console.log('✅ SUCCESS! AWS CLI credentials are valid.');
        console.log('  Account:', identity.Account);
        console.log('  ARN:', identity.Arn);
        console.log('  UserID:', identity.UserId);
        
        // Test SES with these credentials
        try {
          const ses = new AWS.SES({ 
            credentials: credentials,
            region: process.env.AWS_REGION || 'us-east-1',
            apiVersion: '2010-12-01' 
          });
          const verifiedEmails = await ses.listVerifiedEmailAddresses().promise();
          console.log('  ✅ SES Test: Success');
          console.log('  Verified Emails:', verifiedEmails.VerifiedEmailAddresses);
        } catch (sesError) {
          console.log('  ❌ SES Test Failed:', sesError.message);
        }
        
        console.log('\nRECOMMENDATION: Use AWS.SharedIniFileCredentials() instead of explicit credentials.');
        console.log('Add the following to your code:');
        console.log('  const credentials = new AWS.SharedIniFileCredentials();');
        console.log('  AWS.config.credentials = credentials;');
      } catch (stsError) {
        console.log('❌ Failed to validate AWS CLI credentials:', stsError.message);
      }
    } catch (cliError) {
      console.log('❌ Could not load AWS CLI credentials:', cliError.message);
    }
  } catch (execError) {
    console.log('❌ AWS CLI may not be installed or configured:', execError.message);
  }
  
  console.log('\n=== DIAGNOSIS AND RECOMMENDATION ===');
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.startsWith('YOUR')) {
    console.log('⚠️ Your AWS_ACCESS_KEY_ID appears to be a placeholder ("YOUR_KEY").');
    console.log('   Replace it with your actual AWS access key.');
  }
  
  if (!process.env.AWS_SESSION_TOKEN && 
      ((process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.startsWith('ASIA')) || 
       (dotenvVars.AWS_ACCESS_KEY_ID && dotenvVars.AWS_ACCESS_KEY_ID.startsWith('ASIA')))) {
    console.log('⚠️ Your access key starts with "ASIA" which indicates temporary credentials,');
    console.log('   but you don\'t have AWS_SESSION_TOKEN set. Temporary credentials require a session token.');
    console.log('   Run "aws sts get-session-token" or "aws sso login" to get new temporary credentials.');
  }
  
  console.log('\nREFERENCE: Access key prefixes:');
  console.log('- AKIA... = Permanent IAM user access key (no session token needed)');
  console.log('- ASIA... = Temporary credentials (REQUIRES session token)');
}

// Helper function to test a specific AWS config
async function testConfig(config) {
  try {
    // Create AWS config
    let awsConfig = null;
    if (config) {
      console.log('Configuration being tested:');
      console.log('  Access Key ID:', config.accessKeyId ? 
        `Present (starts with ${config.accessKeyId.substring(0, 4)}...)` : 'Not present');
      console.log('  Secret Access Key:', config.secretAccessKey ? 'Present (redacted)' : 'Not present');
      console.log('  Session Token:', config.sessionToken ? 'Present' : 'Not present');
      console.log('  Region:', config.region);
      
      awsConfig = new AWS.Config(config);
    } else {
      console.log('Using default AWS credential chain');
      awsConfig = new AWS.Config();
    }
    
    // Test STS
    const sts = new AWS.STS(awsConfig);
    try {
      const identity = await sts.getCallerIdentity().promise();
      console.log('✅ AWS STS Test: Success');
      console.log('  Account:', identity.Account);
      console.log('  ARN:', identity.Arn);
      console.log('  UserID:', identity.UserId);
      
      // If STS succeeds, also test SES
      try {
        const ses = new AWS.SES({ 
          ...awsConfig,
          apiVersion: '2010-12-01' 
        });
        const verifiedEmails = await ses.listVerifiedEmailAddresses().promise();
        console.log('✅ AWS SES Test: Success');
        console.log('  Verified Emails:', verifiedEmails.VerifiedEmailAddresses);
      } catch (sesError) {
        console.log('❌ AWS SES Test Failed:', sesError.message);
      }
    } catch (stsError) {
      console.log('❌ AWS STS Test Failed:', stsError.message);
      console.log('  Error Code:', stsError.code);
      
      if (stsError.message.includes('security token included in the request is invalid')) {
        if (config && config.sessionToken) {
          console.log('  POSSIBLE CAUSE: Expired or invalid session token.');
          console.log('  SOLUTION: Refresh your temporary credentials.');
        } else {
          console.log('  POSSIBLE CAUSE: Using temporary credentials without a session token.');
          console.log('  SOLUTION: Include AWS_SESSION_TOKEN in your environment or configuration.');
        }
      } else if (stsError.message.includes('not authorized')) {
        console.log('  POSSIBLE CAUSE: Valid credentials but insufficient permissions.');
        console.log('  SOLUTION: Check IAM policies for the user/role.');
      }
    }
  } catch (configError) {
    console.log('❌ Configuration Error:', configError.message);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error during tests:', error);
});
