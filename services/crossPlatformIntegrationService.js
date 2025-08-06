// services/crossPlatformIntegrationService.js
const crypto = require('crypto');
const axios = require('axios');
const customerService = require('./customerService');
const engagementService = require('./engagementService');
const automationService = require('./klaviyoAutomationService');

class CrossPlatformIntegrationService {
  constructor() {
    this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    this.klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    this.baseUrl = 'https://a.klaviyo.com/api';
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event) {
    console.log(`💳 Processing Stripe webhook: ${event.type}`);
    
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleStripeSubscriptionCreated(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleStripeSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleStripePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleStripePaymentFailed(event.data.object);
          break;
        
        case 'customer.created':
          await this.handleStripeCustomerCreated(event.data.object);
          break;
        
        case 'customer.updated':
          await this.handleStripeCustomerUpdated(event.data.object);
          break;
        
        default:
          console.log(`⚠️ Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing Stripe webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle Stripe subscription created
   */
  async handleStripeSubscriptionCreated(subscription) {
    console.log(`🎉 New Stripe subscription: ${subscription.id}`);
    
    const customer = await this.findCustomerByStripeId(subscription.customer);
    
    if (customer) {
      // Update customer with subscription data
      await customerService.updateCustomer(customer.id, {
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: subscription.items.data[0]?.price.nickname || 'unknown',
        subscriptionCreatedAt: new Date(subscription.created * 1000).toISOString(),
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      });
      
      // Update engagement score
      await engagementService.updateEngagementScore(customer.klaviyoProfileId, 'purchase', {
        revenue: subscription.items.data[0]?.price.unit_amount / 100,
        source: 'stripe_subscription'
      });
      
      // Trigger subscription welcome sequence
      await automationService.triggerSubscriptionWelcomeSequence(customer);
      
      // Update Klaviyo profile
      await this.updateKlaviyoProfileWithStripeData(customer.klaviyoProfileId, subscription);
    }
  }

  /**
   * Handle Stripe subscription updated
   */
  async handleStripeSubscriptionUpdated(subscription) {
    console.log(`🔄 Stripe subscription updated: ${subscription.id}`);
    
    const customer = await this.findCustomerByStripeId(subscription.customer);
    
    if (customer) {
      await customerService.updateCustomer(customer.id, {
        subscriptionStatus: subscription.status,
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      });
      
      // Update Klaviyo profile
      await this.updateKlaviyoProfileWithStripeData(customer.klaviyoProfileId, subscription);
    }
  }

  /**
   * Handle Stripe subscription deleted
   */
  async handleStripeSubscriptionDeleted(subscription) {
    console.log(`❌ Stripe subscription cancelled: ${subscription.id}`);
    
    const customer = await this.findCustomerByStripeId(subscription.customer);
    
    if (customer) {
      await customerService.updateCustomer(customer.id, {
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: new Date().toISOString()
      });
      
      // Trigger cancellation sequence
      await automationService.triggerSubscriptionCancellationSequence(customer);
    }
  }

  /**
   * Handle Stripe payment succeeded
   */
  async handleStripePaymentSucceeded(invoice) {
    console.log(`✅ Stripe payment succeeded: ${invoice.id}`);
    
    const customer = await this.findCustomerByStripeId(invoice.customer);
    
    if (customer) {
      // Update customer with payment data
      await customerService.updateCustomerWithPlatformData(customer.id, 'stripe', {
        orders: 1,
        revenue: invoice.amount_paid / 100,
        lastPurchase: new Date().toISOString()
      });
      
      // Update engagement score
      await engagementService.updateEngagementScore(customer.klaviyoProfileId, 'purchase', {
        revenue: invoice.amount_paid / 100,
        source: 'stripe_payment'
      });
      
      // Trigger payment success sequence
      await automationService.triggerPaymentSuccessSequence(customer, {
        amount: invoice.amount_paid / 100,
        invoiceId: invoice.id
      });
    }
  }

  /**
   * Handle Stripe payment failed
   */
  async handleStripePaymentFailed(invoice) {
    console.log(`❌ Stripe payment failed: ${invoice.id}`);
    
    const customer = await this.findCustomerByStripeId(invoice.customer);
    
    if (customer) {
      // Trigger payment failure sequence
      await automationService.triggerPaymentFailureSequence(customer, {
        amount: invoice.amount_due / 100,
        invoiceId: invoice.id
      });
    }
  }

  /**
   * Handle Stripe customer created
   */
  async handleStripeCustomerCreated(stripeCustomer) {
    console.log(`👤 New Stripe customer: ${stripeCustomer.id}`);
    
    // Try to find existing customer by email
    const customer = await customerService.getCustomerByEmail(stripeCustomer.email);
    
    if (customer) {
      // Update existing customer with Stripe data
      await customerService.updateCustomer(customer.id, {
        stripeCustomerId: stripeCustomer.id
      });
    }
  }

  /**
   * Handle Stripe customer updated
   */
  async handleStripeCustomerUpdated(stripeCustomer) {
    console.log(`🔄 Stripe customer updated: ${stripeCustomer.id}`);
    
    const customer = await this.findCustomerByStripeId(stripeCustomer.id);
    
    if (customer) {
      await customerService.updateCustomer(customer.id, {
        email: stripeCustomer.email,
        firstName: stripeCustomer.name?.split(' ')[0],
        lastName: stripeCustomer.name?.split(' ').slice(1).join(' ')
      });
    }
  }

  /**
   * Handle Clover webhook events
   */
  async handleCloverWebhook(event) {
    console.log(`🍀 Processing Clover webhook: ${event.type}`);
    
    try {
      switch (event.type) {
        case 'order.created':
          await this.handleCloverOrderCreated(event.data);
          break;
        
        case 'order.updated':
          await this.handleCloverOrderUpdated(event.data);
          break;
        
        case 'customer.created':
          await this.handleCloverCustomerCreated(event.data);
          break;
        
        default:
          console.log(`⚠️ Unhandled Clover event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing Clover webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle Clover order created
   */
  async handleCloverOrderCreated(order) {
    console.log(`🛒 New Clover order: ${order.id}`);
    
    const customer = await this.findCustomerByCloverId(order.customerId);
    
    if (customer) {
      // Update customer with order data
      await customerService.updateCustomerWithPlatformData(customer.id, 'clover', {
        orders: 1,
        revenue: order.total / 100,
        lastPurchase: new Date().toISOString()
      });
      
      // Update engagement score
      await engagementService.updateEngagementScore(customer.klaviyoProfileId, 'purchase', {
        revenue: order.total / 100,
        source: 'clover_order'
      });
      
      // Trigger order success sequence
      await automationService.triggerOrderSuccessSequence(customer, {
        orderId: order.id,
        total: order.total / 100,
        items: order.lineItems?.length || 0
      });
    }
  }

  /**
   * Handle Square webhook events
   */
  async handleSquareWebhook(event) {
    console.log(`⬜ Processing Square webhook: ${event.type}`);
    
    try {
      switch (event.type) {
        case 'order.created':
          await this.handleSquareOrderCreated(event.data);
          break;
        
        case 'payment.created':
          await this.handleSquarePaymentCreated(event.data);
          break;
        
        default:
          console.log(`⚠️ Unhandled Square event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing Square webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle Shopify webhook events
   */
  async handleShopifyWebhook(event) {
    console.log(`🛍️ Processing Shopify webhook: ${event.topic}`);
    
    try {
      switch (event.topic) {
        case 'orders/create':
          await this.handleShopifyOrderCreated(event.data);
          break;
        
        case 'customers/create':
          await this.handleShopifyCustomerCreated(event.data);
          break;
        
        case 'customers/update':
          await this.handleShopifyCustomerUpdated(event.data);
          break;
        
        default:
          console.log(`⚠️ Unhandled Shopify event type: ${event.topic}`);
      }
    } catch (error) {
      console.error(`❌ Error processing Shopify webhook ${event.topic}:`, error);
      throw error;
    }
  }

  /**
   * Find customer by Stripe customer ID
   */
  async findCustomerByStripeId(stripeCustomerId) {
    const customers = await customerService.getAllCustomers();
    
    for (const customer of customers) {
      if (customer.stripeCustomerId === stripeCustomerId) {
        return customer;
      }
    }
    
    return null;
  }

  /**
   * Find customer by Clover customer ID
   */
  async findCustomerByCloverId(cloverCustomerId) {
    const customers = await customerService.getAllCustomers();
    
    for (const customer of customers) {
      if (customer.cloverCustomerId === cloverCustomerId) {
        return customer;
      }
    }
    
    return null;
  }

  /**
   * Find customer by Square customer ID
   */
  async findCustomerBySquareId(squareCustomerId) {
    const customers = await customerService.getAllCustomers();
    
    for (const customer of customers) {
      if (customer.squareCustomerId === squareCustomerId) {
        return customer;
      }
    }
    
    return null;
  }

  /**
   * Find customer by Shopify customer ID
   */
  async findCustomerByShopifyId(shopifyCustomerId) {
    const customers = await customerService.getAllCustomers();
    
    for (const customer of customers) {
      if (customer.shopifyCustomerId === shopifyCustomerId) {
        return customer;
      }
    }
    
    return null;
  }

  /**
   * Update Klaviyo profile with Stripe data
   */
  async updateKlaviyoProfileWithStripeData(profileId, stripeData) {
    try {
      const properties = {
        stripe_customer_id: stripeData.customer,
        subscription_status: stripeData.status,
        subscription_plan: stripeData.items?.data[0]?.price.nickname || 'unknown',
        subscription_created: new Date(stripeData.created * 1000).toISOString(),
        subscription_current_period_end: new Date(stripeData.current_period_end * 1000).toISOString()
      };
      
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
      
      console.log(`✅ Updated Klaviyo profile ${profileId} with Stripe data`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error updating Klaviyo profile with Stripe data:`, error);
      throw error;
    }
  }

  /**
   * Send event to Klaviyo
   */
  async sendKlaviyoEvent(profileId, eventName, properties = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/events`, {
        data: {
          type: 'event',
          attributes: {
            profile: {
              $id: profileId
            },
            metric: {
              name: eventName
            },
            properties: properties,
            time: new Date().toISOString()
          }
        }
      }, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2023-12-15'
        }
      });
      
      console.log(`✅ Sent Klaviyo event: ${eventName}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error sending Klaviyo event ${eventName}:`, error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret, algorithm = 'sha256') {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get unified customer data from all platforms
   */
  async getUnifiedCustomerData(customerId) {
    const customer = await customerService.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    const unifiedData = {
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      
      // Platform IDs
      stripeCustomerId: customer.stripeCustomerId,
      cloverCustomerId: customer.cloverCustomerId,
      squareCustomerId: customer.squareCustomerId,
      shopifyCustomerId: customer.shopifyCustomerId,
      
      // Subscription data
      subscriptionStatus: customer.subscriptionStatus,
      subscriptionPlan: customer.subscriptionPlan,
      subscriptionCreatedAt: customer.subscriptionCreatedAt,
      
      // Behavioral data
      totalOrders: customer.totalOrders,
      totalRevenue: customer.totalRevenue,
      averageOrderValue: customer.averageOrderValue,
      lastPurchase: customer.lastPurchase,
      
      // Engagement data
      engagementScore: customer.engagementScore,
      lastEngagement: customer.lastEngagement,
      
      // Properties from Klaviyo
      properties: customer.properties
    };
    
    return unifiedData;
  }

  /**
   * Sync customer data across all platforms
   */
  async syncCustomerAcrossPlatforms(customerId) {
    const customer = await customerService.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    
    const syncPromises = [];
    
    // Sync to Klaviyo
    if (customer.klaviyoProfileId) {
      syncPromises.push(
        this.updateKlaviyoProfile(customer.klaviyoProfileId, {
          email: customer.email,
          phone_number: customer.phone,
          first_name: customer.firstName,
          last_name: customer.lastName,
          stripe_customer_id: customer.stripeCustomerId,
          subscription_status: customer.subscriptionStatus,
          subscription_plan: customer.subscriptionPlan,
          total_orders: customer.totalOrders,
          total_revenue: customer.totalRevenue,
          average_order_value: customer.averageOrderValue,
          engagement_score: customer.engagementScore
        })
      );
    }
    
    // Sync to Stripe (if we have Stripe customer ID)
    if (customer.stripeCustomerId) {
      syncPromises.push(
        this.updateStripeCustomer(customer.stripeCustomerId, {
          email: customer.email,
          name: `${customer.firstName} ${customer.lastName}`.trim()
        })
      );
    }
    
    // Execute all sync operations
    await Promise.all(syncPromises);
    
    console.log(`✅ Synced customer ${customer.email} across platforms`);
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
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error updating Klaviyo profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Update Stripe customer
   */
  async updateStripeCustomer(customerId, properties) {
    try {
      const customer = await this.stripe.customers.update(customerId, properties);
      return customer;
      
    } catch (error) {
      console.error(`❌ Error updating Stripe customer ${customerId}:`, error);
      throw error;
    }
  }
}

module.exports = new CrossPlatformIntegrationService(); 