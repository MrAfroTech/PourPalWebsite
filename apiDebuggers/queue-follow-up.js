// api/queue-follow-up.js
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
    
    // Only allow POST for queueing emails
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
  
    try {
      const { email, firstName, company, cashFinderData, scheduledFor } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !company) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields for follow-up email' 
        });
      }
      
      // For testing, just log and return success
      console.log('Follow-up email queued:', { 
        email, 
        firstName, 
        company, 
        scheduledFor: scheduledFor || 'default: 24h from now'
      });
      
      // Calculate schedule time (24 hours from now) if not provided
      const sendTime = scheduledFor 
        ? new Date(scheduledFor) 
        : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Return success (you can implement actual queue logic later)
      return res.status(200).json({
        success: true,
        message: 'Follow-up email queued successfully',
        scheduledFor: sendTime.toISOString(),
        id: `queue_${Date.now()}`
      });
      
      // In a production environment, you would store this in a database
      // or use a task queue service to handle sending at the scheduled time
    } catch (error) {
      console.error('Error queueing follow-up email:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error queueing follow-up email',
        error: error.message
      });
    }
  };
