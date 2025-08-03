import React, { useState } from 'react';

const EzDrinkSignup = () => {
    const [selectedPlan, setSelectedPlan] = useState('');

    const handlePlanChange = (e) => {
        setSelectedPlan(e.target.value);
        const creditCardSection = document.getElementById('credit-card-section');
        if (e.target.value === 'pro' || e.target.value === 'ultimate') {
            creditCardSection.style.display = 'block';
        } else {
            creditCardSection.style.display = 'none';
        }
    };

    return (
        <div className="wine-walk-container">
            <div className="wine-walk-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                {/* Sales Copy - Left Side */}
                <div style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
                    padding: '40px',
                    borderRadius: '15px',
                    color: '#0a0a0a',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    height: 'fit-content'
                }}>
                    <h3 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#0a0a0a'
                    }}>
                        💸 Stop Losing Sales to Long Lines
                    </h3>
                    
                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>You're hemorrhaging money every day.</strong> Customers abandon your line after 8 minutes. That's $20-30 walking away every few minutes during peak hours.
                    </p>
                    
                    <div style={{
                        background: '#dc3545',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
                    }}>
                        🎪 The Fair Vendor Reality
                    </div>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>Saturday at 1 PM. Lunch rush hits.</strong> Your line stretches 20 people deep. New customers see the crowd and keep walking. Families can't find your booth and end up at competitors instead.
                    </p>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>By 3 PM, you've lost hundreds to:</strong>
                    </p>
                    
                    <ul style={{
                        fontSize: '17px',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        color: '#0a0a0a',
                        textAlign: 'left',
                        paddingLeft: '20px'
                    }}>
                        <li style={{ marginBottom: '8px' }}>Line abandonment (customers give up waiting)</li>
                        <li style={{ marginBottom: '8px' }}>Discovery problems (they can't find you in the crowd)</li>
                        <li style={{ marginBottom: '8px' }}>Peak hour chaos (overwhelmed staff = slow service)</li>
                    </ul>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: 'bold'
                    }}>
                        This isn't just frustration. It's a revenue crisis.
                    </p>
                    
                    <div style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
                    }}>
                        🚀 Seamless Captures Every Lost Sale
                    </div>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        Customers scan your QR code from anywhere at the fair. Order while walking to you. Skip the line entirely.
                    </p>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>The transformation:</strong>
                    </p>
                    
                    <ul style={{
                        fontSize: '17px',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        color: '#0a0a0a',
                        textAlign: 'left',
                        paddingLeft: '20px'
                    }}>
                        <li style={{ marginBottom: '8px' }}><strong>Zero line abandonment</strong> - they commit before seeing the crowd</li>
                        <li style={{ marginBottom: '8px' }}><strong>Capture wandering customers</strong> - they find you from across the fairgrounds</li>
                        <li style={{ marginBottom: '8px' }}><strong>Serve 3x more customers</strong> during rush periods</li>
                        <li style={{ marginBottom: '8px' }}><strong>Higher order values</strong> - customers browse without pressure</li>
                    </ul>
                    
                    <div style={{
                        background: '#ff6b35',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(255, 107, 53, 0.3)'
                    }}>
                        📊 The Numbers Don't Lie
                    </div>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>Average vendor using Seamless:</strong>
                    </p>
                    
                    <ul style={{
                        fontSize: '17px',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        color: '#0a0a0a',
                        textAlign: 'left',
                        paddingLeft: '20px'
                    }}>
                        <li style={{ marginBottom: '8px' }}>$300-600 additional revenue per day</li>
                        <li style={{ marginBottom: '8px' }}>40-60% more orders during peak hours</li>
                        <li style={{ marginBottom: '8px' }}>Zero customers walking away from lines</li>
                    </ul>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>Do the math:</strong> A 3-day fair could net you an extra $900-1,800.
                    </p>
                    
                    <div style={{
                        background: '#d4af37',
                        color: '#0a0a0a',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(212, 175, 55, 0.3)'
                    }}>
                        🔄 One Setup. Every Event. Forever.
                    </div>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        Your account follows you everywhere. County fair, food festival, holiday market - same system, instant customer access. No matter how crowded, customers find you with one scan.
                    </p>
                    
                    <div style={{
                        background: '#dc3545',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
                    }}>
                        ⚡ While Your Competitors Lose Sales...
                    </div>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>You're capturing them.</strong> While they watch customers walk away, you're processing orders smoothly and outearning everyone around you.
                    </p>
                    
                    <p style={{
                        fontSize: '17px',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                        color: '#0a0a0a',
                        fontWeight: '500'
                    }}>
                        <strong>Every fair without Seamless is money left on the table.</strong>
                    </p>
                    
                    <div style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
                    }}>
                        🚀 [Get Started Now] — Setup takes 5 minutes. Your next event could be your most profitable yet.
                    </div>
                </div>

                {/* Pricing Tiers and Registration Form - Right Side */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px'
                }}>
                    {/* Pricing Tiers */}
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                        <h3 style={{ 
                            textAlign: 'center', 
                            marginBottom: '20px', 
                            color: '#d4af37',
                            fontSize: '24px'
                        }}>
                            🎪 Choose Your Plan
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Free Plan */}
                            <div style={{
                                background: 'rgba(26, 26, 26, 0.8)',
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                padding: '25px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '18px', color: '#d4af37', marginBottom: '8px', fontWeight: 'bold' }}>⭐ Free Plan</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '5px' }}>$0</div>
                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>Forever Free</div>
                                <div style={{ fontSize: '15px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>
                                    <div style={{ marginBottom: '8px' }}>✓ List your menu on festival map</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Basic vendor info showcase</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Event notifications</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Personalized QR code</div>
                                </div>
                            </div>

                            {/* Pro Plan */}
                            <div style={{
                                background: 'rgba(26, 26, 26, 0.8)',
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                padding: '25px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '18px', color: '#d4af37', marginBottom: '8px', fontWeight: 'bold' }}>💼 Pro Plan</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '5px' }}>$39.99</div>
                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Per Month</div>
                                <div style={{ 
                                    background: '#ff6b35', 
                                    color: 'white', 
                                    fontSize: '14px', 
                                    fontWeight: 'bold', 
                                    padding: '6px 12px', 
                                    borderRadius: '10px', 
                                    marginBottom: '15px',
                                    display: 'inline-block'
                                }}>
                                    🎉 2 MONTHS FREE
                                </div>
                                <div style={{ fontSize: '15px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>
                                    <div style={{ marginBottom: '8px' }}>✓ All Free features</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Mobile orders & payments</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Real-time tracking</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Sales analytics</div>
                                </div>
                            </div>

                            {/* Ultimate Plan */}
                            <div style={{
                                background: 'rgba(26, 26, 26, 0.8)',
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                padding: '25px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '18px', color: '#d4af37', marginBottom: '8px', fontWeight: 'bold' }}>🚀 Ultimate Plan</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '5px' }}>$79.99</div>
                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Per Month</div>
                                <div style={{ 
                                    background: '#ff6b35', 
                                    color: 'white', 
                                    fontSize: '14px', 
                                    fontWeight: 'bold', 
                                    padding: '6px 12px', 
                                    borderRadius: '10px', 
                                    marginBottom: '15px',
                                    display: 'inline-block'
                                }}>
                                    🎉 2 MONTHS FREE
                                </div>
                                <div style={{ fontSize: '15px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>
                                    <div style={{ marginBottom: '8px' }}>✓ All Pro features</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Priority vendor visibility</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Advanced analytics</div>
                                    <div style={{ marginBottom: '8px' }}>✓ Priority support</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div style={{
                        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                        padding: '40px',
                        borderRadius: '15px',
                        color: 'white'
                    }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '32px' }}>
                            🎪 Vendor Registration
                        </h2>
                        
                        <form style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Select Your Plan *
                                </label>
                                <select 
                                    required
                                    value={selectedPlan}
                                    onChange={handlePlanChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '16px'
                                    }}
                                >
                                    <option value="">Choose your plan</option>
                                    <option value="free">⭐ Free Plan - $0/month</option>
                                    <option value="pro">💼 Pro Plan - $39.99/month (2 months free!)</option>
                                    <option value="ultimate">🚀 Ultimate Plan - $79.99/month (2 months free!)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Vendor Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Business Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                        placeholder="Your business name"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Vendor Type *
                                    </label>
                                    <select 
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Cuisine Type
                                    </label>
                                    <select 
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <option value="">Select cuisine (if food truck)</option>
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Email *
                                    </label>
                                    <input 
                                        type="email" 
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Phone Number *
                                    </label>
                                    <input 
                                        type="tel" 
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '16px'
                                        }}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    POS System
                                </label>
                                <select 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '16px'
                                    }}
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
                            <div id="credit-card-section" style={{ 
                                marginBottom: '20px',
                                padding: '20px',
                                background: 'rgba(40, 167, 69, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(40, 167, 69, 0.3)',
                                display: 'none'
                            }}>
                                <h4 style={{ 
                                    textAlign: 'center', 
                                    marginBottom: '15px', 
                                    color: '#28a745',
                                    fontSize: '18px'
                                }}>
                                    💳 Payment Information
                                </h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#28a745' }}>
                                            Card Number *
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '16px'
                                            }}
                                            placeholder="1234 5678 9012 3456"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#28a745' }}>
                                            Expiry Date *
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '16px'
                                            }}
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#28a745' }}>
                                            CVV *
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '16px'
                                            }}
                                            placeholder="123"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#28a745' }}>
                                            Name on Card *
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '16px'
                                            }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                                <button 
                                    type="submit"
                                    style={{
                                        background: 'linear-gradient(135deg, #d4af37, #f5d76e)',
                                        color: '#0a0a0a',
                                        border: 'none',
                                        padding: '15px 40px',
                                        borderRadius: '25px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    🚀 Register as Vendor
                                </button>
                            </div>

                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '20px', 
                                fontSize: '14px', 
                                opacity: 0.8 
                            }}>
                                <p>Registration includes CRM integration and Stripe payment processing</p>
                                <p>We'll contact you within 24 hours to complete your setup</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EzDrinkSignup;