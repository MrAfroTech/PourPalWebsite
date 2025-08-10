// Vendor Signup JavaScript
class VendorSignup {
    constructor() {
        // Prevent multiple initializations
        if (window.vendorSignupInstance) {
            console.warn('VendorSignup already initialized, skipping...');
            return window.vendorSignupInstance;
        }
        
        this.selectedPlan = null;
        this.isSubmitting = false; // Add submission state tracking
        
        // Store instance globally to prevent duplicates
        window.vendorSignupInstance = this;
        
        this.init();
    }

    init() {
        console.log('🚀 VendorSignup initializing...');
        
        // Check for duplicate forms
        this.checkForDuplicateForms();
        
        this.bindEvents();
        this.trackPageView();
        this.autoFocusFirstInput();
    }

    checkForDuplicateForms() {
        // Check for any forms with similar IDs that might cause conflicts
        const allForms = document.querySelectorAll('form');
        const formIds = Array.from(allForms).map(form => form.id).filter(id => id);
        
        console.log('📋 Found forms on page:', formIds);
        
        // Check for potential conflicts
        const duplicateIds = formIds.filter((id, index) => formIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            console.warn('⚠️ Duplicate form IDs detected:', duplicateIds);
        }
        
        // Check for forms with similar names
        const similarForms = formIds.filter(id => 
            id.toLowerCase().includes('signup') || 
            id.toLowerCase().includes('form')
        );
        
        if (similarForms.length > 1) {
            console.log('ℹ️ Multiple signup forms detected:', similarForms);
        }
    }

