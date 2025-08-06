// check-env.js - Check environment variables
require('dotenv').config();

console.log('🔍 Checking Environment Variables\n');

const requiredVars = {
  // Klaviyo
  'KLAVIYO_PRIVATE_API_KEY': {
    description: 'Klaviyo Private API Key',
    required: true,
    getFrom: 'Klaviyo Dashboard → Settings → API Keys'
  },
  'KLAVIYO_LIST_ID': {
    description: 'Klaviyo List ID (vendor signup list)',
    required: true,
    getFrom: 'Klaviyo Dashboard → Lists → Copy List ID'
  },
  'KLAVIYO_WEBHOOK_SECRET': {
    description: 'Klaviyo Webhook Secret (Optional for Flow webhooks)',
    required: false,
    getFrom: 'Klaviyo Dashboard → Settings → Webhooks → Create Webhook'
  },
  
  // Stripe
  'STRIPE_SECRET_KEY': {
    description: 'Stripe Secret Key',
    required: true,
    getFrom: 'Stripe Dashboard → Developers → API Keys'
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Stripe Webhook Secret',
    required: true,
    getFrom: 'Stripe Dashboard → Developers → Webhooks → Add Endpoint'
  },
  'REACT_APP_STRIPE_PUBLISHABLE_KEY': {
    description: 'Stripe Publishable Key (for frontend)',
    required: true,
    getFrom: 'Stripe Dashboard → Developers → API Keys'
  },
  
  // Optional Cross-Platform
  'CLOVER_WEBHOOK_SECRET': {
    description: 'Clover Webhook Secret',
    required: false,
    getFrom: 'Clover Developer Dashboard'
  },
  'SQUARE_WEBHOOK_SECRET': {
    description: 'Square Webhook Secret',
    required: false,
    getFrom: 'Square Developer Dashboard'
  },
  'SHOPIFY_WEBHOOK_SECRET': {
    description: 'Shopify Webhook Secret',
    required: false,
    getFrom: 'Shopify Partner Dashboard'
  },
  
  // Server
  'PORT': {
    description: 'Server Port',
    required: false,
    default: '3001'
  },
  'NODE_ENV': {
    description: 'Environment',
    required: false,
    default: 'development'
  }
};

let missingRequired = [];
let missingOptional = [];
let setVars = [];

console.log('📋 Environment Variables Status:\n');

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('KEY') || varName.includes('SECRET') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    
    console.log(`✅ ${varName}: ${displayValue}`);
    setVars.push(varName);
  } else {
    if (config.required) {
      console.log(`❌ ${varName}: MISSING (Required)`);
      missingRequired.push(varName);
    } else {
      console.log(`⚠️  ${varName}: MISSING (Optional) - Default: ${config.default}`);
      missingOptional.push(varName);
    }
  }
}

console.log('\n📊 Summary:');
console.log(`✅ Set: ${setVars.length}`);
console.log(`❌ Missing Required: ${missingRequired.length}`);
console.log(`⚠️  Missing Optional: ${missingOptional.length}`);

if (missingRequired.length > 0) {
  console.log('\n🔧 Required Variables to Set:');
  console.log('================================');
  
  for (const varName of missingRequired) {
    const config = requiredVars[varName];
    console.log(`\n${varName}:`);
    console.log(`  Description: ${config.description}`);
    console.log(`  Get from: ${config.getFrom}`);
  }
  
  console.log('\n💡 Quick Setup:');
  console.log('1. Copy the variables above');
  console.log('2. Add them to your .env file');
  console.log('3. Restart your server');
  console.log('4. Run the test again');
} else {
  console.log('\n🎉 All required environment variables are set!');
  console.log('You can now run the complete flow test.');
}

if (missingOptional.length > 0) {
  console.log('\n📝 Optional Variables (for advanced features):');
  for (const varName of missingOptional) {
    const config = requiredVars[varName];
    console.log(`  ${varName}: ${config.description}`);
  }
}

console.log('\n🚀 Next Steps:');
if (missingRequired.length === 0) {
  console.log('1. Start server: npm run server');
  console.log('2. Run test: node test-complete-flow.js');
  console.log('3. Check Klaviyo dashboard for automation flows');
} else {
  console.log('1. Set the missing required variables');
  console.log('2. Restart your server');
  console.log('3. Run the test again');
} 