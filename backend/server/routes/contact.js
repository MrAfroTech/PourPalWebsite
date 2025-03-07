const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter
const configureTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Contact form submission endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;
    
    // Validate inputs
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    // Create email content
    let emailSubject = subject || `New ${type || 'Contact'} Form Submission`;
    let emailContent = `
      <h2>New Message from ${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type:</strong> ${type || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\\n/g, '<br>')}</p>
    `;
    
    const transporter = configureTransporter();
    
    // Send email
    await transporter.sendMail({
      from: `"Pourpal Website" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: emailSubject,
      html: emailContent
    });
    
    // Send confirmation email to user
    await transporter.sendMail({
      from: `"Pourpal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Thank you for contacting Pourpal',
      html: `
        <h2>Thank you for reaching out, ${name}!</h2>
        <p>We have received your message and will get back to you shortly.</p>
        <p>The Pourpal Team</p>
      `
    });
    
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message, please try again later' });
  }
});

module.exports = router;