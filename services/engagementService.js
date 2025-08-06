// services/engagementService.js
const customerService = require('./customerService');

class EngagementService {
  constructor() {
    // In-memory storage for engagement data
    // In production, this would be a database
    this.engagementData = new Map();
    this.activityLog = new Map();
  }

  /**
   * Initialize engagement score for new customer
   */
  async initializeEngagementScore(customerId) {
    console.log(`📊 Initializing engagement score for customer ${customerId}`);
    
    const engagementRecord = {
      customerId,
      score: 0,
      activities: [],
      lastActivity: null,
      emailOpens: 0,
      emailClicks: 0,
      smsSent: 0,
      smsDelivered: 0,
      purchases: 0,
      websiteVisits: 0,
      chatbotInteractions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.engagementData.set(customerId, engagementRecord);
    
    return engagementRecord;
  }

  /**
   * Update engagement score based on activity
   */
  async updateEngagementScore(profileId, activity, metadata = {}) {
    console.log(`📈 Updating engagement for profile ${profileId}: ${activity}`);
    
    try {
      // Get customer by Klaviyo profile ID
      const customer = await customerService.getCustomerByKlaviyoProfileId(profileId);
      
      if (!customer) {
        console.warn(`⚠️ Customer not found for profile ${profileId}`);
        return null;
      }
      
      const customerId = customer.id;
      let engagementRecord = this.engagementData.get(customerId);
      
      if (!engagementRecord) {
        engagementRecord = await this.initializeEngagementScore(customerId);
      }
      
      // Calculate score change based on activity
      const scoreChange = this.calculateActivityScore(activity, metadata);
      
      // Update engagement record
      engagementRecord.score = Math.min(engagementRecord.score + scoreChange, 100);
      engagementRecord.lastActivity = new Date().toISOString();
      engagementRecord.updatedAt = new Date().toISOString();
      
      // Track specific activity counts
      switch (activity) {
        case 'email_opened':
          engagementRecord.emailOpens++;
          break;
        case 'email_clicked':
          engagementRecord.emailClicks++;
          break;
        case 'sms_sent':
          engagementRecord.smsSent++;
          break;
        case 'sms_delivered':
          engagementRecord.smsDelivered++;
          break;
        case 'purchase':
          engagementRecord.purchases++;
          break;
        case 'website_visit':
          engagementRecord.websiteVisits++;
          break;
        case 'chatbot_interaction':
          engagementRecord.chatbotInteractions++;
          break;
      }
      
      // Add activity to log
      engagementRecord.activities.push({
        activity,
        scoreChange,
        metadata,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 activities
      if (engagementRecord.activities.length > 100) {
        engagementRecord.activities = engagementRecord.activities.slice(-100);
      }
      
      // Store updated record
      this.engagementData.set(customerId, engagementRecord);
      
      // Update customer record
      await customerService.updateCustomer(customerId, {
        engagementScore: engagementRecord.score,
        lastEngagement: engagementRecord.lastActivity
      });
      
      // Log activity
      await this.logActivity(customerId, activity, metadata);
      
      console.log(`✅ Updated engagement score for ${customer.email}: ${engagementRecord.score}`);
      
      return engagementRecord;
      
    } catch (error) {
      console.error(`❌ Error updating engagement score for profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate score change for activity
   */
  calculateActivityScore(activity, metadata = {}) {
    const baseScores = {
      'email_opened': 5,
      'email_clicked': 10,
      'sms_sent': 2,
      'sms_delivered': 3,
      'sms_failed': -2,
      'purchase': 20,
      'website_visit': 3,
      'chatbot_interaction': 5,
      'form_submission': 8,
      'demo_request': 15,
      'support_contact': 5
    };
    
    let score = baseScores[activity] || 1;
    
    // Apply multipliers based on metadata
    if (metadata.campaignId) {
      // Campaign-specific scoring
      score *= this.getCampaignMultiplier(metadata.campaignId);
    }
    
    if (metadata.revenue) {
      // Revenue-based scoring
      score += Math.min(metadata.revenue / 100, 10); // Max 10 points for revenue
    }
    
    if (metadata.frequency) {
      // Frequency-based scoring (diminishing returns)
      score *= Math.max(0.5, 1 - (metadata.frequency * 0.1));
    }
    
    return Math.round(score);
  }

  /**
   * Get campaign-specific multiplier
   */
  getCampaignMultiplier(campaignId) {
    const campaignMultipliers = {
      'welcome_sequence': 1.2,
      'nurture_sequence': 1.0,
      'conversion_sequence': 1.5,
      're_engagement': 0.8,
      'high_value': 1.3
    };
    
    // Extract campaign type from ID
    const campaignType = campaignId.split('_')[0];
    return campaignMultipliers[campaignType] || 1.0;
  }

  /**
   * Get engagement score for customer
   */
  async getEngagementScore(customerId) {
    const engagementRecord = this.engagementData.get(customerId);
    return engagementRecord ? engagementRecord.score : 0;
  }

  /**
   * Get engagement level (high/medium/low)
   */
  async getEngagementLevel(customerId) {
    const score = await this.getEngagementScore(customerId);
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Get detailed engagement data
   */
  async getEngagementData(customerId) {
    const engagementRecord = this.engagementData.get(customerId);
    
    if (!engagementRecord) {
      return {
        score: 0,
        level: 'low',
        activities: [],
        stats: {
          emailOpens: 0,
          emailClicks: 0,
          smsSent: 0,
          smsDelivered: 0,
          purchases: 0,
          websiteVisits: 0,
          chatbotInteractions: 0
        }
      };
    }
    
    return {
      score: engagementRecord.score,
      level: await this.getEngagementLevel(customerId),
      activities: engagementRecord.activities,
      lastActivity: engagementRecord.lastActivity,
      stats: {
        emailOpens: engagementRecord.emailOpens,
        emailClicks: engagementRecord.emailClicks,
        smsSent: engagementRecord.smsSent,
        smsDelivered: engagementRecord.smsDelivered,
        purchases: engagementRecord.purchases,
        websiteVisits: engagementRecord.websiteVisits,
        chatbotInteractions: engagementRecord.chatbotInteractions
      }
    };
  }

  /**
   * Log activity for tracking
   */
  async logActivity(customerId, activity, metadata = {}) {
    const logEntry = {
      customerId,
      activity,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    if (!this.activityLog.has(customerId)) {
      this.activityLog.set(customerId, []);
    }
    
    this.activityLog.get(customerId).push(logEntry);
    
    // Keep only last 1000 activities per customer
    const activities = this.activityLog.get(customerId);
    if (activities.length > 1000) {
      this.activityLog.set(customerId, activities.slice(-1000));
    }
  }

  /**
   * Get activity history for customer
   */
  async getActivityHistory(customerId, limit = 50) {
    const activities = this.activityLog.get(customerId) || [];
    return activities.slice(-limit).reverse();
  }

  /**
   * Check if customer should receive communication
   */
  async shouldReceiveCommunication(customerId, channel, campaignType) {
    const customer = await customerService.getCustomerById(customerId);
    
    if (!customer) return false;
    
    // Check unsubscription status
    if (customer.unsubscribed) return false;
    
    // Check channel preferences
    if (channel === 'email' && !customer.emailOptIn) return false;
    if (channel === 'sms' && !customer.smsOptIn) return false;
    
    // Check engagement-based suppression
    const engagementLevel = await this.getEngagementLevel(customerId);
    const lastActivity = await this.getLastActivity(customerId);
    
    // Suppress low-engagement customers for certain campaigns
    if (engagementLevel === 'low' && campaignType === 'conversion') {
      const daysSinceLastActivity = this.getDaysSince(lastActivity);
      if (daysSinceLastActivity > 30) return false;
    }
    
    // Check frequency limits
    if (!this.checkFrequencyLimits(customerId, channel, campaignType)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check frequency limits to prevent spam
   */
  checkFrequencyLimits(customerId, channel, campaignType) {
    const activities = this.activityLog.get(customerId) || [];
    const now = new Date();
    
    // Get recent activities for this channel
    const recentActivities = activities.filter(activity => {
      const activityTime = new Date(activity.timestamp);
      const hoursDiff = (now - activityTime) / (1000 * 60 * 60);
      
      return activity.activity.includes(channel) && hoursDiff < 24;
    });
    
    // Frequency limits
    const limits = {
      email: { daily: 3, hourly: 1 },
      sms: { daily: 2, hourly: 1 }
    };
    
    const limit = limits[channel] || { daily: 5, hourly: 2 };
    
    // Check daily limit
    if (recentActivities.length >= limit.daily) {
      console.log(`⚠️ Frequency limit reached for ${customerId} on ${channel}`);
      return false;
    }
    
    // Check hourly limit
    const hourlyActivities = recentActivities.filter(activity => {
      const activityTime = new Date(activity.timestamp);
      const hoursDiff = (now - activityTime) / (1000 * 60 * 60);
      return hoursDiff < 1;
    });
    
    if (hourlyActivities.length >= limit.hourly) {
      console.log(`⚠️ Hourly frequency limit reached for ${customerId} on ${channel}`);
      return false;
    }
    
    return true;
  }

  /**
   * Get last activity timestamp
   */
  async getLastActivity(customerId) {
    const engagementRecord = this.engagementData.get(customerId);
    return engagementRecord ? engagementRecord.lastActivity : null;
  }

  /**
   * Calculate days since last activity
   */
  getDaysSince(lastActivity) {
    if (!lastActivity) return Infinity;
    
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffTime = Math.abs(now - lastActivityDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get customers for re-engagement campaigns
   */
  async getCustomersForReEngagement() {
    const customers = await customerService.getAllCustomers();
    const reEngagementCandidates = [];
    
    for (const customer of customers) {
      const engagementData = await this.getEngagementData(customer.id);
      const daysSinceLastActivity = this.getDaysSince(engagementData.lastActivity);
      
      // Customers with low engagement and no activity for 30+ days
      if (engagementData.level === 'low' && daysSinceLastActivity >= 30) {
        reEngagementCandidates.push({
          customer,
          engagementData,
          daysSinceLastActivity
        });
      }
    }
    
    return reEngagementCandidates;
  }

  /**
   * Get customers for high-value campaigns
   */
  async getCustomersForHighValueCampaigns() {
    const customers = await customerService.getAllCustomers();
    const highValueCandidates = [];
    
    for (const customer of customers) {
      const engagementData = await this.getEngagementData(customer.id);
      
      // High engagement customers with recent activity
      if (engagementData.level === 'high' && 
          this.getDaysSince(engagementData.lastActivity) <= 7) {
        highValueCandidates.push({
          customer,
          engagementData
        });
      }
    }
    
    return highValueCandidates;
  }

  /**
   * Generate engagement report
   */
  async generateEngagementReport() {
    const customers = await customerService.getAllCustomers();
    const report = {
      totalCustomers: customers.length,
      engagementLevels: {
        high: 0,
        medium: 0,
        low: 0
      },
      activityStats: {
        totalEmailOpens: 0,
        totalEmailClicks: 0,
        totalSmsSent: 0,
        totalSmsDelivered: 0,
        totalPurchases: 0,
        totalWebsiteVisits: 0,
        totalChatbotInteractions: 0
      },
      averageEngagementScore: 0
    };
    
    let totalScore = 0;
    
    for (const customer of customers) {
      const engagementData = await this.getEngagementData(customer.id);
      
      // Count engagement levels
      report.engagementLevels[engagementData.level]++;
      
      // Sum activity stats
      Object.keys(report.activityStats).forEach(stat => {
        const camelCaseStat = stat.replace(/([A-Z])/g, '_$1').toLowerCase();
        report.activityStats[stat] += engagementData.stats[camelCaseStat] || 0;
      });
      
      totalScore += engagementData.score;
    }
    
    report.averageEngagementScore = customers.length > 0 ? 
      Math.round(totalScore / customers.length) : 0;
    
    return report;
  }
}

module.exports = new EngagementService(); 