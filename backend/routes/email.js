// routes/email.js
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Configure AWS SDK with environment variables
const configureAWS = () => {
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

// Email sending endpoint
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html, userData } = req.body;
    
    logEvent('info', 'Email request received', { to, subject });
    
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      logEvent('error', 'Missing required email fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required email fields' 
      });
    }
    
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
    
    // Send the email
    logEvent('info', 'Sending email via AWS SES');
    const result = await ses.sendEmail(params).promise();
    
    logEvent('info', 'Email sent successfully', { messageId: result.MessageId });
    
    // Store user data for tracking/analysis if needed
    if (userData) {
      // Here you would typically save to a database
      logEvent('info', 'User data received for tracking', { userData });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.MessageId
    });
    
  } catch (error) {
    logEvent('error', 'Email sending failed', { 
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    
    // Return detailed error for debugging
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
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
    
    // In a real implementation, you would:
    // 1. Store this request in a database
    // 2. Set up a scheduler (like node-cron) to process it later
    // 3. Send confirmation to the client
    
    // For now, just log and return success
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