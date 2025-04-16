// services/emailService.js
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create SES service object
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Email templates - you would need to create these
const templates = {
  'cash-finder-plus': path.join(__dirname, '../templates/cash-finder-plus.html')
};

// In-memory store for queued emails (would use a database in production)
let queuedEmails = [];

/**
 * Send an email using Amazon SES
 * @param {Object} emailData - Email data including to, subject, html, text
 * @returns {Promise} - Resolves with send info or rejects with error
 */
const sendEmail = async (emailData) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [emailData.to]
    },
    Message: {
      Subject: {
        Data: emailData.subject
      },
      Body: {
        Html: {
          Data: emailData.html || ''
        },
        Text: {
          Data: emailData.text || ''
        }
      }
    }
  };
  
  console.log(`Sending email to ${emailData.to}`);
  const result = await ses.sendEmail(params).promise();
  console.log(`Email sent to ${emailData.to}, ID: ${result.MessageId}`);
  
  return { messageId: result.MessageId };
};

/**
 * Record a bounce event
 * @param {String} email - The email address that bounced
 * @param {String} reason - The reason for the bounce
 */
const recordBounce = async (email, reason) => {
  // In a production system, you would record this in a database
  console.log(`Bounce recorded for ${email}: ${reason}`);
  
  // Create a log folder if it doesn't exist
  const logDir = path.join(__dirname, '../logs');
  try {
    await fs.mkdir(logDir, { recursive: true });
    
    // Append to bounces log
    const logPath = path.join(logDir, 'bounces.log');
    const logEntry = `${new Date().toISOString()},${email},"${reason}"\n`;
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    console.error('Error logging bounce:', error);
  }
};

/**
 * Queue a follow-up email to be sent later
 * @param {Object} data - The email data
 */
const queueFollowUpEmail = async (data) => {
  // In a production system, you would store this in a database
  console.log(`Queuing follow-up email for ${data.email}`);
  
  // Calculate send time (24 hours from now)
  const sendTime = new Date();
  sendTime.setHours(sendTime.getHours() + 24);
  
  // Add to queue
  queuedEmails.push({
    ...data,
    scheduledFor: sendTime.toISOString(),
    status: 'pending'
  });
  
  // Save queue to file for persistence
  try {
    const queueDir = path.join(__dirname, '../data');
    await fs.mkdir(queueDir, { recursive: true });
    
    const queuePath = path.join(queueDir, 'email_queue.json');
    await fs.writeFile(queuePath, JSON.stringify(queuedEmails, null, 2));
  } catch (error) {
    console.error('Error saving email queue:', error);
  }
};

/**
 * Process scheduled emails (would be called by a cron job)
 */
const processQueue = async () => {
  console.log('Processing email queue');
  
  try {
    // Load queue from file
    const queuePath = path.join(__dirname, '../data/email_queue.json');
    const queueData = await fs.readFile(queuePath, 'utf8');
    queuedEmails = JSON.parse(queueData);
  } catch (error) {
    console.error('Error loading email queue:', error);
    return;
  }
  
  const now = new Date();
  const results = {
    processed: 0,
    sent: 0,
    failed: 0
  };
  
  // Process each email
  for (const emailData of queuedEmails) {
    // Skip if not pending or not yet time to send
    if (emailData.status !== 'pending') continue;
    
    const scheduledTime = new Date(emailData.scheduledFor);
    if (scheduledTime > now) continue;
    
    results.processed++;
    
    try {
      // Load template if needed
      if (emailData.emailType && templates[emailData.emailType]) {
        const templatePath = templates[emailData.emailType];
        let template = await fs.readFile(templatePath, 'utf8');
        
        // Replace placeholders with actual data
        template = template
          .replace(/{{firstName}}/g, emailData.firstName || 'there')
          .replace(/{{company}}/g, emailData.company || 'your company')
          .replace(/{{email}}/g, emailData.email);
        
        emailData.html = template;
      }
      
      // Prepare email data
      const mailData = {
        to: emailData.email,
        subject: `${emailData.firstName}, Here's Your Cash Finder Plus Analysis`,
        html: emailData.html,
        text: emailData.text || 'Your Cash Finder Plus analysis is attached.'
      };
      
      // Send the email
      await sendEmail(mailData);
      
      // Update status
      emailData.status = 'sent';
      emailData.sentAt = new Date().toISOString();
      
      results.sent++;
    } catch (error) {
      console.error(`Error sending scheduled email to ${emailData.email}:`, error);
      
      // Update status
      emailData.status = 'failed';
      emailData.error = error.message;
      emailData.errorAt = new Date().toISOString();
      
      results.failed++;
    }
  }
  
  // Save updated queue
  try {
    const queuePath = path.join(__dirname, '../data/email_queue.json');
    await fs.writeFile(queuePath, JSON.stringify(queuedEmails, null, 2));
  } catch (error) {
    console.error('Error saving updated email queue:', error);
  }
  
  console.log(`Queue processing complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

module.exports = {
  sendEmail,
  recordBounce,
  queueFollowUpEmail,
  processQueue
};