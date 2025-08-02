import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/WineWalkMap.css';
import ezfestLocations from '../data/ezfestLocations.json';

const FoodTruckMap = () => {
    // Configuration from environment variables with proper fallbacks
    const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'false' ? false : true;
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
    const ENABLE_CONTINUOUS_TRACKING = process.env.REACT_APP_ENABLE_CONTINUOUS_TRACKING === 'true';
    
    // Developer override system for quick testing (set to null to use env vars)
    const DEV_OVERRIDE = {
        DEMO_MODE: null, // Set to true/false to override, null to use env var
        GOOGLE_MAPS_API_KEY: null, // Set to your key to override, null to use env var
        ENABLE_CONTINUOUS_TRACKING: null // Set to true/false to override, null to use env var
    };
    
    // Final configuration
    const config = {
        DEMO_MODE: DEV_OVERRIDE.DEMO_MODE !== null ? DEV_OVERRIDE.DEMO_MODE : DEMO_MODE,
        GOOGLE_MAPS_API_KEY: DEV_OVERRIDE.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY,
        ENABLE_CONTINUOUS_TRACKING: DEV_OVERRIDE.ENABLE_CONTINUOUS_TRACKING !== null ? DEV_OVERRIDE.ENABLE_CONTINUOUS_TRACKING : ENABLE_CONTINUOUS_TRACKING
    };

    const mapRef = useRef(null);
    const scriptRef = useRef(null);
    const loadingRef = useRef(false);
    const initializingRef = useRef(false);
    const mapInitializedRef = useRef(false);
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [locations, setLocations] = useState([]);
    const [locationMarkers, setLocationMarkers] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '', visible: false });
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const [componentMounted, setComponentMounted] = useState(false);

    // Mark component as mounted
    useEffect(() => {
        setComponentMounted(true);
        return () => {
            setComponentMounted(false);
        };
    }, []);

    // Log configuration on component mount
    useEffect(() => {
        if (!componentMounted) return;
        
        console.log('🎪 Food Truck Map Configuration:', {
            'Raw Environment Variables': {
                REACT_APP_DEMO_MODE: process.env.REACT_APP_DEMO_MODE,
                REACT_APP_GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET',
                REACT_APP_ENABLE_CONTINUOUS_TRACKING: process.env.REACT_APP_ENABLE_CONTINUOUS_TRACKING,
                NODE_ENV: process.env.NODE_ENV
            },
            'Final Configuration': {
                DEMO_MODE: config.DEMO_MODE,
                HAS_API_KEY: !!config.GOOGLE_MAPS_API_KEY,
                CONTINUOUS_TRACKING: config.ENABLE_CONTINUOUS_TRACKING
            }
        });
    }, [config, componentMounted]);

    // Cleanup function
    useEffect(() => {
        return () => {
            // Clean up geolocation
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
            
            // Clean up markers safely
            if (locationMarkers.length > 0) {
                locationMarkers.forEach(marker => {
                    try {
                        if (marker && marker.setMap) {
                            marker.setMap(null);
                        }
                    } catch (error) {
                        console.warn('Error removing location marker:', error);
                    }
                });
            }
            
            if (userMarker) {
                try {
                    if (userMarker.setMap) {
                        userMarker.setMap(null);
                    }
                } catch (error) {
                    console.warn('Error removing user marker:', error);
                }
            }

            // Reset refs
            loadingRef.current = false;
            initializingRef.current = false;
            mapInitializedRef.current = false;
        };
    }, [watchId, locationMarkers, userMarker]);

    // Load locations from food truck data
    useEffect(() => {
        if (ezfestLocations.foodTrucks) {
            const foodTruckLocations = ezfestLocations.foodTrucks.map(truck => ({
                id: truck.id,
                name: truck.name,
                type: truck.type,
                description: truck.description,
                lat: truck.lat,
                lng: truck.lng,
                category: truck.type,
                address: `Food Truck ${truck.id}`, // Hidden address
                rating: truck.rating,
                waitTime: truck.waitTime,
                menu: truck.menu,
                icon: truck.icon
            }));
            setLocations(foodTruckLocations);
        }
    }, []);

    // Helper functions
    const showStatus = useCallback((message, type) => {
        if (componentMounted) {
            setStatus({ message, type, visible: true });
            setTimeout(() => {
                if (componentMounted) {
                    setStatus(prev => ({ ...prev, visible: false }));
                }
            }, 3000);
        }
    }, [componentMounted]);

    const getMarkerIcon = useCallback((type) => {
        // Return default marker for food trucks
        return null;
    }, []);

    const createInfoWindowContent = useCallback((location) => {
        return `
            <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">${location.icon} ${location.name}</h3>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${location.category}</p>
                <p style="margin: 0 0 5px 0; color: #888; font-size: 11px;">⭐ ${location.rating}</p>
                <p style="margin: 0; color: #666; font-size: 11px;">⏱️ ${location.waitTime}</p>
            </div>
        `;
    }, []);

    const addLocationMarkers = useCallback(async (mapInstance) => {
        if (!mapInstance || !window.google || !window.google.maps || !componentMounted) return;
        
        console.log('Adding food truck markers to map');
        
        // Clear existing markers safely
        locationMarkers.forEach(marker => {
            if (marker && marker.setMap) {
                try {
                    marker.setMap(null);
                } catch (error) {
                    console.warn('Error removing marker:', error);
                }
            }
        });
        
        const newMarkers = [];
        
        // Add markers for each food truck
        for (let index = 0; index < locations.length; index++) {
            const location = locations[index];
            try {
                const position = {
                    lat: location.lat + (index * 0.0005),
                    lng: location.lng + (index * 0.0005)
                };
                
                const marker = new window.google.maps.Marker({
                    position: position,
                    map: mapInstance,
                    title: location.name,
                    icon: getMarkerIcon(location.type),
                    animation: window.google.maps.Animation.DROP
                });
                
                const infoWindow = new window.google.maps.InfoWindow({
                    content: createInfoWindowContent(location)
                });
                
                marker.addListener('click', () => {
                    newMarkers.forEach(m => {
                        if (m.infoWindow && m.infoWindow.close) {
                            try {
                                m.infoWindow.close();
                            } catch (error) {
                                console.warn('Error closing info window:', error);
                            }
                        }
                    });
                    infoWindow.open(mapInstance, marker);
                });
                
                marker.infoWindow = infoWindow;
                newMarkers.push(marker);
            } catch (error) {
                console.warn('Error creating marker for location:', location.name, error);
            }
        }
        
        if (componentMounted) {
            setLocationMarkers(newMarkers);
        }
        
        if (newMarkers.length > 0) {
            try {
                const bounds = new window.google.maps.LatLngBounds();
                newMarkers.forEach(marker => {
                    bounds.extend(marker.getPosition());
                });
                mapInstance.fitBounds(bounds);
                
                window.google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
                    if (mapInstance.getZoom() > 18) {
                        mapInstance.setZoom(18);
                    }
                });
            } catch (error) {
                console.warn('Error setting map bounds:', error);
            }
        }
    }, [locations, locationMarkers, getMarkerIcon, createInfoWindowContent, componentMounted]);

    // Initialize Google Maps
    const initMap = useCallback(() => {
        console.log('initMap called for food trucks');
        
        if (!window.google || 
            !window.google.maps || 
            !window.google.maps.Map ||
            !mapRef.current || 
            !componentMounted) {
            console.log('initMap: Prerequisites not met');
            return;
        }
        
        if (initializingRef.current || mapInitializedRef.current) {
            console.log('initMap: Already initializing or initialized');
            return;
        }
        
        if (map) {
            console.log('initMap: Map already exists');
            return;
        }
        
        initializingRef.current = true;
        console.log('initMap: Starting map initialization');
        
        try {
            const defaultCenter = { lat: 40.7589, lng: -73.9851 }; // Central Park
            
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                zoom: 16,
                center: defaultCenter,
                styles: [{ 
                    featureType: 'poi', 
                    elementType: 'labels', 
                    stylers: [{ visibility: 'off' }] 
                }],
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true,
                gestureHandling: 'auto',
                clickableIcons: false
            });
            
            // Wait for map to be ready
            window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
                console.log('Food truck map is ready and idle');
                mapInitializedRef.current = true;
                if (componentMounted) {
                    setMap(mapInstance);
                    showStatus('Interactive Google Maps loaded successfully!', 'success');
                    
                    // Add markers after map is fully ready
                    if (locations.length > 0) {
                        setTimeout(() => {
                            addLocationMarkers(mapInstance);
                        }, 500);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error initializing food truck map:', error);
            if (componentMounted) {
                showStatus('Error loading Google Maps: ' + error.message, 'error');
            }
        } finally {
            initializingRef.current = false;
        }
    }, [componentMounted, map, locations, addLocationMarkers, showStatus]);

    // Load Google Maps
    const loadGoogleMaps = useCallback(() => {
        if (!componentMounted) return;
        
        console.log('loadGoogleMaps called for food trucks');
        
        if (config.DEMO_MODE) {
            setMapsLoaded(true);
            showStatus('Demo mode: Map interface loaded (no API key required)', 'success');
            console.log('🔧 Running in DEMO MODE - set REACT_APP_DEMO_MODE=false for live Google Maps');
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('Google Maps already loaded, using existing instance');
            setMapsLoaded(true);
            setTimeout(() => initMap(), 100);
            return;
        }
        
        // Prevent multiple loads
        if (loadingRef.current) {
            console.log('Google Maps already loading...');
            return;
        }

        // Check for existing script
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            console.log('Google Maps script already exists, waiting for load...');
            loadingRef.current = true;
            
            // Set up a listener for when it finishes loading
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkGoogleMaps = () => {
                attempts++;
                if (window.google && window.google.maps && window.google.maps.Map) {
                    loadingRef.current = false;
                    if (componentMounted) {
                        setMapsLoaded(true);
                        setTimeout(() => initMap(), 100);
                    }
                } else if (attempts < maxAttempts) {
                    setTimeout(checkGoogleMaps, 500);
                } else {
                    loadingRef.current = false;
                    console.error('Google Maps loading timeout');
                    if (componentMounted) {
                        showStatus('Google Maps loading timeout. Please refresh the page.', 'error');
                        setMapsLoaded(true);
                    }
                }
            };
            
            setTimeout(checkGoogleMaps, 500);
            return;
        }
        
        if (!config.GOOGLE_MAPS_API_KEY) {
            console.error('Google Maps API key not found');
            showStatus('Google Maps API key missing.', 'error');
            setMapsLoaded(true);
            return;
        }
        
        loadingRef.current = true;
        showStatus('Loading Google Maps...', 'success');
        
        // Create unique callback function name
        const callbackName = 'initGoogleMaps_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Set a timeout
        const loadTimeout = setTimeout(() => {
            loadingRef.current = false;
            console.error('Google Maps loading timeout after 15 seconds');
            if (componentMounted) {
                showStatus('Google Maps loading timeout. Please refresh the page.', 'error');
                setMapsLoaded(true);
            }
            if (window[callbackName]) {
                delete window[callbackName];
            }
        }, 15000);
        
        window[callbackName] = () => {
            clearTimeout(loadTimeout);
            loadingRef.current = false;
            console.log('Google Maps script loaded successfully');
            if (componentMounted) {
                setMapsLoaded(true);
                setTimeout(() => initMap(), 100);
                showStatus('Google Maps loaded successfully!', 'success');
            }
            delete window[callbackName];
        };
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&callback=${callbackName}&v=3.56`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
            clearTimeout(loadTimeout);
            loadingRef.current = false;
            console.error('Failed to load Google Maps API');
            if (componentMounted) {
                showStatus('Failed to load Google Maps. Check your API key and internet connection.', 'error');
                setMapsLoaded(true);
            }
            if (window[callbackName]) {
                delete window[callbackName];
            }
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
        
        scriptRef.current = script;
        document.head.appendChild(script);
    }, [initMap, showStatus, config, componentMounted]);

    // Initialize component
    useEffect(() => {
        if (!componentMounted) return;
        
        let mounted = true;
        
        const initialize = async () => {
            try {
                console.log('Initializing food truck map component...');
                
                // Load maps after a small delay
                setTimeout(() => {
                    if (mounted && componentMounted) {
                        loadGoogleMaps();
                    }
                }, 100);
            } catch (error) {
                console.error('Error initializing food truck map component:', error);
                if (mounted && componentMounted) {
                    showStatus('Error initializing map', 'error');
                }
            }
        };
        
        initialize();
        
        return () => {
            mounted = false;
        };
    }, [componentMounted, loadGoogleMaps]);

    // Add markers when map and locations are ready
    useEffect(() => {
        if (!config.DEMO_MODE && map && locations.length > 0 && mapsLoaded && componentMounted) {
            console.log('Adding food truck markers to existing map');
            const timer = setTimeout(() => {
                addLocationMarkers(map);
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [locations.length, map, mapsLoaded, componentMounted, config.DEMO_MODE, addLocationMarkers]);

    // Don't render anything until component is mounted
    if (!componentMounted) {
        return null;
    }

    return (
        <div className="wine-walk-container">
            <div className="wine-walk-inner">
                <div className="wine-walk-header">
                    <h1>🎪 Food Truck Festival</h1>
                    <p>Explore delicious food trucks at EzFest</p>
                    <div style={{fontSize: '14px', opacity: 0.8, marginTop: '10px'}}>
                        {ezfestLocations.foodTrucks.length} food trucks serving amazing cuisine
                    </div>
                    {/* Configuration Status */}
                    <div style={{ 
                        fontSize: '12px', 
                        opacity: 0.6, 
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: config.DEMO_MODE ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                        borderRadius: '15px',
                        display: 'inline-block',
                        border: config.DEMO_MODE ? '1px solid rgba(255, 193, 7, 0.3)' : '1px solid rgba(40, 167, 69, 0.3)'
                    }}>
                        {config.DEMO_MODE ? '🔧 Demo Mode' : '🌐 Live Mode'} | 
                        {config.ENABLE_CONTINUOUS_TRACKING ? ' Continuous GPS' : ' Single Location GPS'}
                        {process.env.NODE_ENV === 'development' && (
                            <span style={{ marginLeft: '5px', opacity: 0.8 }}>| Dev</span>
                        )}
                    </div>
                </div>

                <div className="wine-walk-controls">
                    <div className="wine-walk-button-group">
                        <button 
                            className={`wine-walk-btn ${isTracking ? 'wine-walk-btn-secondary' : 'wine-walk-btn-primary'}`}
                            onClick={() => setStatus({ message: 'GPS tracking coming soon!', type: 'info', visible: true })}
                        >
                            {isTracking ? '⏹️ Stop Tracking' : '📍 Start GPS Tracking'}
                        </button>
                        <button 
                            className="wine-walk-btn wine-walk-btn-secondary" 
                            onClick={() => setStatus({ message: 'Finding nearest food truck...', type: 'info', visible: true })}
                        >
                            🎯 Find Nearest Food Truck
                        </button>
                        <button 
                            className="wine-walk-btn wine-walk-btn-secondary" 
                            onClick={() => setStatus({ message: 'Showing all food trucks...', type: 'success', visible: true })}
                        >
                            🗺️ Show All Food Trucks
                        </button>
                    </div>
                    
                    {status.visible && (
                        <div className={`wine-walk-status ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                </div>

                <div className="wine-walk-map-container">
                    <div ref={mapRef} className="wine-walk-map">
                        {config.DEMO_MODE ? (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, #2a5a2a 0%, #1a3a1a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                color: 'white',
                                fontSize: '18px',
                                textAlign: 'center',
                                zIndex: 1
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎪</div>
                                <div>Food Truck Festival Map (Demo Mode)</div>
                                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                                    Festival layout with {locations.length} food trucks
                                </div>
                            </div>
                        ) : !mapsLoaded ? (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                color: 'white',
                                fontSize: '18px',
                                textAlign: 'center',
                                zIndex: 1
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗺️</div>
                                <div>Loading Google Maps...</div>
                                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                                    Please wait while we load the interactive map
                                </div>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTop: '3px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginTop: '20px'
                                }}></div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="wine-walk-location-list">
                    <h3>Food Trucks ({locations.length})</h3>
                    <div>
                        {locations.length === 0 ? (
                            <div style={{
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                No food trucks loaded. Check your ezfestLocations.json file.
                            </div>
                        ) : (
                            locations.map((location, index) => (
                                <div key={location.id || index} className="wine-walk-location-item">
                                    <div className="wine-walk-location-info">
                                        <div className="wine-walk-location-name">
                                            {location.icon} {location.name}
                                            <span style={{color: '#ffd700', marginLeft: '8px'}}>⭐ {location.rating}</span>
                                        </div>
                                        {/* Address is hidden for food trucks */}
                                        {location.category && (
                                            <div style={{
                                                fontSize: '12px', 
                                                color: '#ffd700', 
                                                marginTop: '2px',
                                                fontWeight: 'bold'
                                            }}>
                                                {location.category}
                                            </div>
                                        )}
                                        
                                        {location.description && (
                                            <div style={{
                                                fontSize: '14px', 
                                                color: '#888', 
                                                marginTop: '4px',
                                                lineHeight: '1.4'
                                            }}>
                                                {location.description}
                                            </div>
                                        )}

                                        {location.menu && location.menu.length > 0 && (
                                            <div style={{
                                                fontSize: '12px', 
                                                color: '#666', 
                                                marginTop: '6px',
                                                fontStyle: 'italic'
                                            }}>
                                                Menu: {location.menu.slice(0, 3).join(', ')}
                                                {location.menu.length > 3 && '...'}
                                            </div>
                                        )}
                                        
                                        <div style={{
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: '12px', 
                                            marginTop: '8px'
                                        }}>
                                            {location.waitTime && (
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    ⏱️ {location.waitTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="wine-walk-location-actions">
                                        <button 
                                            className="wine-walk-btn wine-walk-btn-primary wine-walk-btn-small"
                                            onClick={() => setStatus({ message: `Viewing menu for ${location.name}`, type: 'success', visible: true })}
                                        >
                                            View Menu
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                }}>
                    <div>🎪 EzFest Food Truck Festival</div>
                    <div style={{marginTop: '5px'}}>
                        Location: {ezfestLocations.festivalInfo.location}
                    </div>
                    <div style={{marginTop: '5px'}}>
                        Date: {ezfestLocations.festivalInfo.date}
                    </div>
                    <div style={{marginTop: '5px', fontSize: '12px', opacity: 0.6}}>
                        ⚡ Powered by Seamless
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodTruckMap; 