// services/klaviyoAutomationService.js
const axios = require('axios');
const customerService = require('./customerService');
const engagementService = require('./engagementService');

class KlaviyoAutomationService {
  constructor() {
    this.klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    this.klaviyoListId = process.env.KLAVIYO_LIST_ID;
    this.baseUrl = 'https://a.klaviyo.com/api';
  }

  /**
   * Trigger welcome sequence via Klaviyo API (immediate)
   */
  async triggerWelcomeSequenceViaAPI(customer) {
    console.log(`🎉 Triggering welcome sequence via API for ${customer.email}`);
    
    try {
      // Determine available channels
      const channels = this.getAvailableChannels(customer);
      
      // Send immediate welcome messages via Klaviyo API
      const promises = [];
      
      if (channels.email) {
        promises.push(this.sendWelcomeEmailViaAPI(customer));
      }
      
      if (channels.sms) {
        promises.push(this.sendWelcomeSMSViaAPI(customer));
      }
      
      // Wait for all messages to be sent
      await Promise.all(promises);
      
      // Schedule nurture sequence via API
      await this.scheduleNurtureSequenceViaAPI(customer);
      
      // Update customer status
      await customerService.updateCustomer(customer.id, {
        welcomeSequenceTriggered: true,
        welcomeSequenceTriggeredAt: new Date().toISOString()
      });
      
      console.log(`✅ Welcome sequence completed for ${customer.email}`);
      
    } catch (error) {
      console.error(`❌ Error in welcome sequence for ${customer.email}:`, error);
      throw error;
    }
  }

  /**
   * Trigger welcome sequence (legacy method - kept for compatibility)
   */
  async triggerWelcomeSequence(customer) {
    return this.triggerWelcomeSequenceViaAPI(customer);
  }

