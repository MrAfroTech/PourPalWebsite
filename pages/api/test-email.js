// pages/api/test-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  console.log('Test email function called');
  
  try {
    // Create transporter with direct values (for testing only)
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'team@ezdrink.us',
        pass: 'Setmefree$2025'
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true // This will log SMTP traffic
    });
    
    // Send a test email
    const info = await transporter.sendMail({
      from: '"EzDrink Test" <team@ezdrink.us>',
      to: "team@ezdrink.us", // Send to yourself
      subject: "Test Email from API",
      text: "This is a test email from the API endpoint.",
      html: "<p>This is a test email from the API endpoint.</p>"
    });
    
    console.log('Test email sent:', info.messageId);
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      response: info.response
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // Return error with detailed information
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack
    });
  }
}