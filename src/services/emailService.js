// emailService.js
// This service handles all email-related functionality

/**
 * Sends an email with the Cash Finder Report
 * @param {Object} userData - User contact information
 * @param {Object} reportData - Generated Cash Finder Report data
 * @param {String} deliveryMethod - 'email' or 'sms'
 * @returns {Promise} - Resolves with success message or rejects with error
 */
export const sendCashFinderReport = async (userData, reportData, deliveryMethod) => {
    // API endpoint that would handle the email sending
    const API_ENDPOINT = 'https://your-backend-api.com/api/send-report';
    
    try {
      // Format the data for the API
      const payload = {
        recipient: deliveryMethod === 'email' ? userData.email : userData.phone,
        deliveryMethod,
        subject: `Your Cash Finder Report for ${userData.company}`,
        userName: userData.name,
        companyName: userData.company,
        reportData: {
          averageRevenue: reportData.averageRevenue,
          bestNightRevenue: reportData.bestNightRevenue,
          casesPurchased: reportData.casesPurchased,
          peakOpportunity: reportData.peakOpportunity,
          inventoryOpportunity: reportData.inventoryOpportunity,
          totalOpportunity: reportData.totalOpportunity
        },
        // Optional additional data
        message: userData.message || '',
        timestamp: new Date().toISOString()
      };
  
      // Make the API call
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': 'Bearer your-api-token'
        },
        body: JSON.stringify(payload)
      });
  
      // Handle API response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send report');
      }
  
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error sending report:', error);
      // Re-throw the error so the component can handle it
      throw error;
    }
  };
  
  /**
   * Queues a follow-up Cash Finder Plus email to be sent later
   * @param {Object} userData - Complete user and report data
   * @returns {Promise} - Resolves with success message or rejects with error
   */
  export const queueCashFinderPlusEmail = async (userData) => {
    // API endpoint that would handle scheduling the follow-up email
    const API_ENDPOINT = 'https://your-backend-api.com/api/queue-follow-up';
    
    try {
      // Schedule for 24 hours in the future
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 24);
      
      const payload = {
        recipient: userData.email,
        firstName: userData.name.split(' ')[0],
        company: userData.company,
        cashFinderData: userData.cashFinderResults,
        scheduledFor: scheduledTime.toISOString(),
        emailType: 'cash-finder-plus'
      };
  
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to queue follow-up email');
      }
  
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error queuing follow-up email:', error);
      // Still return success since this is a non-critical operation
      return { success: false, error: error.message };
    }
  };
  
  /**
   * For testing purposes only - simulates sending an email without a backend
   * Remove this in production and use the real API endpoints above
   */
  export const simulateEmailSend = async (userData, reportData, deliveryMethod) => {
    return new Promise((resolve) => {
      console.log(`SIMULATED ${deliveryMethod.toUpperCase()} SEND:`, {
        to: deliveryMethod === 'email' ? userData.email : userData.phone,
        subject: `Your Cash Finder Report for ${userData.company}`,
        data: reportData
      });
      
      // Simulate network delay
      setTimeout(() => {
        resolve({
          success: true,
          message: `Report successfully sent via ${deliveryMethod}`,
          id: 'sim_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1500);
    });
  };