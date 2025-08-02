import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import FoodTruckMap from './FoodTruckMap';
import '../styles/EzFestSignup.css';

// Initialize Stripe with environment variable
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const EzDrinkSignup = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    foodTruckType: '',
    cuisineType: '',
    yearsInBusiness: '',
    averageDailyRevenue: '',
    numberOfTrucks: '1',
    plan: 'free'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      period: 'Forever Free',
      features: [
        'List your menu on the festival map',
        'Showcase basic vendor info to attendees',
        'Be discoverable in event search & maps',
        'Access event schedules & attendee flow',
        'Get visibility in festival discovery tools',
        'Event Notifications',
        'Personalized QR Code',
        'List Of Daily Specials'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 39.99,
      period: 'Per Month',
      features: [
        'Includes all Free Plan benefits',
        'Accept mobile orders & payments in-app',
        'Real-time order status & tracking',
        'Basic sales & performance analytics',
        'Customer order history for repeat sales',
        'Full control of your menu in real time'
      ]
    },
    {
      id: 'ultimate',
      name: 'Ultimate Plan',
      price: 79.99,
      period: 'Per Month',
      features: [
        'Includes all Pro Plan features',
        'Personalized recommendations to attract new customers',
        'Exclusive placement & priority vendor visibility',
        'Advanced analytics with sales insights & trends',
        'Priority support for faster issue resolution'
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.plan === 'free') {
        // For free plan, just show success
        console.log('Free plan signup:', formData);
        setSuccess(true);
      } else {
        // For paid plans, process payment
        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        // Create checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            plan: formData.plan
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create checkout session');
        }

        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.sessionId,
        });

        if (result.error) {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(plan => plan.id === formData.plan);

  return (
    <div className="ezfest-signup">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Join EzFest</h1>
          <p>Connect your food truck to thousands of hungry festival-goers</p>
          <div className="festival-info">
            <span>📍 Central Park, New York</span>
            <span>📅 September 15-17, 2024</span>
            <span>⚡ Powered by Seamless</span>
          </div>
        </div>

        <div className="signup-content">
          <div className="map-section">
            <h2>Festival Map Preview</h2>
            <div className="map-info">
              <span>🎪 8 Food Trucks</span>
              <span>📍 Central Park</span>
              <span>🎵 Live Music</span>
            </div>
            <FoodTruckMap />
          </div>

          <div className="form-section">
            <div className="plan-selection">
              <h2>Choose Your Plan</h2>
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${formData.plan === plan.id ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                  >
                    <div className="plan-header">
                      <h3>{plan.name}</h3>
                      <div className="plan-price">
                        {plan.price === 0 ? (
                          <span className="free">FREE</span>
                        ) : (
                          <>
                            <span className="currency">$</span>
                            <span className="amount">{plan.price}</span>
                            <span className="period">/{plan.period}</span>
                          </>
                        )}
                      </div>
                      {plan.id !== 'free' && (
                        <div className="promo-badge">
                          🎉 2 MONTHS FREE - LIMITED TIME!
                        </div>
                      )}
                    </div>
                    <ul className="plan-features">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <div className="plan-selector">
                      <div className={`radio-button ${formData.plan === plan.id ? 'selected' : ''}`}>
                        {formData.plan === plan.id && <div className="radio-dot"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <h2>Food Truck Information</h2>
              
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="businessName">Food Truck Name *</label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ownerName">Owner Name *</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Food Truck Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cuisineType">Cuisine Type *</label>
                    <select
                      id="cuisineType"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Cuisine Type</option>
                      <option value="mexican">Mexican</option>
                      <option value="american">American</option>
                      <option value="italian">Italian</option>
                      <option value="asian">Asian</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="vegetarian">Vegetarian/Vegan</option>
                      <option value="dessert">Dessert</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="yearsInBusiness">Years in Business</label>
                    <select
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Years</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="averageDailyRevenue">Average Daily Revenue</label>
                    <select
                      id="averageDailyRevenue"
                      name="averageDailyRevenue"
                      value={formData.averageDailyRevenue}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Range</option>
                      <option value="0-500">$0 - $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2000">$1,000 - $2,000</option>
                      <option value="2000-5000">$2,000 - $5,000</option>
                      <option value="5000+">$5,000+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="numberOfTrucks">Number of Trucks</label>
                    <select
                      id="numberOfTrucks"
                      name="numberOfTrucks"
                      value={formData.numberOfTrucks}
                      onChange={handleInputChange}
                    >
                      <option value="1">1 truck</option>
                      <option value="2-3">2-3 trucks</option>
                      <option value="4-5">4-5 trucks</option>
                      <option value="5+">5+ trucks</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <h3>Welcome to EzFest!</h3>
                  <p>Your free plan application has been submitted successfully. We'll contact you within 24 hours to confirm your participation and provide your personalized QR code.</p>
                  <p>You can also reach us directly at <a href="mailto:ezfest@ezdrink.us">ezfest@ezdrink.us</a></p>
                </div>
              )}

              <div className="form-summary">
                <div className="selected-plan-summary">
                  <h3>Selected Plan: {selectedPlan.name}</h3>
                  {selectedPlan.price === 0 ? (
                    <p className="plan-price-display">FREE</p>
                  ) : (
                    <p className="plan-price-display">${selectedPlan.price}/{selectedPlan.period}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                  selectedPlan.price === 0 ? 
                    'Submit Free Application' : 
                    `Start Your ${selectedPlan.name} - $${selectedPlan.price}/${selectedPlan.period}`
                }
              </button>

              <div className="form-disclaimer">
                <p>
                  By clicking the button above, you agree to our{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                  {selectedPlan.price === 0 ? 
                    ' We\'ll contact you within 24 hours to confirm your participation.' :
                    ' Your payment will be processed securely through Stripe.'
                  }
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EzDrinkSignup; 