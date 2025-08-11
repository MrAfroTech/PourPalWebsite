import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import '../styles/DirectSignup.css';

const DirectSignup = () => {
    const [selectedPlan, setSelectedPlan] = useState('');
    const [stripe, setStripe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        businessName: '',
        vendorType: '',
        cuisineType: '',
        email: '',
        phone: '',
        posSystem: '',
        selectedPlan: '',
    });

    // Initialize Stripe
    useEffect(() => {
        const initStripe = async () => {
            const stripeInstance = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
            setStripe(stripeInstance);
        };
        initStripe();

        // Set page title
        document.title = "Seamless | Views, Venues, Vibes and Vendors.";

        // Handle URL parameters for pre-selecting plan
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');
        if (planParam && ['free', 'pro', 'ultimate'].includes(planParam)) {
            setSelectedPlan(planParam);
            setFormData(prev => ({ ...prev, selectedPlan: planParam }));
            
            // Show/hide sections based on pre-selected plan
            setTimeout(() => {
                const creditCardSection = document.getElementById('credit-card-section');
                const posSystemSection = document.getElementById('pos-system-section');
                
                if (planParam === 'pro' || planParam === 'ultimate') {
                    if (creditCardSection) creditCardSection.style.display = 'block';
                    if (posSystemSection) posSystemSection.style.display = 'block';
                } else {
                    if (creditCardSection) creditCardSection.style.display = 'none';
                    if (posSystemSection) posSystemSection.style.display = 'none';
                }
            }, 100);
        }
    }, []);

    const handlePlanChange = (e) => {
        const plan = e.target.value;
        console.log('🔄 Plan change detected:', { plan, eventTarget: e.target.value });
        setSelectedPlan(plan);
        setFormData(prev => {
            const newData = { ...prev, selectedPlan: plan };
            console.log('📝 Updated form data:', newData);
            return newData;
        });
        
        const creditCardSection = document.getElementById('credit-card-section');
        const posSystemSection = document.getElementById('pos-system-section');
        
        if (plan === 'pro' || plan === 'ultimate') {
            creditCardSection.style.display = 'block';
            posSystemSection.style.display = 'block';
        } else {
            creditCardSection.style.display = 'none';
            posSystemSection.style.display = 'none';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('🔄 Input change detected:', { name, value, eventTarget: e.target.value });
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            console.log('📝 Updated form data:', newData);
            return newData;
        });
        
        // Show/hide cuisine type based on vendor type
        if (name === 'vendorType') {
            const cuisineTypeSection = document.getElementById('cuisine-type-section');
            if (value === 'food-truck') {
                cuisineTypeSection.style.display = 'block';
            } else {
                cuisineTypeSection.style.display = 'none';
                // Clear cuisine type when vendor type changes
                setFormData(prev => ({ ...prev, cuisineType: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 Form submission started');
        console.log('📋 Complete formData state:', formData);
        console.log('🔍 Field validation check:', {
            businessName: formData.businessName,
            vendorType: formData.vendorType,
            email: formData.email,
            phone: formData.phone,
            selectedPlan: formData.selectedPlan
        });
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('✅ Form validation started');
            console.log('📋 Current form data:', formData);
            
            // Validate form - check all required fields including dropdowns
            if (!formData.businessName || !formData.vendorType || 
                !formData.email || !formData.phone || !formData.selectedPlan) {
                console.log('❌ Form validation failed');
                console.log('🔍 Validation details:', {
                    businessName: !!formData.businessName,
                    vendorType: !!formData.vendorType,
                    email: !!formData.email,
                    phone: !!formData.phone,
                    selectedPlan: !!formData.selectedPlan
                });
                throw new Error('Please fill in all required fields');
            }

            console.log('✅ Form validation passed');
            console.log('🎯 Proceeding with plan:', formData.selectedPlan);

            // For paid plans, validate payment fields
            if (formData.selectedPlan === 'pro' || formData.selectedPlan === 'ultimate') {
                console.log('💳 Validating payment fields for paid plan');
                const cardNumber = document.getElementById('card-number')?.value;
                const expiryDate = document.getElementById('expiry-date')?.value;
                const cvv = document.getElementById('cvv')?.value;
                const nameOnCard = document.getElementById('name-on-card')?.value;

                console.log('💳 Payment field values:', { cardNumber: !!cardNumber, expiryDate: !!expiryDate, cvv: !!cvv, nameOnCard: !!nameOnCard });

                if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
                    console.log('❌ Payment validation failed');
                    throw new Error('Please fill in all payment information');
                }
                console.log('✅ Payment validation passed');
            } else {
                console.log('🆓 Free plan - skipping payment validation');
            }

            // Handle free plan registration
            if (formData.selectedPlan === 'free') {
                console.log('🆓 Processing free plan registration');
                console.log('📋 Complete form data being sent:', formData);
                
                const requestBody = {
                    ...formData,
                    plan: 'free'
                };
                console.log('📤 Request body being sent to API:', requestBody);
                
                const response = await fetch('/api/vendor-registration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log('📥 API response status:', response.status);
                console.log('📥 API response headers:', Object.fromEntries(response.headers.entries()));
                
                const result = await response.json();
                console.log('📧 Free plan registration response:', result);

                if (result.success) {
                    console.log('✅ Free plan registration successful');
                    console.log('📧 Klaviyo Profile ID:', result.klaviyoProfileId);
                    setSuccess(result.message);
                    // Reset form
                    setFormData({
                        businessName: '',
                        vendorType: '',
                        cuisineType: '',
                        email: '',
                        phone: '',
                        posSystem: '',
                        selectedPlan: '',
                    });
                    setSelectedPlan('');
                    document.getElementById('cuisine-type-section').style.display = 'none';
                } else {
                    console.log('❌ Free plan registration failed:', result.error);
                    throw new Error(result.error || 'Registration failed');
                }
            }
        } catch (error) {
            console.log('❌ Form submission error:', error);
            console.log('❌ Error message:', error.message);
            console.log('❌ Error stack:', error.stack);
            setError(error.message);
        } finally {
            console.log('🏁 Form submission completed');
            setLoading(false);
        }
    };

    return (
        <div className="direct-signup-container">
            <div className="direct-signup-inner">
                {/* Horizontal layout with tiers in a row */}
                <div className="signup-layout">
                    {/* Pricing Tiers Row */}
                    <div className="pricing-row">
                        <h2 className="pricing-title">Choose Your Plan</h2>
                       
                        
                        <div className="pricing-tiers">
                            <div className={`pricing-tier ${selectedPlan === 'free' ? 'selected' : ''}`}>
                                <div className="tier-header">
                                    <h3>Free Plan</h3>
                                    <div className="tier-price">$0<span>/month</span></div>
                                    <div className="tier-period">Forever Free</div>
                                </div>
                                <ul className="tier-features">
                                    <li>✅ List your menu on festival map</li>
                                    <li>✅ Basic vendor info showcase</li>
                                    <li>✅ Event notifications</li>
                                    <li>✅ Personalized QR code</li>
                                    <li>✅ Basic analytics</li>
                                </ul>
                            </div>

                            <div className={`pricing-tier featured ${selectedPlan === 'pro' ? 'selected' : ''}`}>
                                <div className="tier-badge">Most Popular</div>
                                <div className="tier-header">
                                    <h3>Pro Plan</h3>
                                    <div className="tier-price">$39.99<span>/month</span></div>
                                    <div className="tier-period">2 MONTHS FREE</div>
                                </div>
                                <ul className="tier-features">
                                    <li>✅ All Free features</li>
                                    <li>✅ Mobile orders & payments</li>
                                    <li>✅ Real-time tracking</li>
                                    <li>✅ Sales analytics</li>
                                    <li>✅ Customer loyalty program</li>
                                    <li>✅ Priority support</li>
                                </ul>
                            </div>

                            <div className={`pricing-tier ${selectedPlan === 'ultimate' ? 'selected' : ''}`}>
                                <div className="tier-header">
                                    <h3>Ultimate Plan</h3>
                                    <div className="tier-price">$79.99<span>/month</span></div>
                                    <div className="tier-period">2 MONTHS FREE</div>
                                </div>
                                <ul className="tier-features">
                                    <li>✅ All Pro features</li>
                                    <li>✅ Priority vendor visibility</li>
                                    <li>✅ Advanced customization</li>
                                    <li>✅ Premium support</li>
                                    <li>✅ Multi-location management</li>
                                    <li>✅ Advanced reporting</li>
                                </ul>
                            </div>
                        </div>

                        
                    </div>

                    {/* Vendor Registration Form Below */}
                    <div className="form-section">
                        <div className="direct-signup-form">
                            <h2 className="direct-signup-title">
                                Vendor Registration
                            </h2>
                            
                            <div className="direct-signup-form-container">
                                <h3>Complete Your Registration</h3>
                                
                                {error && (
                                    <div className="error-message">
                                        ❌ {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="success-message">
                                        ✅ {success}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div>
                                            <label>
                                                Select Your Plan *
                                            </label>
                                            <select 
                                                required
                                                name="selectedPlan"
                                                value={formData.selectedPlan}
                                                onChange={handlePlanChange}
                                            >
                                                <option value="">Choose your plan</option>
                                                <option value="free">⭐ Free Plan - $0/month</option>
                                                <option value="pro">💼 Pro Plan - $39.99/month (2 months free!)</option>
                                                <option value="ultimate">🚀 Ultimate Plan - $79.99/month (2 months free!)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>
                                                Business Name *
                                            </label>
                                            <input 
                                                type="text" 
                                                name="businessName"
                                                required
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="Your business name"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div>
                                            <label>
                                                Vendor Type *
                                            </label>
                                            <select 
                                                name="vendorType"
                                                required
                                                value={formData.vendorType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select vendor type</option>
                                                <option value="food-truck">Food Truck</option>
                                                <option value="arts-crafts">Arts & Crafts</option>
                                                <option value="jewelry">Jewelry</option>
                                                <option value="clothing">Clothing</option>
                                                <option value="home-decor">Home Decor</option>
                                                <option value="beauty">Beauty & Wellness</option>
                                                <option value="entertainment">Entertainment</option>
                                                <option value="services">Services</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div id="cuisine-type-section" style={{ display: 'none' }}>
                                            <label>
                                                Cuisine Type
                                            </label>
                                            <select 
                                                name="cuisineType"
                                                value={formData.cuisineType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select cuisine type</option>
                                                <option value="mexican">Mexican</option>
                                                <option value="pizza">Pizza</option>
                                                <option value="jamaican">Jamaican</option>
                                                <option value="desserts">Desserts</option>
                                                <option value="bbq">BBQ</option>
                                                <option value="asian">Asian</option>
                                                <option value="mediterranean">Mediterranean</option>
                                                <option value="american">American</option>
                                                <option value="vegetarian">Vegetarian</option>
                                                <option value="seafood">Seafood</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div>
                                            <label>
                                                Email *
                                            </label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label>
                                                Phone Number *
                                            </label>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div id="pos-system-section" className="form-full" style={{ display: 'none' }}>
                                        <label>
                                            POS System
                                        </label>
                                        <select 
                                            name="posSystem"
                                            value={formData.posSystem}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select your POS system</option>
                                            <option value="square">Square</option>
                                            <option value="stripe">Stripe</option>
                                            <option value="paypal">PayPal</option>
                                            <option value="clover">Clover</option>
                                            <option value="toast">Toast</option>
                                            <option value="lightspeed">Lightspeed</option>
                                            <option value="shopify">Shopify</option>
                                            <option value="none">No POS system</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Credit Card Section - Only show for Pro/Ultimate */}
                                    <div id="credit-card-section" className="credit-card-section" style={{ display: 'none' }}>
                                        <h4>
                                            💳 Payment Information
                                        </h4>
                                        
                                        <div className="form-row">
                                            <div>
                                                <label>
                                                    Card Number *
                                                </label>
                                                <input 
                                                    type="text" 
                                                    id="card-number"
                                                    name="card-number"
                                                    placeholder="1234 5678 9012 3456"
                                                />
                                            </div>
                                            <div>
                                                <label>
                                                    Expiry Date *
                                                </label>
                                                <input 
                                                    type="text" 
                                                    id="expiry-date"
                                                    name="expiry-date"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div>
                                                <label>
                                                    CVV *
                                                </label>
                                                <input 
                                                    type="text" 
                                                    id="cvv"
                                                    name="cvv"
                                                    placeholder="123"
                                                />
                                            </div>
                                            <div>
                                                <label>
                                                    Name on Card *
                                                </label>
                                                <input 
                                                    type="text" 
                                                    id="name-on-card"
                                                    name="name-on-card"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="submit-button"
                                        >
                                            {loading ? 'Processing...' : 'Complete Registration'}
                                        </button>
                                    </div>

                                    <div className="form-info">
                                        <p>Registration includes CRM integration and Stripe payment processing</p>
                                        <p>We'll contact you within 24 hours to complete your setup</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectSignup; 