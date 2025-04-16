// routes/email.js
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Configure AWS SDK with environment variables
const configureAWS = () => {
  // Log env variables existence (not their values) for debugging
  console.log(`[CONFIG] AWS Key exists: ${!!process.env.AWS_ACCESS_KEY_ID}`);
  console.log(`[CONFIG] AWS Secret exists: ${!!process.env.AWS_SECRET_ACCESS_KEY}`);
  console.log(`[CONFIG] AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`[CONFIG] Email From: ${process.env.EMAIL_FROM || 'team@ezdrink.us'}`);
  
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  return new AWS.SES({ apiVersion: '2010-12-01' });
};

// Helper to log events to console with timestamps
const logEvent = (type, message, data = null) => {
  console.log(`[${new Date().toISOString()}][${type.toUpperCase()}] ${message}`, data || '');
};

// Validate email address format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Email sending endpoint with comprehensive error handling
router.post('/send-email', async (req, res) => {
  try {
    logEvent('info', 'Email request received', req.body);
    
    const { to, subject, text, html, userData } = req.body;
    
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      logEvent('error', 'Missing required email fields', { to, subject, hasText: !!text, hasHtml: !!html });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required email fields' 
      });
    }
    
    // Validate email format
    if (!isValidEmail(to)) {
      logEvent('error', 'Invalid email format', { to });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    try {
      // Create SES instance
      const ses = configureAWS();
      
      // Prepare email parameters
      const params = {
        Source: process.env.EMAIL_FROM || 'team@ezdrink.us',
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: text || 'Please view this email with an HTML-capable email client.',
              Charset: 'UTF-8'
            }
          }
        }
      };
      
      // Add HTML body if provided
      if (html) {
        params.Message.Body.Html = {
          Data: html,
          Charset: 'UTF-8'
        };
      }
      
      logEvent('info', 'Preparing to send email via AWS SES', { 
        to: params.Destination.ToAddresses[0],
        from: params.Source,
        subject: params.Message.Subject.Data 
      });
      
      // Send the email
      const result = await ses.sendEmail(params).promise();
      
      logEvent('info', 'Email sent successfully', { messageId: result.MessageId });
      
      // Store user data if provided
      if (userData) {
        logEvent('info', 'User data received for tracking', userData);
        // In a production environment, you would save this to a database
      }
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.MessageId
      });
    } catch (awsError) {
      // Capture specific AWS errors
      logEvent('error', 'AWS SES Error', { 
        code: awsError.code, 
        message: awsError.message,
        statusCode: awsError.statusCode
      });
      
      // Handle specific AWS error codes
      let errorMessage = 'Failed to send email';
      let statusCode = 500;
      
      switch (awsError.code) {
        case 'MessageRejected':
          errorMessage = 'Email was rejected by AWS SES';
          break;
        case 'MailFromDomainNotVerified':
          errorMessage = 'The sending domain is not verified';
          break;
        case 'EmailAddressNotVerified':
          errorMessage = 'The sending email address is not verified';
          break;
        case 'InvalidParameterValue':
          errorMessage = 'Invalid email parameter';
          break;
        case 'AccessDenied':
        case 'SignatureDoesNotMatch':
        case 'InvalidClientTokenId':
          errorMessage = 'AWS authentication error. Check your credentials.';
          break;
        case 'Throttling':
          errorMessage = 'AWS SES rate limit exceeded. Try again later.';
          statusCode = 429; // Too Many Requests
          break;
        default:
          errorMessage = `AWS SES error: ${awsError.code || 'unknown'}`;
      }
      
      // For sandbox mode issues
      if (awsError.message && awsError.message.includes('sandbox')) {
        errorMessage = 'AWS SES account is in sandbox mode. Can only send to verified emails.';
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: awsError.message,
        code: awsError.code
      });
    }
  } catch (error) {
    logEvent('error', 'Unhandled exception in email endpoint', { 
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing email request',
      error: error.message
    });
  }
});

// Simple email test endpoint - for checking configuration
router.get('/test-email-config', async (req, res) => {
  try {
    const ses = configureAWS();
    const sendQuota = await ses.getSendQuota().promise();
    
    return res.status(200).json({
      success: true,
      message: 'AWS SES configuration is valid',
      quota: sendQuota,
      emailFrom: process.env.EMAIL_FROM || 'team@ezdrink.us'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'AWS SES configuration test failed',
      error: error.message,
      code: error.code
    });
  }
});

// Queue follow-up email endpoint
router.post('/queue-follow-up', async (req, res) => {
  try {
    const { email, firstName, company, cashFinderData, scheduledFor } = req.body;
    
    logEvent('info', 'Follow-up email request received', { email, scheduledFor });
    
    // Validate required fields
    if (!email || !firstName || !company) {
      logEvent('error', 'Missing required fields for follow-up email');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields for follow-up email' 
      });
    }
    
    // For now, just log and return success
    // In a production environment, you would store this in a database for later processing
    logEvent('info', 'Follow-up email queued for future delivery', {
      email,
      scheduledFor
    });
    
    return res.status(200).json({
      success: true,
      message: 'Follow-up email queued successfully',
      scheduledFor: scheduledFor
    });
    
  } catch (error) {
    logEvent('error', 'Failed to queue follow-up email', { 
      error: error.message
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to queue follow-up email',
      error: error.message
    });
  }
});

module.exports = router;