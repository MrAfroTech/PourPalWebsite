// Backend email handler - This would be part of your server implementation
// For example, in a Node.js Express server

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Optional: Configure email logging
const LOG_DIRECTORY = path.join(__dirname, '../logs/emails');
const LOG_EMAILS = true; // Set to false to disable logging

// Create log directory if it doesn't exist
if (LOG_EMAILS) {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  }
}

/**
 * Helper function to log emails for debugging and auditing
 * @param {Object} emailData - The email data being sent
 * @param {Object} result - The result from the email provider
 */
const logEmailActivity = (emailData, result) => {
  if (!LOG_EMAILS) return;
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFilename = `${timestamp}_${emailData.metadata.type}_${emailData.to.replace('@', '_at_')}.json`;
  const logPath = path.join(LOG_DIRECTORY, logFilename);
  
  const logData = {
    timestamp: timestamp,
    emailData: {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      metadata: emailData.metadata
    },
    result: result,
    textContent: emailData.text.substring(0, 500) + (emailData.text.length > 500 ? '...' : '')
  };
  
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
};

// Email sending endpoint
router.post('/send-email', async (req, res) => {
  try {
    const emailData = req.body;
    
    // Basic validation
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email data. Required fields: to, subject, and either html or text.' 
      });
    }
    
    // Create transporter using the provided config
    const transporter = nodemailer.createTransport(emailData.config);
    
    // Prepare the email options
    const mailOptions = {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Log the activity
    logEmailActivity(emailData, { 
      messageId: info.messageId,
      response: info.response
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the error
    if (LOG_EMAILS && req.body) {
      logEmailActivity(req.body, { 
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Endpoint to check for and send scheduled emails
// This would typically be called by a cron job or scheduler
router.post('/process-scheduled-emails', async (req, res) => {
  try {
    // This would typically read from a database
    // For demonstration, we'll use a JSON file or mock data
    
    // Example implementation for Cash Finder Plus emails
    const processResult = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: []
    };
    
    res.status(200).json({
      success: true,
      ...processResult
    });
    
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing scheduled emails',
      error: error.message
    });
  }
});

module.exports = router;

// Example usage in your main Express app:
/*
const express = require('express');
const app = express();
const emailHandler = require('./routes/emailHandler');

app.use(express.json());
app.use('/api', emailHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/