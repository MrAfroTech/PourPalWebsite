import React, { useEffect, useRef, useState } from 'react';
import '../styles/HeroSection.css';
import StatsModal from './StatsModal';

const HeroSection = ({ onOpenPopup }) => {
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const videoTimerRef = useRef(null);
  const transitionInProgress = useRef(false);
  
  // Fixed video duration
  const VIDEO_DURATION = 3000; // 3 seconds

  // Your video sources - updated list with 22 videos
  const videoSources = [
    '/1899147-hd_1920_1080_30fps.mp4',
    '/2022396_segment1.mp4',
    '/2022396-hd_1920_1080_30fps.mp4',
    '/3402517-uhd_4096_2160_25fps.mp4',
    '/3403452-hd_1920_1080_25fps.mp4',
    '/3772392-hd_1920_1080_25fps (1).mp4',
    '/4667118-uhd_4096_2160_25fps.mp4',
    '/4667157-uhd_4096_2160_25fps.mp4',
    '/4694603-uhd_4096_2160_25fps (1).mp4',
    '/4774631-hd_1920_1080_25fps (1).mp4',
    '/5816530-hd_1920_1080_25fps.mp4',
    '/5974777-uhd_4096_2160_30fps.mp4',
    '/6174384-hd_1920_1080_30fps.mp4',
    '/6174435-hd_1920_1080_30fps.mp4',
    '/6396313-hd_1920_1080_25fps.mp4',
    '/6396314-hd_1920_1080_25fps.mp4',
    '/7219895-uhd_3840_2160_24fps.mp4',
    '/7269151-uhd_3840_2160_25fps.mp4',
    '/7269643-uhd_3840_2160_25fps.mp4',
    '/7722221-uhd_3840_2160_25fps.mp4',
    '/8935798-uhd_3840_2160_25fps.mp4',
    '/9003399-hd_1920_1080_25fps.mp4',
    '/9419423-uhd_4096_2160_25fps.mp4',
    '/14058819-uhd_2732_1440_24fps.mp4'
  ];

  // Initialize videos and start the sequence
  useEffect(() => {
    // Initialize video refs array
    videoRefs.current = Array(videoSources.length).fill(null);
    
    // Preload all videos to improve performance
    videoSources.forEach((src, index) => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.muted = true;
    });
    
    // Start with the first video
    startVideoSequence();
    
    // Cleanup function to clear any timers
    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
    };
  }, []);

  // Initial sequence start
  const startVideoSequence = () => {
    console.log("Starting video sequence with video 0");
    playVideo(0);
  };
  
  // Main function to play a specific video
  const playVideo = (index) => {
    // Prevent multiple simultaneous transitions
    if (transitionInProgress.current) {
      console.log("Transition already in progress, skipping");
      return;
    }
    
    transitionInProgress.current = true;
    
    // Clear any existing timers
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }
    
    console.log(`Playing video ${index}`);
    
    // Update the current video index
    setCurrentVideoIndex(index);
    
    // Make sure all other videos are paused
    videoRefs.current.forEach((videoRef, i) => {
      if (videoRef && i !== index) {
        videoRef.pause();
      }
    });
    
    // Play the current video
    const videoRef = videoRefs.current[index];
    if (videoRef) {
      // Reset to beginning
      videoRef.currentTime = 0;
      
      // Disable looping explicitly
      videoRef.loop = false;
      
      // Play the video
      videoRef.play()
        .then(() => {
          console.log(`Video ${index} started playing`);
          
          // Schedule next video after fixed duration
          videoTimerRef.current = setTimeout(() => {
            const nextIndex = (index + 1) % videoSources.length;
            console.log(`Moving from video ${index} to ${nextIndex}`);
            transitionInProgress.current = false;
            playVideo(nextIndex);
          }, VIDEO_DURATION);
        })
        .catch(error => {
          console.error(`Error playing video ${index}:`, error);
          
          // If there's an error, try the next video
          const nextIndex = (index + 1) % videoSources.length;
          console.log(`Error with video ${index}, moving to ${nextIndex}`);
          transitionInProgress.current = false;
          
          // Small delay before trying next video
          setTimeout(() => {
            playVideo(nextIndex);
          }, 100);
        });
    } else {
      console.error(`Video ref ${index} not available`);
      
      // If video ref is not available, move to next video
      const nextIndex = (index + 1) % videoSources.length;
      transitionInProgress.current = false;
      setTimeout(() => {
        playVideo(nextIndex);
      }, 100);
    }
  };
  
  // Handle video ended event as backup (in case the timer fails)
  const handleVideoEnded = (index) => {
    console.log(`Video ${index} ended naturally`);
    
    // If this is the current video, move to the next one
    if (index === currentVideoIndex) {
      const nextIndex = (index + 1) % videoSources.length;
      console.log(`Video ${index} ended, moving to ${nextIndex}`);
      transitionInProgress.current = false;
      playVideo(nextIndex);
    }
  };

  useEffect(() => {
    // Fade in text elements with staggered timing
    const text = textRef.current;
    if (text) {
      const elements = text.querySelectorAll('.fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, 1000 + (index * 200));
      });
    }

    // Animate stats counters
    const stats = statsRef.current;
    if (stats) {
      setTimeout(() => {
        stats.classList.add('animate');
      }, 800);
    }
  }, []);
  
  const handleStatClick = (statType) => {
    setActiveModal(statType);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setActiveModal(null);
    
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle phone mockup click
  const handlePhoneClick = (e) => {
    e.stopPropagation();
    setShowMenuPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMenuPopup = () => {
    setShowMenuPopup(false);
    document.body.style.overflow = 'auto';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (activeModal) {
          closeModal();
        }
        if (showMenuPopup) {
          closeMenuPopup();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [activeModal, showMenuPopup]);

  return (
    <section className="hero-section">
      {/* Video Background */}
      <div className="hero-background">
        <div className="video-background">
          {videoSources.map((src, index) => (
            <video
              key={`video-${index}-${src}`}
              ref={el => videoRefs.current[index] = el}
              src={src}
              muted
              playsInline
              loop={false}
              onEnded={() => handleVideoEnded(index)}
              className={`video-element ${index === currentVideoIndex ? 'active' : ''}`}
            />
          ))}
          <div className="video-overlay"></div>
          <div className="gradient-overlay"></div>
          <div className="grid-pattern"></div>
        </div>
      </div>
      
      <div className="hero-content" ref={textRef}>
        <h1 className="hero-title fade-in">
          <span className="gradient-text">Ez</span>
          <span className="accent-text">Drink</span>
        </h1>
        <h2 className="hero-subtitle fade-in">YOUR FAVORITE BARTENDER'S FAVORITE BARTENDER</h2>
        <p className="hero-description fade-in">
          Eliminate bar chaos. Eliminate long lines.
          Happy customers. Efficient staff. More profits. Everybody wins.
        </p>
        
        <div className="hero-cta fade-in">
          <button className="primary-button" onClick={onOpenPopup}>Are You Ready?</button>
          <button className="secondary-button" onClick={() => window.location.href = '/demo'}>Watch It In Action →</button>
          <button className="ezfest-button" onClick={() => window.location.href = '/ezfest'}>🎪 Join EzFest →</button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="stats-container" ref={statsRef}>
          <div 
            className={`stat-card ${activeModal === 'wait-time' ? 'active' : ''}`}
            onClick={() => handleStatClick('wait-time')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">30<span>%</span></h3>
              <p className="stat-label">Less Wait Time</p>
            </div>
            <div className="learn-more-hint">Tap In</div>
          </div>
          
          <div 
            className={`stat-card ${activeModal === 'revenue' ? 'active' : ''}`}
            onClick={() => handleStatClick('revenue')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">25<span>%</span></h3>
              <p className="stat-label">Revenue Increase</p>
            </div>
            <div className="learn-more-hint">Tap in</div>
          </div>
          
          <div 
            className={`stat-card ${activeModal === 'efficiency' ? 'active' : ''}`}
            onClick={() => handleStatClick('efficiency')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">40<span>%</span></h3>
              <p className="stat-label">Increase in Staff Efficiency</p>
            </div>
            <div className="learn-more-hint">Tap in</div>
          </div>
        </div>
        
        <div className="device-mockup" onClick={handlePhoneClick}>
          <div className="phone-frame">
            <div className="phone-screen">
              <div className="app-screen">
                <div className="app-header">
                  <div className="app-logo">EzDrink</div>
                  <div className="app-icon"></div>
                </div>
                <div className="app-content">
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Old Fashioned</div>
                      <div className="menu-item-price">$12</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item active">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Margarita</div>
                      <div className="menu-item-price">$10</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Mojito</div>
                      <div className="menu-item-price">$11</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Espresso Martini</div>
                      <div className="menu-item-price">$14</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                </div>
                <div className="app-footer">
                  <div className="order-button">Order Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="2"/>
          <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      {activeModal && (
        <StatsModal 
          statType={activeModal} 
          onClose={closeModal}
        />
      )}
      
      {/* Menu Integration Popup */}
      {showMenuPopup && (
        <div className="menu-popup-overlay" onClick={closeMenuPopup}>
          <div className="menu-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closeMenuPopup}>×</button>
            <h2>Seamless Menu Integration</h2>
            <p className="subtitle">Your entire bar menu, digitized in minutes</p>
            
            <div className="popup-content">
              <h3>No More Menu Maintenance Headaches</h3>
              <p>EzDrink transforms your existing menu into a digital masterpiece with zero effort on your part. Our team handles the entire process, from initial setup to seasonal updates.</p>
              
              <h3>Three Simple Steps to Digital Transformation</h3>
              <ol>
                <li><strong>Share Your Menu</strong> - Send us your current menu in any format</li>
                <li><strong>Magic Happens</strong> - Our team digitizes everything</li>
                <li><strong>Go Live</strong> - Within 48 hours, your menu is available via the app</li>
              </ol>
              
              <h3>Smart Features That Drive Revenue</h3>
              <ul>
                <li><strong>Intelligent Upselling</strong> - Suggests premium spirits and add-ons</li>
                <li><strong>Dynamic Pricing</strong> - Easily implement happy hour specials</li>
                <li><strong>Real-Time Updates</strong> - Update when items sell out</li>
                <li><strong>Customer Insights</strong> - Learn which items drive revenue</li>
              </ul>
              
              <div className="phone-click-action">
                <p>Want to see your unique menu in our app? Click above to learn how we can craft a custom digital menu for your bar.</p>
              </div>
            </div>
            
            <button className="popup-button">Schedule Your Free Menu Integration</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;