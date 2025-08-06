// services/customerService.js
const axios = require('axios');

class CustomerService {
  constructor() {
    this.klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    this.baseUrl = 'https://a.klaviyo.com/api';
    
    // In-memory storage for demo purposes
    // In production, this would be a database
    this.customers = new Map();
    this.profileIdToCustomerId = new Map();
  }

  /**
   * Create or update customer profile
   */
  async createOrUpdateCustomer(customerData) {
    console.log(`👤 Creating/updating customer: ${customerData.email}`);
    
    try {
      // Check if customer already exists
      let customer = await this.getCustomerByEmail(customerData.email);
      
      if (customer) {
        // Update existing customer
        customer = await this.updateCustomer(customer.id, customerData);
        console.log(`✅ Updated existing customer: ${customer.email}`);
      } else {
        // Create new customer
        customer = await this.createCustomer(customerData);
        console.log(`✅ Created new customer: ${customer.email}`);
      }
      
      // Update Klaviyo profile if we have a profile ID
      if (customerData.klaviyoProfileId) {
        await this.updateKlaviyoProfile(customerData.klaviyoProfileId, customerData);
      }
      
      return customer;
      
    } catch (error) {
      console.error(`❌ Error creating/updating customer ${customerData.email}:`, error);
      throw error;
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData) {
    const customer = {
      id: this.generateCustomerId(),
      email: customerData.email,
      phone: customerData.phone,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      properties: customerData.properties || {},
      klaviyoProfileId: customerData.klaviyoProfileId,
      source: customerData.source || 'klaviyo_webhook',
      subscribedAt: customerData.subscribedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Status flags
      welcomeSequenceTriggered: false,
      vendorOnboardingTriggered: false,
      unsubscribed: false,
      vendorSignupListSubscribed: false,
      
      // Engagement tracking
      engagementScore: 0,
      lastEngagement: null,
      
      // Cross-platform data
      stripeCustomerId: null,
      cloverCustomerId: null,
      squareCustomerId: null,
      shopifyCustomerId: null,
      
      // Behavioral data
      totalOrders: 0,
      totalRevenue: 0,
      lastPurchase: null,
      averageOrderValue: 0,
      
      // Communication preferences
      emailOptIn: true,
      smsOptIn: !!customerData.phone,
      preferredChannel: customerData.phone ? 'sms' : 'email'
    };
    
    // Store in memory (in production, this would be a database)
    this.customers.set(customer.id, customer);
    
    if (customer.klaviyoProfileId) {
      this.profileIdToCustomerId.set(customer.klaviyoProfileId, customer.id);
    }
    
    return customer;
  }

  /**
   * Update existing customer
   */
  async updateCustomer(customerId, updateData) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    // Update customer data
    Object.assign(customer, updateData, {
      updatedAt: new Date().toISOString()
    });
    
    // Store updated customer
    this.customers.set(customerId, customer);
    
    return customer;
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email) {
    for (const customer of this.customers.values()) {
      if (customer.email === email) {
        return customer;
      }
    }
    return null;
  }

  /**
   * Get customer by Klaviyo profile ID
   */
  async getCustomerByKlaviyoProfileId(profileId) {
    const customerId = this.profileIdToCustomerId.get(profileId);
    
    if (customerId) {
      return this.customers.get(customerId);
    }
    
    // Fallback: search by profile ID in customer data
    for (const customer of this.customers.values()) {
      if (customer.klaviyoProfileId === profileId) {
        return customer;
      }
    }
    
    return null;
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId) {
    return this.customers.get(customerId) || null;
  }

  /**
   * Get all customers
   */
  async getAllCustomers() {
    return Array.from(this.customers.values());
  }

  /**
   * Search customers by criteria
   */
  async searchCustomers(criteria) {
    const results = [];
    
    for (const customer of this.customers.values()) {
      let matches = true;
      
      // Check each criterion
      for (const [key, value] of Object.entries(criteria)) {
        if (customer[key] !== value) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        results.push(customer);
      }
    }
    
    return results;
  }

