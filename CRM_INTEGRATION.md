# CRM Integration for EzFest Signup Data

## Recommended CRM Solutions

### 1. **HubSpot (Recommended)**
- **Why:** Perfect for event management and vendor relationships
- **Features:** 
  - Free tier available
  - Excellent form integration
  - Automated email sequences
  - Contact management
  - Deal pipeline for paid plans
- **Integration:** Webhook to HubSpot API
- **Cost:** Free tier, then $45/month

### 2. **Airtable**
- **Why:** Great for organizing vendor data and event planning
- **Features:**
  - Database-style organization
  - Custom fields for vendor info
  - Automation capabilities
  - Mobile app
- **Integration:** Direct API integration
- **Cost:** Free tier, then $10/month

### 3. **Mailchimp**
- **Why:** Simple email marketing with CRM features
- **Features:**
  - Email automation
  - Contact management
  - Form integration
  - Event-specific campaigns
- **Integration:** Webhook to Mailchimp API
- **Cost:** Free tier, then $10/month

### 4. **Google Sheets + Zapier**
- **Why:** Budget-friendly option
- **Features:**
  - Free Google Sheets
  - Zapier automations
  - Custom workflows
  - Email notifications
- **Integration:** Zapier webhook
- **Cost:** Free (Zapier has free tier)

## Data Flow Integration

### Form Data Collected:
```json
{
  "businessName": "Taco Fiesta Express",
  "ownerName": "John Smith",
  "email": "john@tacofiesta.com",
  "phone": "555-123-4567",
  "cuisineType": "mexican",
  "yearsInBusiness": "3-5",
  "averageDailyRevenue": "1000-2000",
  "numberOfTrucks": "1",
  "plan": "free|pro|ultimate",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Integration Steps:

1. **Form Submission** → Webhook to CRM
2. **Data Processing** → Create contact/lead
3. **Automated Response** → Welcome email
4. **Follow-up Sequence** → 24-hour contact
5. **Plan-specific Workflow** → Different paths for free vs paid

## Implementation Options

### Option A: HubSpot Integration
```javascript
// Example webhook endpoint
app.post('/api/ezfest-signup', async (req, res) => {
  const { formData } = req.body;
  
  // Send to HubSpot
  const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        email: formData.email,
        firstname: formData.ownerName.split(' ')[0],
        lastname: formData.ownerName.split(' ').slice(1).join(' '),
        phone: formData.phone,
        company: formData.businessName,
        cuisine_type: formData.cuisineType,
        plan_selected: formData.plan,
        event: 'EzFest 2024'
      }
    })
  });
  
  res.json({ success: true });
});
```

### Option B: Airtable Integration
```javascript
// Example webhook endpoint
app.post('/api/ezfest-signup', async (req, res) => {
  const { formData } = req.body;
  
  // Send to Airtable
  const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Vendors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        'Business Name': formData.businessName,
        'Owner Name': formData.ownerName,
        'Email': formData.email,
        'Phone': formData.phone,
        'Cuisine Type': formData.cuisineType,
        'Plan Selected': formData.plan,
        'Status': 'New Lead'
      }
    })
  });
  
  res.json({ success: true });
});
```

## Recommended Implementation

### For EzFest 2024:
1. **Start with HubSpot** (free tier)
2. **Set up automated workflows:**
   - Free plan → Email sequence + manual follow-up
   - Paid plans → Payment processing + onboarding
3. **Create custom properties** for vendor-specific data
4. **Set up email templates** for different plan types

### Next Steps:
1. Choose your preferred CRM
2. Set up the webhook endpoint
3. Create email templates
4. Test the integration
5. Deploy to production

## Contact for Implementation:
- **HubSpot:** hubspot.com
- **Airtable:** airtable.com
- **Mailchimp:** mailchimp.com
- **Zapier:** zapier.com 