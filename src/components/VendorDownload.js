import React, { useEffect, useState } from 'react';
import '../styles/VendorDownload.css';

const VendorDownload = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Track page view
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: 'Vendor Download Page',
                page_location: window.location.href,
                content_group1: 'SMS Campaign',
                content_group2: 'Download'
            });
        }

        // Start download immediately
        handleDownload();
    }, []);

    const guideContent = {
        title: "🏪 Vendor Money Secrets",
        subtitle: "8 Simple Tips That Make Sense for Your Business",
        insights: [
            {
                number: 1,
                icon: "⏰",
                title: "The 8-Minute Rule: Why Customers Walk Away",
                content: "Customers abandon vendor lines after just 8 minutes of waiting. QR code ordering drops wait times under 6 minutes and keeps customers engaged while they wait."
            },
            {
                number: 2,
                icon: "📱",
                title: "Works With Your Current Register",
                content: "Integrates with Clover, Square, Shopify, and Stripe right now. Toast, Aloha, and TouchBistro coming soon. Just print QR codes on your stand, tables, or handouts. Zero new equipment needed."
            },
            {
                number: 3,
                icon: "💰",
                title: "Add $50-150 Daily to Your Sales",
                content: "Small vendors report $50-150 daily increases from faster service. That's $350-1,050 extra per week at festivals and events."
            },
            {
                number: 4,
                icon: "🌡️",
                title: "Beat the Heat and Long Lines",
                content: "Families get tired waiting in hot sun at festivals. By the time they reach your stand, they're frustrated. QR ordering lets them order while staying in shade, keeping them happy and buying."
            },
            {
                number: 5,
                icon: "📍",
                title: "Location Matters Less With Technology",
                content: "Successful vendors from California to New York are winning with QR ordering. Customers can find and order from you anywhere at the event, not just when they walk past your stand."
            },
            {
                number: 6,
                icon: "⚡",
                title: "Stop Overwhelming Your Staff",
                content: "During rush periods, your team gets swamped taking orders and payments. QR ordering handles the order-taking automatically, so staff can focus on making great food faster."
            },
            {
                number: 7,
                icon: "🚀",
                title: "Get Paid Instantly",
                content: "Customers pay through the app before pickup. No more cash handling delays or card processing slowdowns during busy times. Money hits your account immediately."
            },
            {
                number: 8,
                icon: "📊",
                title: "Know What Sells Best",
                content: "See which items sell most, busiest hours, and customer preferences. Use this data to stock better and price smarter for maximum profit."
            }
        ]
    };

    const generatePDFContent = () => {
        let content = `
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #8B4513; font-size: 32px; margin-bottom: 10px;">${guideContent.title}</h1>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">${guideContent.subtitle}</p>
            </div>
        `;

        guideContent.insights.forEach(insight => {
            content += `
                <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #8B4513;">
                    <h3 style="color: #8B4513; margin-bottom: 10px;">
                        <span style="background: #8B4513; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px;">${insight.number}</span>
                        ${insight.icon} ${insight.title}
                    </h3>
                    <p style="color: #555; margin: 0; line-height: 1.6;">${insight.content}</p>
                </div>
            `;
        });

        content += `
            <div style="text-align: center; margin-top: 40px; padding: 20px; background: linear-gradient(135deg, #8B4513, #D2691E); color: white; border-radius: 8px;">
                <h3 style="margin-bottom: 10px;">Ready to Add $50-150 Daily to Your Business?</h3>
                <p style="margin: 0;">Visit: ezdrink.us/signup</p>
            </div>
        `;

        return content;
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        
        // Track download event
        if (window.gtag) {
            window.gtag('event', 'guide_download', {
                event_category: 'Guide',
                event_label: 'Vendor Money Secrets PDF',
                content_group1: 'SMS Campaign',
                content_group2: 'Download'
            });
        }

        try {
            // Create temporary container for PDF content
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                background: white;
                padding: 40px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
            `;

            tempContainer.innerHTML = generatePDFContent();
            document.body.appendChild(tempContainer);

            // Generate PDF using html2pdf if available
            if (window.html2pdf) {
                await window.html2pdf()
                    .set({
                        margin: 10,
                        filename: 'vendor-money-secrets.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    })
                    .from(tempContainer)
                    .save();
            } else {
                // Fallback to text download
                let content = `${guideContent.title}\n${guideContent.subtitle}\n\n`;
                
                guideContent.insights.forEach(insight => {
                    content += `${insight.number}. ${insight.icon} ${insight.title}\n${insight.content}\n\n`;
                });

                content += `Ready to Add $50-150 Daily to Your Business?\nVisit: ezdrink.us/signup`;

                const blob = new Blob([content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vendor-money-secrets.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }

            document.body.removeChild(tempContainer);
        } catch (error) {
            console.error('Download failed:', error);
        }

        setIsGenerating(false);
    };

    const handleSignupClick = (plan) => {
        if (window.gtag) {
            window.gtag('event', 'signup_click', {
                event_category: 'Signup',
                event_label: `Vendor ${plan} Plan`,
                content_group1: 'SMS Campaign',
                content_group2: 'Conversion'
            });
        }
        // Add plan parameter to signup URL
        window.location.href = `/signup?plan=${plan}&source=vendor-download`;
    };



    return (
        <>
            <div className="vendor-download-container">
                <div className="vendor-download-content">
                    <div className="form-title">📥 Your Download is in Progress</div>
                    <div className="form-subtitle">Your FREE Vendor Money Secrets guide is being prepared for download...</div>
                    
                    <div className="download-status">
                        <div className="loading-spinner"></div>
                        <p>{isGenerating ? '⏳ Generating your personalized guide...' : '✅ Download complete! Check your downloads folder.'}</p>
                    </div>

                    <div className="next-step">
                        <h3>🚀 Ready to Turn These Secrets Into Real Results?</h3>
                        <p>Join thousands of vendors already using our platform to increase sales by $50-150 daily</p>
                        
                        <div className="signup-options">
                            <div className="plan-option featured">
                                <div className="plan-badge">Most Popular</div>
                                <h4>🆓 FREE Forever Plan</h4>
                                <div className="plan-price">$0/month</div>
                                <ul>
                                    <li>✅ QR code ordering system</li>
                                    <li>✅ Basic analytics</li>
                                    <li>✅ Up to 50 orders/month</li>
                                    <li>✅ Works with your POS</li>
                                </ul>
                                <button className="signup-btn free" onClick={() => handleSignupClick('free')}>
                                    Get Started FREE
                                </button>
                            </div>

                            <div className="plan-option">
                                <h4>💎 Growth Plan</h4>
                                <div className="plan-price">$29/month</div>
                                <ul>
                                    <li>✅ Everything in FREE</li>
                                    <li>✅ Unlimited orders</li>
                                    <li>✅ Advanced analytics</li>
                                    <li>✅ Customer loyalty program</li>
                                    <li>✅ Priority support</li>
                                </ul>
                                <button className="signup-btn premium" onClick={() => handleSignupClick('growth')}>
                                    Start 2-Month FREE Trial
                                </button>
                            </div>
                        </div>

                        <div className="guarantee">
                            <p>🔒 No credit card required • Cancel anytime • 30-day money-back guarantee</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VendorDownload;