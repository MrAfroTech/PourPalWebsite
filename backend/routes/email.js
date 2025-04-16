// routes/email.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const subscriptionService = require('../services/subscriptionService');

// Send Cash Finder Report email
router.post('/send-email', async (req, res) => {
  try {
    console.log('Received request to send email:', req.body.to);
    
    const { to, subject, html, text } = req.body;
    
    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Send email
    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text
    });
    
    // Save subscriber data (optional)
    try {
      if (req.body.userData) {
        await subscriptionService.saveSubscriber(req.body.userData);
      }
    } catch (subError) {
      console.error('Error saving subscriber data:', subError);
      // Continue anyway - this is not critical
    }
    
    // Return success
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Check if it's a bounce
    const isBounce = error.message && (
      error.message.includes('bounce') ||
      error.message.includes('rejected') ||
      error.message.includes('invalid')
    );
    
    // If it's a bounce, log it
    if (isBounce) {
      try {
        await emailService.recordBounce(req.body.to, error.message);
      } catch (bounceError) {
        console.error('Error recording bounce:', bounceError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Queue Cash Finder Plus email for later sending
router.post('/queue-follow-up', async (req, res) => {
  try {
    const { email, firstName, company, cashFinderData } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Queue the email
    await emailService.queueFollowUpEmail({
      email,
      firstName,
      company,
      cashFinderData,
      emailType: 'cash-finder-plus'
    });
    
    res.status(200).json({
      success: true,
      message: 'Follow-up email scheduled successfully'
    });
  } catch (error) {
    console.error('Error queuing follow-up email:', error);
    
    // This is non-critical, so return success anyway
    res.status(200).json({
      success: true,
      message: 'Request received, but follow-up may be delayed',
      warning: error.message
    });
  }
});

module.exports = router;