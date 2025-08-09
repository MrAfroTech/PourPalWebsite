# Klaviyo Email Confirmation Template

## Overview
This is a custom email confirmation template designed for Klaviyo that matches the EzDrink brand identity. The template is fully responsive and compatible with major email clients.

## Files Included
- `klaviyo-confirmation-template.html` - Main email template with inline styles
- `klaviyo-confirmation-styles.css` - Reference CSS file (for development only)
- `KLAVIYO_EMAIL_TEMPLATE_README.md` - This documentation file

## Brand Customization

### Current Brand Colors
The template is currently configured with EzDrink brand colors:
- **Primary Brown**: `#8B4513` (Saddle Brown)
- **Secondary Brown**: `#D2691E` (Saddle Brown variant)
- **Accent Gold**: `#FFD700` (Gold)

### How to Customize Colors

#### Option 1: Direct HTML Editing
In `klaviyo-confirmation-template.html`, find and replace these color values:

```html
<!-- Replace these color values throughout the file -->
#8B4513  → Your primary brand color
#D2691E  → Your secondary brand color  
#FFD700  → Your accent color
```

#### Option 2: Using CSS Variables (Reference Only)
In `klaviyo-confirmation-styles.css`, update the CSS variables:

```css
:root {
    --brand-primary: #YOUR_PRIMARY_COLOR;
    --brand-secondary: #YOUR_SECONDARY_COLOR;
    --brand-accent: #YOUR_ACCENT_COLOR;
}
```

**Note**: CSS variables don't work in email clients, so you must manually replace colors in the HTML file.

### Brand Assets to Replace

#### 1. Logo
Replace the placeholder logo URL:
```html
<!-- Current placeholder -->
<img src="https://via.placeholder.com/200x60/8B4513/FFFFFF?text=EzDrink+Logo" alt="EzDrink Logo">

<!-- Replace with your actual logo -->
<img src="https://your-domain.com/logo.png" alt="Your Brand Logo">
```

#### 2. Brand Name
Update all instances of "EzDrink" with your brand name:
```html
<!-- Header -->
<h1>Welcome to Your Brand!</h1>

<!-- Footer -->
<p><strong>Your Brand</strong> - Your Tagline</p>
```

#### 3. Contact Information
Update contact details in the footer:
```html
<!-- Email -->
<a href="mailto:hello@yourbrand.com">hello@yourbrand.com</a>

<!-- Website -->
<a href="https://yourbrand.com">yourbrand.com</a>
```

#### 4. Social Media Links
Replace the placeholder social media links:
```html
<!-- Facebook -->
<a href="https://facebook.com/yourbrand">...</a>

<!-- Twitter -->
<a href="https://twitter.com/yourbrand">...</a>

<!-- LinkedIn -->
<a href="https://linkedin.com/company/yourbrand">...</a>
```

## Content Customization

### Editable Text Elements

#### 1. Subject Line
Set this in your Klaviyo campaign settings:
```
Confirm Your Subscription to [Brand Name]
```

#### 2. Header Content
```html
<h1>Welcome to [Your Brand]!</h1>
<p>[Your Brand Tagline]</p>
```

#### 3. Main Message
```html
<h2>Confirm Your Subscription</h2>
<p>Thank you for subscribing to [Your Brand]! We're excited to keep you updated with [your value proposition].</p>
```

#### 4. Button Text
```html
<a href="{{ confirmation_url }}">Yes, I want to subscribe</a>
```

#### 5. Footer Content
```html
<p><strong>[Your Brand]</strong> - [Your Tagline]</p>
<p>Questions? Contact us at <a href="mailto:[your-email]">[your-email]</a></p>
```

## Technical Features

### Responsive Design
- Mobile-first approach
- Breakpoint at 600px
- Optimized for touch interfaces
- Flexible button sizing

### Email Client Compatibility
- **Gmail**: Full support
- **Outlook**: Tested with fixes
- **Apple Mail**: Optimized
- **Mobile clients**: Responsive design

### Accessibility Features
- Semantic HTML structure
- Alt text for images
- High contrast support
- Screen reader friendly

