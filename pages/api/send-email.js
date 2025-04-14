// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  console.log('Email API called, method:', req.method);
  console.log('Environment variables loaded:', {
    host: process.env.EMAIL_HOST || 'not set',
    port: process.env.EMAIL_PORT || 'not set',
    user: process.env.EMAIL_USER ? 'is set' : 'not set',
    pass: process.env.EMAIL_PASSWORD ? 'is set' : 'not set',
    from: process.env.EMAIL_FROM || 'not set'
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only handle POST requests
  if (req.method !== 'POST') {
    console.log('Rejecting non-POST request');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Processing POST request');
    const emailData = req.body;
    console.log('Request body:', JSON.stringify(emailData));
    
    // Validate required fields
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      console.log('Missing required fields:', {
        to: !!emailData.to,
        subject: !!emailData.subject,
        html: !!emailData.html,
        text: !!emailData.text
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    console.log('Creating transporter');
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug logs
      logger: true  // Log SMTP traffic
    });
    
    console.log('Preparing mail options');
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text || '',
      html: emailData.html || ''
    };
    console.log('Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      textLength: mailOptions.text?.length || 0,
      htmlLength: mailOptions.html?.length || 0
    });
    
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
}