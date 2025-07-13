import React, { useState, useEffect, useRef } from 'react';
import '../styles/wineWalkMap.css';
import wineWalkData from '../data/wineWalkLocations.json';

const WineWalkMap = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [locations, setLocations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '', visible: false });

    // Initialize component when it mounts
    useEffect(() => {
        loadLocationsFromJSON();
        initMap();

        // Cleanup function
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    // Initialize map placeholder
    const initMap = () => {
        const mockMap = {
            setCenter: (location) => console.log('Map centered on:', location),
            setZoom: (zoom) => console.log('Map zoom set to:', zoom),
            fitBounds: (bounds) => console.log('Map bounds fitted:', bounds)
        };
        setMap(mockMap);
    };

    // Load locations from JSON file
    const loadLocationsFromJSON = () => {
        try {
            // Check if we have the new data structure (establishments) or old structure (locations)
            let locationsData = [];
            let wineWalkInfo = null;

            if (wineWalkData && wineWalkData.establishments) {
                // New structure with Clermont establishments
                locationsData = wineWalkData.establishments.map((establishment, index) => ({
                    id: index + 1,
                    name: establishment.name,
                    address: establishment.address,
                    type: getCategoryType(establishment.category),
                    lat: wineWalkData.search_center?.coordinates?.latitude || 28.5493,
                    lng: wineWalkData.search_center?.coordinates?.longitude || -81.7731,
                    description: establishment.description,
                    phone: establishment.phone,
                    website: establishment.website,
                    hours: formatHours(establishment.hours),
                    featured: establishment.specialties && establishment.specialties.length > 2,
                    order: index + 1,
                    category: establishment.category,
                    specialties: establishment.specialties,
                    distance_from_center: establishment.distance_from_center
                }));

                wineWalkInfo = {
                    name: "Clermont Food & Drink Walk",
                    description: `Explore ${wineWalkData.total_establishments} great establishments within ${wineWalkData.search_center?.radius || 'walking distance'} of downtown Clermont`,
                    lastUpdated: wineWalkData.search_date || "2025-01-12",
                    totalLocations: wineWalkData.total_establishments || locationsData.length
                };
            } else if (wineWalkData && wineWalkData.locations) {
                // Original structure
                locationsData = wineWalkData.locations;
                wineWalkInfo = wineWalkData.wineWalk;
            } else {
                throw new Error('No locations or establishments found in JSON file');
            }

            if (locationsData.length > 0) {
                // Sort locations by order field, then by id
                const sortedLocations = locationsData.sort((a, b) => {
                    return (a.order || a.id) - (b.order || b.id);
                });
                
                setLocations(sortedLocations);
                showStatus(`Loaded ${sortedLocations.length} local establishments!`, 'success');
                
                console.log('Walk Info:', wineWalkInfo);
                console.log('Loaded locations:', sortedLocations);
            } else {
                throw new Error('No valid locations found');
            }
        } catch (error) {
            console.error('Failed to load locations from JSON:', error);
            showStatus('Loading default locations (JSON file issue)', 'error');
            loadDefaultLocations();
        }
    };

    // Convert category to location type
    const getCategoryType = (category) => {
        const categoryMap = {
            'Bar/Cocktail Lounge': 'bar',
            'BBQ Restaurant': 'restaurant',
            'Brewery/Restaurant': 'restaurant',
            'Waterfront Restaurant/Bar': 'restaurant',
            'Mexican Restaurant/Bar': 'restaurant',
            'Fine Dining Restaurant/Bar': 'restaurant',
            'Restaurant': 'restaurant',
            'Bar': 'bar',
            'Brewery': 'bar',
            'Winery': 'winery'
        };
        return categoryMap[category] || 'restaurant';
    };

    // Format hours for display
    const formatHours = (hours) => {
        if (!hours) return null;
        if (typeof hours === 'string') return hours;
        
        // Handle complex hours object
        if (hours.monday_thursday) {
            return `Mon-Thu: ${hours.monday_thursday}, Fri-Sat: ${hours.friday_saturday || hours.monday_thursday}, Sun: ${hours.sunday || hours.monday_thursday}`;
        }
        if (hours.sunday_monday) {
            return `Sun-Mon: ${hours.sunday_monday}, Tue-Wed: ${hours.tuesday_wednesday}, Thu: ${hours.thursday}, Fri-Sat: ${hours.friday_saturday}`;
        }
        
        return 'See website for hours';
    };

    // Load default locations if JSON fails
    const loadDefaultLocations = () => {
        const defaultLocations = [
            {
                id: 1,
                name: "Napa Valley Wine Train",
                address: "1275 McKinstry St, Napa, CA 94559",
                type: "winery",
                lat: 38.2888,
                lng: -122.2869,
                description: "Historic wine train experience",
                phone: "(707) 253-2111",
                hours: "Daily 9:00 AM - 6:00 PM",
                featured: true,
                order: 1
            },
            {
                id: 2,
                name: "Oxbow Public Market",
                address: "610 1st St, Napa, CA 94559",
                type: "restaurant",
                lat: 38.2996,
                lng: -122.2838,
                description: "Gourmet food market",
                phone: "(707) 226-6529",
                hours: "Daily 9:00 AM - 9:00 PM",
                featured: true,
                order: 2
            },
            {
                id: 3,
                name: "Downtown Napa",
                address: "Main St, Napa, CA",
                type: "checkpoint",
                lat: 38.2975,
                lng: -122.2869,
                description: "Central meeting point",
                hours: "24/7",
                featured: false,
                order: 3
            }
        ];

        setLocations(defaultLocations);
        console.log('Loaded default locations:', defaultLocations);
    };

    // Start GPS tracking
    const startTracking = () => {
        if (!navigator.geolocation) {
            showStatus('Geolocation is not supported by this browser.', 'error');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };

        const id = navigator.geolocation.watchPosition(
            updatePosition,
            handleLocationError,
            options
        );
        
        setWatchId(id);
        setIsTracking(true);
        showStatus('GPS tracking started successfully!', 'success');
    };

    // Stop GPS tracking
    const stopTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setIsTracking(false);
            setUserLocation(null);
            showStatus('GPS tracking stopped.', 'success');
        }
    };

    // Update user position
    const updatePosition = (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const newUserLocation = { lat, lng };
        setUserLocation(newUserLocation);
        
        console.log('User position updated:', newUserLocation);
        showStatus(`Location updated! Accuracy: ${Math.round(accuracy)}m`, 'success');
        
        // Update distances to all locations
        updateDistances(newUserLocation);
    };

    // Handle location errors
    const handleLocationError = (error) => {
        let message;
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = "Location access denied. Please enable location services.";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                message = "Location request timed out.";
                break;
            default:
                message = "An unknown error occurred.";
                break;
        }
        showStatus(message, 'error');
        setIsTracking(false);
    };

    // Find nearest location to user
    const findNearestLocation = () => {
        if (!userLocation) {
            showStatus('Please start GPS tracking first.', 'error');
            return;
        }

        if (locations.length === 0) {
            showStatus('No locations available.', 'error');
            return;
        }

        let nearestLocation = null;
        let nearestDistance = Infinity;

        locations.forEach(location => {
            const distance = calculateDistance(userLocation, location);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestLocation = location;
            }
        });

        if (nearestLocation) {
            console.log('Nearest location found:', nearestLocation);
            showStatus(
                `Nearest: ${nearestLocation.name} (${nearestDistance.toFixed(1)} km away)`, 
                'success'
            );
        }
    };

    // Show all locations on map
    const showAllLocations = () => {
        if (locations.length === 0) {
            showStatus('No locations to display.', 'error');
            return;
        }

        console.log('Showing all locations:', locations);
        showStatus(`Displaying all ${locations.length} wine walk locations`, 'success');
    };

    // Calculate distance between two points
    const calculateDistance = (pos1, pos2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Update distances from user to all locations
    const updateDistances = (userPos) => {
        locations.forEach((location, index) => {
            const distance = calculateDistance(userPos, location);
            console.log(`Distance to ${location.name}: ${distance.toFixed(1)} km`);
        });
    };

    // Get directions to a location
    const getDirections = (lat, lng, name) => {
        const destination = `${lat},${lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, '_blank');
        showStatus(`Opening directions to ${name}`, 'success');
    };

    // Get icon for location type
    const getLocationIcon = (type) => {
        const icons = {
            winery: '🍷',
            restaurant: '🍽️',
            shop: '🛍️',
            checkpoint: '📍',
            hotel: '🏨',
            bar: '🍸',
            brewery: '🍺'
        };
        return icons[type] || '🍽️';
    };

    // Show status message
    const showStatus = (message, type) => {
        setStatus({ message, type, visible: true });
        setTimeout(() => {
            setStatus(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    // Get user's distance to a location
    const getDistanceToLocation = (location) => {
        if (!userLocation) return null;
        const distance = calculateDistance(userLocation, location);
        return distance.toFixed(1);
    };

    return (
        <div className="wine-walk-container">
            <div className="wine-walk-inner">
                {/* Header Section */}
                <div className="wine-walk-header">
                    <h1>🍽️ Clermont Food & Drink Walk</h1>
                    <p>Discover the best local establishments within walking distance</p>
                    {wineWalkData.search_center && (
                        <div style={{fontSize: '14px', opacity: 0.8, marginTop: '10px'}}>
                            Explore {wineWalkData.total_establishments} establishments within {wineWalkData.search_center.radius} of downtown Clermont
                        </div>
                    )}
                </div>

                {/* Control Buttons */}
                <div className="wine-walk-controls">
                    <div className="wine-walk-button-group">
                        <button 
                            className={`wine-walk-btn ${isTracking ? 'wine-walk-btn-secondary' : 'wine-walk-btn-primary'}`}
                            onClick={isTracking ? stopTracking : startTracking}
                        >
                            {isTracking ? '⏹️ Stop Tracking' : '📍 Start GPS Tracking'}
                        </button>
                        <button 
                            className="wine-walk-btn wine-walk-btn-secondary" 
                            onClick={findNearestLocation}
                            disabled={!userLocation}
                        >
                            🎯 Find Nearest Location
                        </button>
                        <button 
                            className="wine-walk-btn wine-walk-btn-secondary" 
                            onClick={showAllLocations}
                        >
                            🗺️ Show All Locations
                        </button>
                    </div>
                    
                    {/* Status Message */}
                    {status.visible && (
                        <div className={`wine-walk-status ${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    {/* User Location Info */}
                    {userLocation && (
                        <div style={{
                            marginTop: '10px', 
                            padding: '8px', 
                            background: 'rgba(212, 175, 55, 0.1)', 
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: '#e0b841'
                        }}>
                            📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </div>
                    )}
                </div>

                {/* Map Container */}
                <div className="wine-walk-map-container">
                    <div ref={mapRef} className="wine-walk-map">
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            color: 'white',
                            fontSize: '18px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗺️</div>
                            <div>Interactive Map Placeholder</div>
                            <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                                Google Maps will be integrated here
                            </div>
                            <div style={{ fontSize: '14px', marginTop: '20px', opacity: 0.6 }}>
                                {locations.length} locations loaded
                            </div>
                            {userLocation && (
                                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.6 }}>
                                    GPS tracking active
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Locations List */}
                <div className="wine-walk-location-list">
                    <h3>Local Establishments ({locations.length})</h3>
                    <div>
                        {locations.length === 0 ? (
                            <div style={{
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                No locations loaded. Check your wineWalkLocations.json file.
                            </div>
                        ) : (
                            locations.map((location, index) => (
                                <div key={location.id || index} className="wine-walk-location-item">
                                    <div className="wine-walk-location-info">
                                        <div className="wine-walk-location-name">
                                            {getLocationIcon(location.type)} {location.name}
                                            {location.featured && (
                                                <span style={{color: '#d4af37', marginLeft: '8px'}}>⭐</span>
                                            )}
                                            {userLocation && (
                                                <span style={{
                                                    color: '#666', 
                                                    fontSize: '12px', 
                                                    marginLeft: '8px'
                                                }}>
                                                    ({getDistanceToLocation(location)} km)
                                                </span>
                                            )}
                                            {location.distance_from_center && (
                                                <span style={{
                                                    color: '#888', 
                                                    fontSize: '11px', 
                                                    marginLeft: '8px'
                                                }}>
                                                    • {location.distance_from_center}
                                                </span>
                                            )}
                                        </div>
                                        <div className="wine-walk-location-address">{location.address}</div>
                                        
                                        {location.category && (
                                            <div style={{
                                                fontSize: '12px', 
                                                color: '#d4af37', 
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

                                        {location.specialties && location.specialties.length > 0 && (
                                            <div style={{
                                                fontSize: '12px', 
                                                color: '#666', 
                                                marginTop: '6px',
                                                fontStyle: 'italic'
                                            }}>
                                                Specialties: {location.specialties.slice(0, 3).join(', ')}
                                                {location.specialties.length > 3 && '...'}
                                            </div>
                                        )}
                                        
                                        <div style={{
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: '12px', 
                                            marginTop: '8px'
                                        }}>
                                            {location.hours && (
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    🕒 {location.hours}
                                                </div>
                                            )}
                                            {location.phone && (
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    📞 {location.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="wine-walk-location-actions">
                                        <button 
                                            className="wine-walk-btn wine-walk-btn-primary wine-walk-btn-small"
                                            onClick={() => getDirections(location.lat, location.lng, location.name)}
                                        >
                                            Directions
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                {wineWalkData.search_center && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '30px',
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                        <div>Clermont Food & Drink Walk</div>
                        <div style={{marginTop: '5px'}}>
                            Search center: {wineWalkData.search_center.address}
                        </div>
                        <div style={{marginTop: '5px'}}>
                            Search date: {wineWalkData.search_date}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WineWalkMap;