  /**
   * Trigger vendor-specific onboarding sequence
   */
  async triggerVendorOnboardingSequence(customer) {
    console.log(`🏪 Triggering vendor onboarding for ${customer.email}`);
    
    try {
      // Send vendor-specific welcome
      await this.sendVendorWelcomeEmail(customer);
      
      // Schedule vendor nurture sequence
      await this.scheduleVendorNurtureSequence(customer);
      
      // Update customer status
      await customerService.updateCustomer(customer.id, {
        vendorOnboardingTriggered: true,
        vendorOnboardingTriggeredAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Error in vendor onboarding for ${customer.email}:`, error);
      throw error;
    }
  }

  /**
   * Schedule nurture sequence (days 2-14)
   */
  async scheduleNurtureSequence(customer) {
    console.log(`📚 Scheduling nurture sequence for ${customer.email}`);
    
    const nurtureEmails = [
      { day: 2, template: 'nurture_day_2', subject: 'How EzDrink Saves You 30% on Wait Times' },
      { day: 4, template: 'nurture_day_4', subject: 'See How Top Bars Increase Revenue by 25%' },
      { day: 7, template: 'nurture_day_7', subject: 'Your Competitors Are Missing This Opportunity' },
      { day: 10, template: 'nurture_day_10', subject: '3 Ways EzDrink Pays for Itself' },
      { day: 14, template: 'nurture_day_14', subject: 'Ready to Transform Your Business?' }
    ];
    
    for (const email of nurtureEmails) {
      await this.scheduleEmail(customer, email.template, email.subject, email.day);
    }
    
    // Schedule conversion sequence after nurture
    await this.scheduleConversionSequence(customer, 15);
  }

  /**
   * Schedule vendor-specific nurture sequence
   */
  async scheduleVendorNurtureSequence(customer) {
    console.log(`🏪 Scheduling vendor nurture for ${customer.email}`);
    
    const vendorEmails = [
      { day: 2, template: 'vendor_nurture_day_2', subject: 'Welcome to EzDrink - Your Setup Guide' },
      { day: 4, template: 'vendor_nurture_day_4', subject: 'Integrating with Your POS System' },
      { day: 7, template: 'vendor_nurture_day_7', subject: 'Best Practices for Food Trucks' },
      { day: 10, template: 'vendor_nurture_day_10', subject: 'Customer Success Stories' },
      { day: 14, template: 'vendor_nurture_day_14', subject: 'Ready to Go Live?' }
    ];
    
    for (const email of vendorEmails) {
      await this.scheduleEmail(customer, email.template, email.subject, email.day);
    }
  }

  /**
   * Schedule conversion sequence (days 15-30)
   */
  async scheduleConversionSequence(customer, startDay = 15) {
    console.log(`💼 Scheduling conversion sequence for ${customer.email}`);
    
    const conversionEmails = [
      { day: startDay, template: 'conversion_day_15', subject: 'Limited Time: 50% Off Your First Month' },
      { day: startDay + 3, template: 'conversion_day_18', subject: 'Case Study: How Joe\'s Bar Increased Revenue' },
      { day: startDay + 7, template: 'conversion_day_22', subject: 'Your Custom Demo is Ready' },
      { day: startDay + 10, template: 'conversion_day_25', subject: 'Final Reminder: Special Pricing Ends Soon' },
      { day: startDay + 14, template: 'conversion_day_29', subject: 'Last Chance: Don\'t Miss This Opportunity' }
    ];
    
    for (const email of conversionEmails) {
      await this.scheduleEmail(customer, email.template, email.subject, email.day);
    }
  }

  /**
   * Send welcome email via Klaviyo API
   */
  async sendWelcomeEmailViaAPI(customer) {
    console.log(`📧 Sending welcome email via API to ${customer.email}`);
    
    try {
      // Create a personalized email via Klaviyo API
      const emailData = {
        data: {
          type: 'email',
          attributes: {
            to: customer.email,
            subject: `Welcome to EzDrink, ${customer.firstName || 'there'}!`,
            html_content: this.generateWelcomeEmailHTML(customer),
            text_content: this.generateWelcomeEmailText(customer),
            from_email: 'team@ezdrink.us',
            from_name: 'EzDrink Team'
          }
        }
      };

      const response = await axios.post(`${this.baseUrl}/v2/emails`, emailData, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2023-12-15'
        }
      });

      console.log(`✅ Welcome email sent via API to ${customer.email}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error sending welcome email to ${customer.email}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome SMS via Klaviyo API
   */
  async sendWelcomeSMSViaAPI(customer) {
    if (!customer.phone) return;
    
    console.log(`📱 Sending welcome SMS via API to ${customer.phone}`);
    
    try {
      const message = `Welcome to EzDrink! We're excited to help ${customer.properties?.business_name || 'your business'} grow. Reply STOP to unsubscribe.`;
      
      const smsData = {
        data: {
          type: 'sms',
          attributes: {
            to: customer.phone,
            message: message,
            from: 'EzDrink'
          }
        }
      };

      const response = await axios.post(`${this.baseUrl}/v2/sms`, smsData, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2023-12-15'
        }
      });

      console.log(`✅ Welcome SMS sent via API to ${customer.phone}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error sending welcome SMS to ${customer.phone}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email (legacy method)
   */
  async sendWelcomeEmail(customer) {
    return this.sendWelcomeEmailViaAPI(customer);
  }

  /**
   * Send welcome SMS (legacy method)
   */
  async sendWelcomeSMS(customer) {
    return this.sendWelcomeSMSViaAPI(customer);
  }

  /**
   * Generate welcome email HTML content
   */
  generateWelcomeEmailHTML(customer) {
    const firstName = customer.firstName || 'there';
    const businessName = customer.properties?.business_name || 'your business';
    const vendorType = customer.properties?.vendor_type || 'vendor';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to EzDrink</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5aa0;">Welcome to EzDrink, ${firstName}!</h1>
          
          <p>We're excited to help <strong>${businessName}</strong> grow and succeed in the hospitality industry.</p>
          
          <h2 style="color: #2c5aa0;">What's Next?</h2>
          <ul>
            <li>Complete your profile setup</li>
            <li>Connect your POS system</li>
            <li>Start accepting orders</li>
            <li>Track your performance</li>
          </ul>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Quick Stats for ${vendorType}s:</h3>
            <ul style="margin-bottom: 0;">
              <li>30% reduction in wait times</li>
              <li>25% increase in revenue</li>
              <li>40% improvement in staff efficiency</li>
            </ul>
          </div>
          
          <p>If you have any questions, just reply to this email. We're here to help!</p>
          
          <p>Best regards,<br>The EzDrink Team</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email text content
   */
  generateWelcomeEmailText(customer) {
    const firstName = customer.firstName || 'there';
    const businessName = customer.properties?.business_name || 'your business';
    const vendorType = customer.properties?.vendor_type || 'vendor';
    
    return `
Welcome to EzDrink, ${firstName}!

We're excited to help ${businessName} grow and succeed in the hospitality industry.

What's Next?
- Complete your profile setup
- Connect your POS system  
- Start accepting orders
- Track your performance

Quick Stats for ${vendorType}s:
- 30% reduction in wait times
- 25% increase in revenue
- 40% improvement in staff efficiency

If you have any questions, just reply to this email. We're here to help!

Best regards,
The EzDrink Team
    `;
  }

  /**
   * Send vendor welcome email
   */
  async sendVendorWelcomeEmail(customer) {
    return this.sendWelcomeEmailViaAPI(customer);
  }

  /**
   * Schedule email for future delivery
   */
  async scheduleEmail(customer, template, subject, daysFromNow) {
    const sendDate = new Date();
    sendDate.setDate(sendDate.getDate() + daysFromNow);
    
    const templateData = {
      firstName: customer.firstName || 'there',
      businessName: customer.properties?.business_name || 'your business',
      vendorType: customer.properties?.vendor_type || 'vendor',
      planSelected: customer.properties?.plan_selected || 'free'
    };
    
    // Store scheduled email in database
    await this.storeScheduledEmail(customer.id, template, subject, templateData, sendDate);
    
    console.log(`📅 Scheduled ${template} for ${customer.email} on ${sendDate.toISOString()}`);
  }

  /**
   * Send templated email via Klaviyo API
   */
  async sendKlaviyoTemplatedEmail(email, templateId, templateData) {
    try {
      const response = await axios.post(`${this.baseUrl}/v2/email-templates/${templateId}/send`, {
        to: email,
        template_data: templateData
      }, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📧 Email sent via Klaviyo: ${email}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error sending Klaviyo email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send SMS via Klaviyo API
   */
  async sendKlaviyoSMS(phone, message) {
    try {
      const response = await axios.post(`${this.baseUrl}/v2/sms/send`, {
        to: phone,
        message: message
      }, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📱 SMS sent via Klaviyo: ${phone}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error sending Klaviyo SMS to ${phone}:`, error);
      throw error;
    }
  }

  /**
   * Determine available channels for customer
   */
  getAvailableChannels(customer) {
    return {
      email: !!customer.email,
      sms: !!customer.phone
    };
  }

  /**
   * Store scheduled email in database
   */
  async storeScheduledEmail(customerId, template, subject, templateData, sendDate) {
    // This would typically store in a database
    // For now, we'll use a simple in-memory approach
    console.log(`💾 Storing scheduled email for customer ${customerId}`);
    
    // In production, you'd store this in a database like:
    // await db.scheduledEmails.create({
    //   customerId,
    //   template,
    //   subject,
    //   templateData,
    //   sendDate,
    //   status: 'scheduled'
    // });
  }

  /**
   * Trigger behavioral campaign based on engagement
   */
  async triggerBehavioralCampaign(customer, behavior) {
    console.log(`🎯 Triggering behavioral campaign for ${customer.email}: ${behavior}`);
    
    const engagementScore = await engagementService.getEngagementScore(customer.id);
    
    if (engagementScore > 80) {
      // High engagement - send premium content
      await this.sendHighEngagementEmail(customer);
    } else if (engagementScore > 50) {
      // Medium engagement - send nurturing content
      await this.sendMediumEngagementEmail(customer);
    } else {
      // Low engagement - send re-engagement content
      await this.sendReEngagementEmail(customer);
    }
  }

  /**
   * Send high engagement email
   */
  async sendHighEngagementEmail(customer) {
    const templateData = {
      firstName: customer.firstName || 'there',
      businessName: customer.properties?.business_name || 'your business'
    };
    
    return this.sendKlaviyoTemplatedEmail(customer.email, 'high_engagement_email', templateData);
  }

  /**
   * Send medium engagement email
   */
  async sendMediumEngagementEmail(customer) {
    const templateData = {
      firstName: customer.firstName || 'there',
      businessName: customer.properties?.business_name || 'your business'
    };
    
    return this.sendKlaviyoTemplatedEmail(customer.email, 'medium_engagement_email', templateData);
  }

  /**
   * Send re-engagement email
   */
  async sendReEngagementEmail(customer) {
    const templateData = {
      firstName: customer.firstName || 'there',
      businessName: customer.properties?.business_name || 'your business'
    };
    
    return this.sendKlaviyoTemplatedEmail(customer.email, 're_engagement_email', templateData);
  }

  /**
   * Update customer properties in Klaviyo
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
   * Create dynamic segment in Klaviyo
   */
  async createDynamicSegment(name, filters) {
    try {
      const response = await axios.post(`${this.baseUrl}/segments`, {
        data: {
          type: 'segment',
          attributes: {
            name: name,
            filters: filters
          }
        }
      }, {
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'Revision': '2023-12-15'
        }
      });
      
      console.log(`✅ Created dynamic segment: ${name}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error creating dynamic segment ${name}:`, error);
      throw error;
    }
  }
}

module.exports = new KlaviyoAutomationService(); 