    bindEvents() {
        // Plan selection
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('get-info-btn')) {
                    this.selectPlan(card);
                }
            });
        });

        // Get info buttons
        document.querySelectorAll('.get-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const planType = btn.getAttribute('data-plan');
                this.showPlanInfo(planType);
            });
        });

        // Form submission - Remove any existing listeners first
        const form = document.getElementById('vendorSignupForm');
        if (form) {
            // Remove any existing submit listeners to prevent duplicates
            form.removeEventListener('submit', this.handleSubmit);
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log('✅ Form submit event bound');
        } else {
            console.warn('⚠️ Vendor signup form not found');
        }

        // Modal close
        document.querySelectorAll('.close-btn, .modal').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element) {
                    this.closeModal();
                }
            });
        });

        // POS system change
        const posSelect = document.getElementById('pos_system');
        if (posSelect) {
            posSelect.addEventListener('change', (e) => {
                this.handlePosSystemChange(e.target.value);
            });
        }
    }

    selectPlan(card) {
        // Remove selected class from all cards
        document.querySelectorAll('.plan-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Add selected class to clicked card
        card.classList.add('selected');

        // Update selected plan
        this.selectedPlan = card.getAttribute('data-plan');

        // Update form data
        const planInput = document.getElementById('selected_plan');
        if (planInput) {
            planInput.value = this.selectedPlan;
        }

        // Enable submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = `🎉 Start ${this.getPlanDisplayName(this.selectedPlan)} Plan!`;
        }

        // Track plan selection
        this.trackEvent('plan_selected', {
            plan_type: this.selectedPlan,
            event_category: 'Vendor Signup'
        });
    }

    showPlanInfo(planType) {
        const modal = document.getElementById('planModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        if (!modal || !modalTitle || !modalContent) return;

        modalTitle.textContent = this.getPlanDisplayName(planType) + ' Plan Details';
        modalContent.innerHTML = this.getPlanDetails(planType);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Track info view
        this.trackEvent('plan_info_viewed', {
            plan_type: planType,
            event_category: 'Vendor Signup'
        });
    }

    closeModal() {
        const modal = document.getElementById('planModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    getPlanDisplayName(planType) {
        const names = {
            'starter': 'Starter',
            'growth': 'Growth', 
            'pro': 'Pro'
        };
        return names[planType] || planType;
    }

    getPlanDetails(planType) {
        const details = {
            'starter': `
                <div class="feature-comparison">
                    <div class="feature-section">
                        <h4>🚀 Core Features</h4>
                        <ul class="plan-features">
                            <li>QR Code Ordering System</li>
                            <li>Basic POS Integration (Clover, Square)</li>
                            <li>Up to 50 orders/month</li>
                            <li>Email Support</li>
                            <li>Basic Analytics</li>
                        </ul>
                    </div>
                    <div class="feature-section">
                        <h4>💰 Perfect For</h4>
                        <ul class="plan-features">
                            <li>New vendors</li>
                            <li>Testing the waters</li>
                            <li>Small events (1-2 per month)</li>
                            <li>Budget-conscious owners</li>
                            <li>Basic mobile ordering needs</li>
                        </ul>
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #8B4513; margin-bottom: 10px;">💡 Real-World Example:</h4>
                    <p style="margin: 0; color: #666;">Perfect for a food vendor doing 2 farmer's markets per month. Handle weekend rushes without overwhelming your current setup.</p>
                </div>
            `,
            'growth': `
                <div class="feature-comparison">
                    <div class="feature-section">
                        <h4>🔥 Enhanced Features</h4>
                        <ul class="plan-features">
                            <li>Everything in Starter</li>
                            <li class="premium">All POS Integrations</li>
                            <li class="premium">Unlimited Orders</li>
                            <li class="premium">Advanced Analytics</li>
                            <li class="premium">Priority Support</li>
                            <li class="premium">Customer Database</li>
                            <li class="premium">SMS Notifications</li>
                        </ul>
                    </div>
                    <div class="feature-section">
                        <h4>💰 Perfect For</h4>
                        <ul class="plan-features">
                            <li>Established vendors</li>
                            <li>Multiple events weekly</li>
                            <li>Growing customer base</li>
                            <li>Revenue optimization focus</li>
                            <li>Professional operations</li>
                        </ul>
                    </div>
                </div>
                <div style="background: #fff9c4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #FFD700;">
                    <h4 style="color: #8B4513; margin-bottom: 10px;">🔥 Most Popular Choice!</h4>
                    <p style="margin: 0; color: #666;">Perfect for vendors doing 4+ events monthly. Track customers, build following, increase revenue by $200-400 daily.</p>
                </div>
            `,
            'pro': `
                <div class="feature-comparison">
                    <div class="feature-section">
                        <h4>⭐ Premium Features</h4>
                        <ul class="plan-features">
                            <li>Everything in Growth</li>
                            <li class="premium">White-Label Branding</li>
                            <li class="premium">Custom Integrations</li>
                            <li class="premium">Dedicated Account Manager</li>
                            <li class="premium">Advanced Reporting</li>
                            <li class="premium">API Access</li>
                            <li class="premium">Multi-Location Support</li>
                            <li class="premium">Staff Training Included</li>
                        </ul>
                    </div>
                    <div class="feature-section">
                        <h4>💰 Perfect For</h4>
                        <ul class="plan-features">
                            <li>Multiple location operations</li>
                            <li>High-volume businesses</li>
                            <li>Custom workflow needs</li>
                            <li>Enterprise integrations</li>
                            <li>Maximum revenue optimization</li>
                        </ul>
                    </div>
                </div>
                <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #8B4513;">
                    <h4 style="color: #8B4513; margin-bottom: 10px;">👑 Enterprise Solution</h4>
                    <p style="margin: 0; color: #666;">For serious operations doing 500+ orders monthly. Complete customization, dedicated support, maximum ROI.</p>
                </div>
            `
        };
        return details[planType] || 'Plan details not available.';
    }

    handlePosSystemChange(posSystem) {
        const integrationStatus = document.getElementById('integrationStatus');
        if (!integrationStatus) return;

        const integratedSystems = ['clover', 'square', 'shopify', 'stripe'];
        const pendingSystems = ['toast', 'aloha', 'touchbistro'];

        if (integratedSystems.includes(posSystem)) {
            integrationStatus.innerHTML = `
                <div style="color: #28a745; font-weight: bold; margin-top: 10px;">
                    ✅ Fully Integrated - Ready to go live in under 4 hours!
                </div>
            `;
        } else if (pendingSystems.includes(posSystem)) {
            integrationStatus.innerHTML = `
                <div style="color: #ffc107; font-weight: bold; margin-top: 10px;">
                    🔄 Integration coming soon - We'll notify you when ready!
                </div>
            `;
        } else {
            integrationStatus.innerHTML = `
                <div style="color: #6c757d; font-weight: bold; margin-top: 10px;">
                    📞 Manual entry option available - Contact us for custom integration
                </div>
            `;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Prevent duplicate submissions
        if (this.isSubmitting) {
            console.log('⚠️ Form submission already in progress, ignoring duplicate submit');
            return;
        }

        if (!this.selectedPlan) {
            alert('Please select a plan to continue.');
            return;
        }

        // Set submission state
        this.isSubmitting = true;
        console.log('🚀 Form submission started for plan:', this.selectedPlan);

        try {
            // Collect form data
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Add tracking data
            data.source = 'sms_campaign';
            data.campaign = 'vendor_signup';
            data.funnel_step = 'signup_form';
            data.selected_plan = this.selectedPlan;
            data.signup_timestamp = new Date().toISOString();

            console.log('📝 Form data collected:', data);

            // Disable submit button
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating Your Account...';
            }

            // Simulate API call (replace with actual endpoint)
            setTimeout(() => {
                this.processSignup(data);
            }, 2000);
        } catch (error) {
            console.error('❌ Error during form submission:', error);
            this.isSubmitting = false;
            
            // Re-enable submit button on error
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = `🎉 Start ${this.getPlanDisplayName(this.selectedPlan)} Plan!`;
            }
            
            alert('An error occurred during submission. Please try again.');
        }
    }

    processSignup(data) {
        // Log signup data (replace with actual API call)
        console.log('Vendor signup:', data);

        // Track conversion
        this.trackEvent('signup_completed', {
            event_category: 'Vendor',
            event_label: data.selected_plan,
            value: this.getPlanValue(data.selected_plan),
            custom_parameters: {
                pos_system: data.pos_system,
                business_name: data.business_name,
                city: data.city,
                state: data.state
            }
        });

        // Show success message
        this.showSuccessMessage(data);
        
        // Reset submission state
        this.isSubmitting = false;
    }

    showSuccessMessage(data) {
        const planName = this.getPlanDisplayName(data.selected_plan);
        const message = `
            🎉 Success! Your ${planName} account is being created.
            
            Next Steps:
            1. Check your email for account details
            2. Download the setup guide
            3. We'll contact you within 24 hours to get you started
            
            Expected setup time: ${data.pos_system === 'other' ? '1-2 business days' : 'Under 4 hours'}
        `;
        
        alert(message);

        // Redirect to success page after delay
        setTimeout(() => {
            window.location.href = 'signup-success.html';
        }, 3000);
    }

    getPlanValue(planType) {
        const values = {
            'starter': 29,
            'growth': 79,
            'pro': 199
        };
        return values[planType] || 0;
    }

    trackEvent(eventName, parameters) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // Console log for debugging
        console.log('Event tracked:', eventName, parameters);
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page_title: 'Vendor Signup Page',
            page_location: window.location.href,
            content_group1: 'SMS Campaign',
            content_group2: 'Service Signup'
        });
    }

    autoFocusFirstInput() {
        const firstInput = document.querySelector('input[name="business_name"]');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 500);
        }
    }

    // Cleanup method to remove event listeners
    cleanup() {
        console.log('🧹 Cleaning up VendorSignup instance...');
        
        // Remove form submit listener
        const form = document.getElementById('vendorSignupForm');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
        }
        
        // Remove plan card listeners
        document.querySelectorAll('.plan-card').forEach(card => {
            card.removeEventListener('click', this.selectPlan);
        });
        
        // Remove other listeners
        const posSelect = document.getElementById('pos_system');
        if (posSelect) {
            posSelect.removeEventListener('change', this.handlePosSystemChange);
        }
        
        // Clear global instance
        if (window.vendorSignupInstance === this) {
            window.vendorSignupInstance = null;
        }
    }
}

// Initialize when DOM is loaded - Ensure only one instance
document.addEventListener('DOMContentLoaded', () => {
    // Check if already initialized
    if (!window.vendorSignupInstance) {
        console.log('🚀 Creating new VendorSignup instance...');
        new VendorSignup();
    } else {
        console.log('✅ VendorSignup already exists, reusing instance');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.vendorSignupInstance) {
        window.vendorSignupInstance.cleanup();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('planModal');
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});

// Utility functions
window.VendorUtils = {
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePhone: (phone) => {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }
};