### Security Features
- 24-hour link expiration notice
- Clear unsubscribe options
- Privacy policy links

## Implementation in Klaviyo

### Step 1: Create New Template
1. Log into your Klaviyo account
2. Go to **Templates** → **Create New Template**
3. Choose **Blank Template**

### Step 2: Import HTML
1. Copy the entire content from `klaviyo-confirmation-template.html`
2. Paste into the HTML editor in Klaviyo
3. Switch to **Design** view to preview

### Step 3: Configure Variables
1. Replace `{{ confirmation_url }}` with Klaviyo's confirmation URL variable
2. Set up your brand colors and assets
3. Update all placeholder content

### Step 4: Test and Deploy
1. Send test emails to yourself
2. Test on multiple devices and email clients
3. Verify all links work correctly
4. Deploy to your confirmation flow

## Testing Checklist

### Email Client Testing
- [ ] Gmail (desktop and mobile)
- [ ] Outlook (desktop and mobile)
- [ ] Apple Mail
- [ ] Yahoo Mail
- [ ] Hotmail/Outlook.com

### Device Testing
- [ ] iPhone (various screen sizes)
- [ ] Android (various screen sizes)
- [ ] Desktop (Windows, Mac, Linux)

### Functionality Testing
- [ ] Confirmation button works
- [ ] All links are clickable
- [ ] Images load properly
- [ ] Text is readable
- [ ] No broken elements

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Keyboard navigation
- [ ] Alt text for images

## Troubleshooting

### Common Issues

#### 1. Images Not Loading
- Ensure all image URLs are absolute (https://)
- Check that images are publicly accessible
- Consider hosting images on a CDN

#### 2. Styling Issues in Outlook
- Use table-based layouts
- Avoid CSS properties not supported by Outlook
- Test with Outlook-specific fixes

#### 3. Mobile Display Problems
- Check viewport meta tag
- Ensure responsive breakpoints are correct
- Test button sizes for touch interaction

#### 4. Links Not Working
- Verify all URLs are correct
- Test confirmation URL in Klaviyo
- Check for broken redirects

### Performance Optimization
- Optimize images (compress, resize)
- Minimize HTML size
- Use web-safe fonts
- Limit external dependencies

## Support and Maintenance

### Regular Updates
- Test template quarterly
- Update brand assets as needed
- Monitor email client changes
- Keep contact information current

### Analytics Tracking
- Monitor open rates
- Track click-through rates
- Analyze conversion rates
- A/B test different elements

## Legal Compliance

### Required Elements
- Unsubscribe link
- Physical address (if applicable)
- Privacy policy link
- Clear sender identification

### Best Practices
- Honest subject lines
- Clear value proposition
- Easy unsubscribe process
- Respect user preferences

## Customization Examples

### Example 1: Restaurant Brand
```html
<!-- Colors -->
Primary: #D4AF37 (Gold)
Secondary: #2C1810 (Dark Brown)
Accent: #FFFFFF (White)

<!-- Content -->
<h1>Welcome to [Restaurant Name]!</h1>
<p>Exclusive dining experiences and special offers</p>
```

### Example 2: Tech Startup
```html
<!-- Colors -->
Primary: #007ACC (Blue)
Secondary: #1E1E1E (Dark Gray)
Accent: #00D4AA (Teal)

<!-- Content -->
<h1>Welcome to [Startup Name]!</h1>
<p>Innovation and technology insights</p>
```

### Example 3: Fashion Brand
```html
<!-- Colors -->
Primary: #FF6B9D (Pink)
Secondary: #2D2D2D (Charcoal)
Accent: #F8F8F8 (Light Gray)

<!-- Content -->
<h1>Welcome to [Fashion Brand]!</h1>
<p>Style inspiration and exclusive collections</p>
```

## Contact Information

For questions about this template or customization help:
- **Email**: hello@ezdrink.com
- **Website**: https://ezdrink.com
- **Documentation**: This README file

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Compatibility**: Klaviyo, Major Email Clients 