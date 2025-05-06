import React from 'react';
import '../styles/TermsOfService.css';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-title">Terms of Service</h1>
        <p className="terms-last-updated">Last Updated: April 30, 2025</p>
        
        <div className="terms-section">
          <h2>1. Introduction</h2>
          <p>Welcome to EzDrink ("Company", "we", "our", "us")! These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Services"), so please read them carefully.</p>
          <p>By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, you may not access the Services.</p>
        </div>
        
        <div className="terms-section">
          <h2>2. Services Description</h2>
          <p>EzDrink is an AI-powered hospitality marketplace that enables users to connect with various establishments for ordering drinks and related services. Our platform facilitates interactions between users and participating establishments, allowing for efficient ordering, payment processing, and service delivery.</p>
          <p>Users can browse participating establishments, view menus, place orders, make payments, and provide feedback through our platform.</p>
        </div>
        
        <div className="terms-section">
          <h2>3. Account Registration</h2>
          <p>To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          <p>You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          <p>We reserve the right to disable any user account at any time if, in our opinion, you have failed to comply with these Terms.</p>
        </div>
        
        <div className="terms-section">
          <h2>4. User Conduct</h2>
          <p>When using our Services, you agree not to:</p>
          <ul>
            <li>Use the Services in any way that violates any applicable law or regulation</li>
            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
            <li>Attempt to gain unauthorized access to parts of the Services that are restricted</li>
            <li>Use the Services to send unsolicited communications, promotions, or advertisements</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Use another user's account without permission</li>
            <li>Provide false information about your age, particularly if you are under the legal drinking age in your jurisdiction</li>
          </ul>
        </div>
        
        <div className="terms-section">
          <h2>5. Age Restrictions</h2>
          <p>The Services are only available for use by individuals who are of legal drinking age in their respective jurisdictions. By using our Services, you represent and warrant that you are of legal drinking age in your jurisdiction.</p>
          <p>We reserve the right to request proof of age at any time, and to suspend or terminate your account if we have reason to believe you are underage.</p>
        </div>
        
        <div className="terms-section">
          <h2>6. Orders and Payments</h2>
          <p>When you place an order through our Services, you are making an offer to purchase products from the establishment, not from EzDrink. We facilitate the transaction, but the contract for sale is between you and the establishment.</p>
          <p>You agree to pay all charges incurred by you or any users of your account at the prices in effect when such charges are incurred. You are responsible for any applicable taxes and for all authorized charges made to your payment method.</p>
          <p>If an establishment cannot fulfill your order, we will notify you as soon as possible. In such cases, you will not be charged, or if you have already been charged, you will receive a refund.</p>
        </div>
        
        <div className="terms-section">
          <h2>7. Responsible Consumption</h2>
          <p>EzDrink promotes responsible consumption of alcoholic beverages. We reserve the right to decline or cancel orders if we reasonably believe that a user is intoxicated or otherwise unable to consume alcohol responsibly.</p>
          <p>You agree not to use our Services to order alcoholic beverages for individuals who are underage or visibly intoxicated.</p>
        </div>
        
        <div className="terms-section">
          <h2>8. Intellectual Property</h2>
          <p>The Services and their original content, features, and functionality are owned by the Company and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          <p>You may not copy, modify, create derivative works of, publicly display, publicly perform, republish, or transmit any of the material on our Services without prior written consent.</p>
        </div>
        
        <div className="terms-section">
          <h2>9. Third-Party Links</h2>
          <p>Our Services may contain links to third-party websites or services that are not owned or controlled by the Company.</p>
          <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that the Company shall not be responsible or liable for any damage or loss caused by the use of such websites or services.</p>
        </div>
        
        <div className="terms-section">
          <h2>10. Limitation of Liability</h2>
          <p>In no event shall the Company, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use, or alteration of your transmissions or content.</p>
        </div>
        
        <div className="terms-section">
          <h2>11. Disclaimers</h2>
          <p>Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied.</p>
          <p>The Company does not warrant that (i) the Services will meet your specific requirements, (ii) the Services will be uninterrupted, timely, secure, or error-free, (iii) the results that may be obtained from the use of the Services will be accurate or reliable, or (iv) the quality of any products, services, information, or other material purchased or obtained by you through the Services will meet your expectations.</p>
        </div>
        
        <div className="terms-section">
          <h2>12. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the Company is established, without regard to its conflict of law provisions.</p>
          <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
        </div>
        
        <div className="terms-section">
          <h2>13. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. When we make changes, we will post the updated terms on our website and update the "Last Updated" date at the top of these Terms.</p>
          <p>Your continued use of our Services following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page periodically so you are aware of any changes.</p>
        </div>
        
        <div className="terms-section">
          <h2>14. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: support@ezdrink.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Main Street, Suite 500, San Francisco, CA 94105</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
