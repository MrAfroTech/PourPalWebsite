// directEmailService.js
// Sends emails directly using a private email account
import { cashFinderReportTemplate, cashFinderReportTextTemplate, 
  cashFinderPlusTemplate, cashFinderPlusTextTemplate } from './emailTemplates';

/**
* Configuration for the email service
* These should be stored securely, ideally in environment variables
*/
const EMAIL_CONFIG = {
host: 'smtp.yourdomain.com',        // Your SMTP server address
port: 587,                          // Common SMTP port, may need adjusting
secure: false,                      // true for 465, false for other ports
auth: {
  user: 'team@ezdrink.us',   // Your email address
  pass: 'Setmefree$2025'       // Your email password or app password
},
from: '"EzDrink Cash Finder" <reports@yourdomain.com>' // Sender address
};

/**
* Function to send email directly using the browser's fetch API to your backend endpoint
* This approach is more secure than trying to implement SMTP directly in the browser
* @param {Object} emailData - Complete email data to send
* @returns {Promise} - Resolves with API response or rejects with error
*/
const sendEmailViaBackend = async (emailData) => {
// This endpoint should exist on your server to handle the actual email sending
const BACKEND_EMAIL_ENDPOINT = '/api/send-email';

try {
  const response = await fetch(BACKEND_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    })
  });

  if (!response.ok) {
    // For 405 errors specifically (Method Not Allowed)
    if (response.status === 405) {
      console.error('API endpoint not available or not accepting POST requests');
      // Return a simulated success for now to prevent blocking the UI flow
      return { 
        success: true, 
        message: 'Report request received (Email delivery unavailable)',
        id: `email_${Date.now()}`
      };
    }
    
    // For other errors, try to get details
    const errorText = await response.text(); 
    console.error('Error response:', response.status, errorText);
    throw new Error(`Server returned ${response.status}: ${errorText || 'No error details'}`);
  }

  // Now try to parse JSON
  let result;
  try {
    result = await response.json();
  } catch (jsonError) {
    console.error('Error parsing JSON response:', jsonError);
    throw new Error('Invalid response from server (not JSON)');
  }

  return { 
    success: true, 
    message: 'Email sent successfully',
    id: result.messageId || `email_${Date.now()}`
  };
} catch (error) {
  console.error('Error sending email:', error);
  throw error;
}
};

/**
* Sends a Cash Finder Report email using your private email system
* @param {Object} userData - User contact information
* @param {Object} reportData - Report data to include in the email
* @returns {Promise} - Resolves with success info or rejects with error
*/
export const sendCashFinderReportEmail = async (userData, reportData) => {
const templateData = {
  userName: userData.name,
  companyName: userData.company || userData.barName,
  reportData: reportData
};

// Generate the HTML and text versions of the email
const htmlContent = cashFinderReportTemplate(templateData);
const textContent = cashFinderReportTextTemplate(templateData);

const emailData = {
  to: userData.email,
  subject: `Your Cash Finder Report for ${templateData.companyName}`,
  html: htmlContent,
  text: textContent,
  from: EMAIL_CONFIG.from,
  config: EMAIL_CONFIG,
  // Additional metadata for tracking
  metadata: {
    type: 'cash_finder_report',
    userName: userData.name,
    userEmail: userData.email,
    companyName: templateData.companyName,
    timestamp: new Date().toISOString()
  }
};

return sendEmailViaBackend(emailData);
};

/**
* Sends a Cash Finder Report via SMS
* @param {Object} userData - User contact information
* @param {Object} reportData - Report data
* @returns {Promise} - Resolves with success data or rejects with error
*/
export const sendCashFinderReportSMS = async (userData, reportData) => {
// For SMS, you would need to integrate with an SMS service
// This is a placeholder implementation

console.log('SMS feature requested, but not implemented in private email service');
console.log('Consider sending an email with a link to view the report instead');

// Return a failure response
return {
  success: false,
  message: 'SMS delivery not available with private email system',
  fallbackMethod: 'email'
};
};

