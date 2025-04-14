// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Add comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`Rejected ${req.method} request to /api/send-email`);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Processing email request...');
    const emailData = req.body;
    
    // Log request data for debugging
    console.log('Request body:', JSON.stringify(emailData));
    
    // Basic validation
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      console.log('Validation failed:', { to: !!emailData.to, subject: !!emailData.subject, html: !!emailData.html, text: !!emailData.text });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email data. Required fields: to, subject, and either html or text.' 
      });
    }
    
    // Create transporter with fixed PrivateEmail settings
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'team@ezdrink.us',
        pass: 'Setmefree$2025'
      }
    });
    
    // Prepare the email options
    const mailOptions = {
      from: '"EzDrink Cash Finder" <team@ezdrink.us>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    };
    
    console.log('Attempting to send email to:', emailData.to);
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response with more details
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}