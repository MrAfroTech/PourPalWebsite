# Stripe Integration Setup

## 1. Environment Variables

Create a `.env` file in your project root with your Stripe keys:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# React App Environment Variables (for frontend)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 2. Running the Application

### Development Mode (with payment processing):
```bash
# Terminal 1: Start the backend server
npm run dev:server

# Terminal 2: Start the React app
npm start
```

### Production Mode (frontend only):
```bash
npm start
```

## 3. How It Works

1. **User fills out signup form** at `/signup`
2. **Form data is sent** to `/api/create-checkout-session`
3. **Stripe checkout session** is created with subscription details
4. **User is redirected** to Stripe Checkout for payment
5. **After payment**, user is redirected to `/signup-success`

## 4. Plan Pricing

- **Basic Plan**: $49/month
- **Premium Plan**: $99/month  
- **Enterprise Plan**: $199/month

## 5. Form Data Collected

- Business Name, Owner Name, Email, Phone
- Complete business address
- Business type, years in business, revenue range
- Number of locations, current POS system
- Selected plan

## 6. Success Flow

After successful payment, users are redirected to `/signup-success` with:
- Confirmation message
- Next steps instructions
- Support contact information

## 7. Testing

- Use Stripe test cards for testing
- Test publishable key: `pk_test_...`
- Test secret key: `sk_test_...` 