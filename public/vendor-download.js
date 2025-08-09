// Vendor Download JavaScript for SMS Campaign
class VendorDownload {
    constructor() {
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupDownloadButton();
        this.preloadGuideContent();
    }

    // Preload the guide content for instant PDF generation
    preloadGuideContent() {
        this.guideContent = {
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
    }

    setupDownloadButton() {
        const downloadBtn = document.getElementById('downloadButton');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDownload();
            });
        }
    }

    async handleDownload() {
        // Show loading state
        this.showLoadingState();
        
        // Track download event
        this.trackDownload();
        
        // Generate and download PDF
        await this.generatePDF();
        
        // Hide loading state
        this.hideLoadingState();
        
        // Show signup popup after short delay
        setTimeout(() => {
            this.showSignupPopup();
        }, 1500);
    }

    showLoadingState() {
        const downloadBtn = document.getElementById('downloadButton');
        if (downloadBtn) {
            downloadBtn.innerHTML = '⏳ Generating Your Guide...';
            downloadBtn.style.opacity = '0.7';
            downloadBtn.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const downloadBtn = document.getElementById('downloadButton');
        if (downloadBtn) {
            downloadBtn.innerHTML = '✅ Guide Downloaded!';
            setTimeout(() => {
                downloadBtn.innerHTML = '📧 Download Your Free Guide Now!';
                downloadBtn.style.opacity = '1';
                downloadBtn.style.pointerEvents = 'auto';
            }, 2000);
        }
    }

    async generatePDF() {
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

            // Generate HTML content for PDF
            tempContainer.innerHTML = this.generatePDFContent();
            document.body.appendChild(tempContainer);

            // Generate PDF using html2pdf if available, otherwise use jsPDF
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
                // Fallback to simple text-based PDF
                await this.generateSimplePDF();
            }

            // Cleanup
            document.body.removeChild(tempContainer);
        } catch (error) {
            console.error('PDF generation failed:', error);
            this.downloadAsText();
        }
    }

    generatePDFContent() {
        let content = `
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #8B4513; font-size: 32px; margin-bottom: 10px;">${this.guideContent.title}</h1>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">${this.guideContent.subtitle}</p>
            </div>
        `;

        this.guideContent.insights.forEach(insight => {
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
                <p style="margin: 0;">Visit: your-vendor-signup-link.com</p>
            </div>
        `;

        return content;
    }

    async generateSimplePDF() {
        // Fallback for when html2pdf is not available
        if (window.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yPosition = 20;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const lineHeight = 10;

            // Title
            doc.setFontSize(20);
            doc.setTextColor(139, 69, 19);
            doc.text(this.guideContent.title, margin, yPosition);
            yPosition += 15;

            // Subtitle
            doc.setFontSize(12);
            doc.setTextColor(102, 102, 102);
            doc.text(this.guideContent.subtitle, margin, yPosition);
            yPosition += 20;

            // Insights
            this.guideContent.insights.forEach(insight => {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Insight title
                doc.setFontSize(14);
                doc.setTextColor(139, 69, 19);
                doc.text(`${insight.number}. ${insight.icon} ${insight.title}`, margin, yPosition);
                yPosition += 10;

                // Insight content
                doc.setFontSize(10);
                doc.setTextColor(85, 85, 85);
                const splitText = doc.splitTextToSize(insight.content, 170);
                doc.text(splitText, margin, yPosition);
                yPosition += splitText.length * 5 + 10;
            });

            doc.save('vendor-money-secrets.pdf');
        } else {
            this.downloadAsText();
        }
    }

    downloadAsText() {
        // Ultimate fallback - download as text file
        let content = `${this.guideContent.title}\n${this.guideContent.subtitle}\n\n`;
        
        this.guideContent.insights.forEach(insight => {
            content += `${insight.number}. ${insight.icon} ${insight.title}\n${insight.content}\n\n`;
        });

        content += `Ready to Add $50-150 Daily to Your Business?\nVisit: your-vendor-signup-link.com`;

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

    showSignupPopup() {
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = 'signupOverlay';
        overlay.className = 'signup-overlay';
        
        overlay.innerHTML = `
            <div class="signup-popup">
                <div class="popup-content">
                    <button class="close-btn" onclick="vendorDownload.closeSignupPopup()">&times;</button>
                    
                    <div class="popup-header">
                        <h2>🚀 Ready to Implement These Strategies?</h2>
                        <p>Start with our FREE platform + get 2 months of premium features at no cost</p>
                    </div>
                    
                    <div class="popup-body">
                        <button class="signup-btn" onclick="vendorDownload.goToSignup()">
                            🚀 Start Your FREE Account + 2 Month Trial
                        </button>
                        
                        <div class="benefits">
                            <div>✅ No credit card required for free tier</div>
                            <div>✅ 2 month premium trial included</div>
                            <div>✅ Cancel anytime</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);

        // Track popup view
        this.trackSignupPopup();
    }

    closeSignupPopup() {
        const overlay = document.getElementById('signupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    }

    goToSignup() {
        this.trackSignupClick();
        window.location.href = './vendor-signup.html';
    }

    // Analytics tracking
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Vendor Download Page',
                page_location: window.location.href,
                content_group1: 'SMS Campaign',
                content_group2: 'Download'
            });
        }
    }

    trackDownload() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'guide_download', {
                event_category: 'Guide',
                event_label: 'Vendor Money Secrets PDF',
                content_group1: 'SMS Campaign',
                content_group2: 'Download'
            });
        }
    }

    trackSignupPopup() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'signup_popup_view', {
                event_category: 'Popup',
                event_label: 'Vendor Signup Offer',
                content_group1: 'SMS Campaign',
                content_group2: 'Popup'
            });
        }
    }

    trackSignupClick() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'signup_click', {
                event_category: 'Signup',
                event_label: 'Vendor Free Trial',
                content_group1: 'SMS Campaign',
                content_group2: 'Conversion'
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vendorDownload = new VendorDownload();
});

// Utility functions for global access
window.VendorDownloadUtils = {
    download: () => window.vendorDownload.handleDownload(),
    closePopup: () => window.vendorDownload.closeSignupPopup(),
    goToSignup: () => window.vendorDownload.goToSignup()
};