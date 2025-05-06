const AWS = require('aws-sdk');

// Configure AWS
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  return new AWS.SES({ apiVersion: '2010-12-01' });
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

  try {
    const { userData, emailContent, deliveryMethod } = req.body;
    
    // Log the request data for debugging
    console.log('Email request received:', { 
      to: userData?.email,
      hasUserData: !!userData,
      hasEmailContent: !!emailContent
    });
    
    // Validate input
    if (!userData || !userData.email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required user email'
      });
    }
    
    if (!emailContent || !emailContent.html || !emailContent.text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required email content'
      });
    }
    
    // Create SES instance
    const ses = configureAWS();
    
    // Prepare email parameters
    const params = {
      Source: process.env.EMAIL_FROM || 'team@ezdrink.us',
      Destination: {
        ToAddresses: [userData.email]
      },
      Message: {
        Subject: {
          Data: `Your Free Cash Finder Report for ${userData.company || 'Your Bar'}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailContent.text,
            Charset: 'UTF-8'
          },
          Html: {
            Data: emailContent.html,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    // Send the email
    const result = await ses.sendEmail(params).promise();
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.MessageId,
      actualMethod: 'email'
    });
  } catch (error) {
    console.error('Error processing email request:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error processing email request',
      error: error.message
    });
  }
};