  /**
   * Update customer with cross-platform data
   */
  async updateCustomerWithPlatformData(customerId, platform, platformData) {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    const updateData = {
      [`${platform}CustomerId`]: platformData.customerId,
      totalOrders: (customer.totalOrders || 0) + (platformData.orders || 0),
      totalRevenue: (customer.totalRevenue || 0) + (platformData.revenue || 0),
      lastPurchase: platformData.lastPurchase || customer.lastPurchase
    };
    
    // Calculate average order value
    if (updateData.totalOrders > 0) {
      updateData.averageOrderValue = updateData.totalRevenue / updateData.totalOrders;
    }
    
    return await this.updateCustomer(customerId, updateData);
  }

  /**
   * Update customer engagement data
   */
  async updateCustomerEngagement(customerId, engagementData) {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    const updateData = {
      lastEngagement: new Date().toISOString(),
      engagementScore: engagementData.score || customer.engagementScore
    };
    
    // Update engagement score based on activity
    if (engagementData.activity) {
      updateData.engagementScore = this.calculateEngagementScore(
        customer.engagementScore,
        engagementData.activity,
        engagementData.weight || 1
      );
    }
    
    return await this.updateCustomer(customerId, updateData);
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(currentScore, activity, weight = 1) {
    const activityScores = {
      'email_opened': 5,
      'email_clicked': 10,
      'sms_sent': 2,
      'sms_delivered': 3,
      'purchase': 20,
      'website_visit': 3,
      'chatbot_interaction': 5
    };
    
    const activityScore = activityScores[activity] || 1;
    const weightedScore = activityScore * weight;
    
    // Cap score at 100
    return Math.min(currentScore + weightedScore, 100);
  }

  /**
   * Get customers by engagement level
   */
  async getCustomersByEngagementLevel(level) {
    const customers = await this.getAllCustomers();
    
    switch (level) {
      case 'high':
        return customers.filter(c => c.engagementScore >= 80);
      case 'medium':
        return customers.filter(c => c.engagementScore >= 50 && c.engagementScore < 80);
      case 'low':
        return customers.filter(c => c.engagementScore < 50);
      default:
        return customers;
    }
  }

  /**
   * Get customers by subscription status
   */
  async getCustomersBySubscriptionStatus(status) {
    const customers = await this.getAllCustomers();
    
    switch (status) {
      case 'active':
        return customers.filter(c => !c.unsubscribed);
      case 'unsubscribed':
        return customers.filter(c => c.unsubscribed);
      default:
        return customers;
    }
  }

  /**
   * Get customers by vendor type
   */
  async getCustomersByVendorType(vendorType) {
    const customers = await this.getAllCustomers();
    
    return customers.filter(c => c.properties?.vendor_type === vendorType);
  }

  /**
   * Update Klaviyo profile
   */
  async updateKlaviyoProfile(profileId, properties) {
    try {
      const response = await axios.patch(`${this.baseUrl}/profiles/${profileId}`, {
        data: {
          type: 'profile',
          id: profileId,
          attributes: properties
        }
      }, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2023-12-15'
        }
      });
      
      console.log(`✅ Updated Klaviyo profile ${profileId}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error updating Klaviyo profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Generate unique customer ID
   */
  generateCustomerId() {
    return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delete customer (for GDPR compliance)
   */
  async deleteCustomer(customerId) {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    // Remove from memory
    this.customers.delete(customerId);
    
    if (customer.klaviyoProfileId) {
      this.profileIdToCustomerId.delete(customer.klaviyoProfileId);
    }
    
    console.log(`🗑️ Deleted customer: ${customer.email}`);
    
    return { success: true };
  }

  /**
   * Export customer data (for GDPR compliance)
   */
  async exportCustomerData(customerId) {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    return {
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      properties: customer.properties,
      source: customer.source,
      subscribedAt: customer.subscribedAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      engagementScore: customer.engagementScore,
      totalOrders: customer.totalOrders,
      totalRevenue: customer.totalRevenue,
      lastPurchase: customer.lastPurchase,
      averageOrderValue: customer.averageOrderValue
    };
  }
}

module.exports = new CustomerService(); 