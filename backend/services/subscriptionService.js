// services/subscriptionService.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Save subscriber information
 * @param {Object} userData - User data to save
 */
const saveSubscriber = async (userData) => {
  // In a production system, you would save to a database
  try {
    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const subscribersPath = path.join(dataDir, 'subscribers.json');
    
    // Read existing subscribers
    let subscribers = [];
    try {
      const data = await fs.readFile(subscribersPath, 'utf8');
      subscribers = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid - start with empty array
      subscribers = [];
    }
    
    // Add new subscriber with timestamp
    subscribers.push({
      ...userData,
      createdAt: new Date().toISOString()
    });
    
    // Save updated subscribers
    await fs.writeFile(subscribersPath, JSON.stringify(subscribers, null, 2));
    
    console.log(`Subscriber saved: ${userData.email}`);
    return true;
  } catch (error) {
    console.error('Error saving subscriber:', error);
    return false;
  }
};

module.exports = {
  saveSubscriber
};