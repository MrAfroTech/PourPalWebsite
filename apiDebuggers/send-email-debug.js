// api/send-email-debug.js
// Create this as a new file to test while keeping your original endpoint
const AWS = require('aws-sdk');

module.exports = async (req, res) => {
  // Enable detailed logging
  console.log('====== API DEBUGGING START ======');
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    awsCredentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 
        `Present (starts with ${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...)` : 'Not set',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Present (redacted)' : 'Not set',
      sessionToken: process.env.AWS_SESSION_TOKEN ? 'Present' : 'Not set',
      region: process.env.AWS_REGION || 'not set'
    },
    requestInfo: {
      method: req.method,
      path: req.url,
      headers: req.headers
    }
  };
  
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-vercel-protection-bypass');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
  
  // Send simple test email to verify SES connection
  try {
    console.log('Starting SES connection test...');
    
    // Log the request body structure (no sensitive data)
    if (req.body) {
      console.log('Request body structure:', Object.keys(req.body));
      
      if (req.body.userData) {
        console.log('User data structure:', Object.keys(req.body.userData));
        console.log('Target email:', req.body.userData.email);
      }
    }
    
    // Try all 3 credential approaches one by one
    const testResults = {};
    
    // 1. Test with explicit environment variables
    console.log('\n1. Testing with environment variables...');
    try {
      // Configure AWS SES with explicit credentials
      const sesWithEnvVars = new AWS.SES({ 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
      
      // Test SES identity
      const identities = await sesWithEnvVars.listIdentities().promise();
      console.log('SES identities:', identities.Identities.slice(0, 5)); // Show first 5 only
      
      testResults.envVars = {
        success: true,
        identities: identities.Identities.length
      };
    } catch (envVarError) {
      console.error('Error using environment variables:', envVarError);
      testResults.envVars = {
        success: false,
        error: envVarError.message,
        code: envVarError.code
      };
    }
    
    // 2. Test with AWS.SharedIniFileCredentials
    console.log('\n2. Testing with AWS.SharedIniFileCredentials...');
    try {
      // Load credentials from shared credentials file
      const credentials = new AWS.SharedIniFileCredentials();
      console.log('SharedIniFileCredentials loaded successfully');
      
      // Configure AWS SES with SharedIniFileCredentials
      const sesWithSharedCreds = new AWS.SES({ 
        credentials: credentials,
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
      
      // Test SES identity
      const identities = await sesWithSharedCreds.listIdentities().promise();
      console.log('SES identities:', identities.Identities.slice(0, 5)); // Show first 5 only
      
      testResults.sharedCreds = {
        success: true,
        identities: identities.Identities.length
      };
    } catch (sharedCredsError) {
      console.error('Error using SharedIniFileCredentials:', sharedCredsError);
      testResults.sharedCreds = {
        success: false,
        error: sharedCredsError.message,
        code: sharedCredsError.code
      };
    }
    
    // 3. Test with default credential provider chain
    console.log('\n3. Testing with default credential provider chain...');
    try {
      // Configure AWS SES with default credentials
      const sesWithDefaultCreds = new AWS.SES({ 
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
      
      // Test SES identity
      const identities = await sesWithDefaultCreds.listIdentities().promise();
      console.log('SES identities:', identities.Identities.slice(0, 5)); // Show first 5 only
      
      testResults.defaultCreds = {
        success: true,
        identities: identities.Identities.length
      };
    } catch (defaultCredsError) {
      console.error('Error using default credential chain:', defaultCredsError);
      testResults.defaultCreds = {
        success: false,
        error: defaultCredsError.message,
        code: defaultCredsError.code
      };
    }
    
    // Determine which credential method worked
    const workingMethod = Object.entries(testResults)
      .find(([key, value]) => value.success === true);
    
    if (!workingMethod) {
      throw new Error('All credential methods failed. Check AWS configuration.');
    }
    
    console.log(`\nUsing working credential method: ${workingMethod[0]}`);
    
    // Configure SES with the working method
    let ses;
    if (workingMethod[0] === 'envVars') {
      ses = new AWS.SES({ 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
    } else if (workingMethod[0] === 'sharedCreds') {
      const credentials = new AWS.SharedIniFileCredentials();
      ses = new AWS.SES({ 
        credentials: credentials,
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
    } else {
      ses = new AWS.SES({ 
        region: process.env.AWS_REGION || 'us-east-1',
        apiVersion: '2010-12-01'
      });
    }
    
    // Check if we have a target email from the request
    let targetEmail = req.body?.userData?.email;
    if (!targetEmail) {
      // Use the source email as a fallback for testing
      console.log('No target email in request, using source email for test');
      const verifiedEmails = await ses.listVerifiedEmailAddresses().promise();
      if (verifiedEmails.VerifiedEmailAddresses.length > 0) {
        targetEmail = verifiedEmails.VerifiedEmailAddresses[0];
        console.log(`Using verified email for test: ${targetEmail}`);
      } else {
        console.error('No verified emails found and no target email in request');
        throw new Error('No valid email address available for testing');
      }
    }
    
    // Verify sender email is verified
    const sourceEmail = process.env.EMAIL_FROM || 'team@ezdrink.us';
    const sourceEmailParsed = sourceEmail.includes('<') ? 
      sourceEmail.match(/<([^>]+)>/)[1] : sourceEmail;
    
    const verifiedEmails = await ses.listVerifiedEmailAddresses().promise();
    console.log('Verified emails:', verifiedEmails.VerifiedEmailAddresses);
    
    if (!verifiedEmails.VerifiedEmailAddresses.includes(sourceEmailParsed)) {
      console.warn(`Warning: Sender email ${sourceEmailParsed} is not verified`);
    }
    
    // Send a test email
    console.log('\nSending test email...');
    const emailParams = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [targetEmail]
      },
      Message: {
        Subject: {
          Data: 'EzDrink - API Debug Test'
        },
        Body: {
          Html: {
            Data: '<p>This is a test email from the EzDrink API Debug endpoint.</p>'
          },
          Text: {
            Data: 'This is a test email from the EzDrink API Debug endpoint.'
          }
        }
      }
    };
    
    console.log('Email parameters:', {
      source: emailParams.Source,
      destination: emailParams.Destination,
      subject: emailParams.Message.Subject.Data
    });
    
    // Send the email
    const result = await ses.sendEmail(emailParams).promise();
    console.log('Test email sent successfully:', result.MessageId);
    
    // Now try to send the actual requested email if available
    let actualEmailResult = null;
    if (req.body && req.body.userData && req.body.emailContent) {
      console.log('\nAttempting to send the actual requested email...');
      
      const actualEmailParams = {
        Source: sourceEmail,
        Destination: {
          ToAddresses: [req.body.userData.email]
        },
        ReplyToAddresses: ['team@ezdrink.us'],
        Message: {
          Subject: {
            Data: `Cash Finder Report for ${req.body.userData.company || req.body.userData.barName || 'Your Bar'}`
          },
          Body: {
            Html: {
              Data: req.body.emailContent.html || '<p>Your Cash Finder Report</p>'
            },
            Text: {
              Data: req.body.emailContent.text || 'Your Cash Finder Report'
            }
          }
        }
      };
      
      try {
        actualEmailResult = await ses.sendEmail(actualEmailParams).promise();
        console.log('Actual email sent successfully:', actualEmailResult.MessageId);
      } catch (actualEmailError) {
        console.error('Error sending actual email:', actualEmailError);
        actualEmailResult = {
          error: actualEmailError.message,
          code: actualEmailError.code
        };
      }
    }
    
    console.log('====== API DEBUGGING END ======');
    
    return res.status(200).json({
      success: true,
      message: 'API debug test completed successfully',
      testResults,
      testEmailId: result.MessageId,
      actualEmailResult,
      workingMethod: workingMethod[0]
    });
  } catch (error) {
    console.error('====== API DEBUG ERROR ======');
    console.error('Error during API debugging:', error);
    
    // Additional AWS error information
    if (error.code) {
      console.error('AWS Error Code:', error.code);
      console.error('AWS Error Message:', error.message);
      if (error.statusCode) {
        console.error('AWS Status Code:', error.statusCode);
      }
    }
    
    console.log('====== API DEBUGGING END ======');
    
    return res.status(500).json({
      success: false,
      message: 'API debug test failed',
      error: error.message,
      code: error.code,
      testResults: testResults || {}
    });
  }
};