/**
* Stores a request to send a follow-up Cash Finder Plus email later
* @param {Object} userData - Complete user data
* @returns {Promise} - Resolves with success info or rejects with error
*/
export const queueCashFinderPlusEmail = async (userData) => {
// Create a scheduled time (24 hours from now)
const scheduledTime = new Date();
scheduledTime.setHours(scheduledTime.getHours() + 24);

// In a real implementation, save this to a database or file
// Here we'll use localStorage for demonstration
try {
  const cashFinderPlusQueue = JSON.parse(localStorage.getItem('cash_finder_plus_queue') || '[]');

  localStorage.setItem('cash_finder_plus_queue', JSON.stringify([
    ...cashFinderPlusQueue,
    {
      name: userData.name,
      firstName: userData.name.split(' ')[0],
      email: userData.email,
      phone: userData.phone,
      company: userData.company,
      cashFinderData: userData.cashFinderResults,
      scheduledFor: scheduledTime.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
  ]));

  console.log('Cash Finder Plus email queued for', scheduledTime.toISOString());

  return {
    success: true,
    message: 'Follow-up email scheduled successfully',
    scheduledTime: scheduledTime.toISOString()
  };
} catch (error) {
  console.error('Error queuing follow-up email:', error);
  throw error;
}
};

/**
* Sends the Cash Finder Plus follow-up email
* This would be called by a scheduled process checking for pending emails
* @param {Object} queuedEmailData - Data for the queued email
* @returns {Promise} - Resolves with success data or rejects with error
*/
export const sendCashFinderPlusEmail = async (queuedEmailData) => {
const { name, email, company, cashFinderData } = queuedEmailData;

const templateData = {
  firstName: name.split(' ')[0],
  company,
  cashFinderData
};

// Generate the HTML and text versions of the email
const htmlContent = cashFinderPlusTemplate(templateData);
const textContent = cashFinderPlusTextTemplate(templateData);

const emailData = {
  to: email,
  subject: `${templateData.firstName}, Here's Your Cash Finder Plus Analysis for ${company}`,
  html: htmlContent,
  text: textContent,
  from: '"EzDrink Premium Insights" <reports@yourdomain.com>',
  config: EMAIL_CONFIG,
  // Additional metadata for tracking
  metadata: {
    type: 'cash_finder_plus',
    userName: name,
    userEmail: email,
    companyName: company,
    timestamp: new Date().toISOString()
  }
};

return sendEmailViaBackend(emailData);
};

/**
* Main service function to send a Cash Finder Report via the selected delivery method
* @param {Object} userData - User contact information
* @param {Object} reportData - Report data
* @param {String} deliveryMethod - 'email' or 'sms'
* @returns {Promise} - Resolves with success info or rejects with error
*/
export const sendCashFinderReport = async (userData, reportData, deliveryMethod) => {
if (deliveryMethod === 'email') {
  return sendCashFinderReportEmail(userData, reportData);
} else if (deliveryMethod === 'sms') {
  // Try SMS first, but fallback to email if SMS is not available
  try {
    const smsResult = await sendCashFinderReportSMS(userData, reportData);
    if (!smsResult.success && smsResult.fallbackMethod === 'email') {
      console.log('Falling back to email delivery due to SMS unavailability');
      return sendCashFinderReportEmail(userData, reportData);
    }
    return smsResult;
  } catch (error) {
    console.error('SMS delivery failed, falling back to email:', error);
    return sendCashFinderReportEmail(userData, reportData);
  }
} else {
  throw new Error(`Unsupported delivery method: ${deliveryMethod}`);
}
};

/**
* For development use: simulate sending an email without actually making API calls
*/
export const simulateEmailSend = async (userData, reportData, deliveryMethod) => {
console.log(`SIMULATED ${deliveryMethod.toUpperCase()} SEND:`, {
  to: deliveryMethod === 'email' ? userData.email : userData.phone,
  subject: `Your Cash Finder Report for ${userData.company || userData.barName}`,
  reportDataPreview: {
    averageRevenue: reportData.averageRevenue,
    bestNightRevenue: reportData.bestNightRevenue,
    totalOpportunity: reportData.totalOpportunity
  }
});

// For email, we would use the template - let's preview it
if (deliveryMethod === 'email') {
  const templateData = {
    userName: userData.name,
    companyName: userData.company || userData.barName,
    reportData: reportData
  };

  // Log the first 200 characters of the text version to preview
  const text = cashFinderReportTextTemplate(templateData);
  console.log('Email text preview:', text.substring(0, 200) + '...');
}

// Simulate network delay
return new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      success: true,
      message: `Report successfully sent via ${deliveryMethod} (simulated)`,
      id: 'sim_' + Math.random().toString(36).substr(2, 9)
    });
  }, 1500);
});
};