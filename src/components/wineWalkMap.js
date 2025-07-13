import React, { useState, useEffect, useRef, useCallback } from 'react';

const WineWalkMap = () => {
    // Configuration flags - easily change these for different environments
    const DEMO_MODE = true; // Set to false for production with real Google Maps
    const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your actual API key
    const ENABLE_CONTINUOUS_TRACKING = false; // Set to true for continuous GPS tracking
    
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [locations, setLocations] = useState([]);
    const [locationMarkers, setLocationMarkers] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '', visible: false });
    const [mapsLoaded, setMapsLoaded] = useState(false);

    // Mock data for wine walk locations since JSON file might not be available
    const defaultWineWalkData = {
        search_center: {
            address: "Downtown Clermont, FL",
            coordinates: {
                latitude: 28.5493,
                longitude: -81.7731
            },
            radius: "1 mile"
        },
        total_establishments: 8,
        search_date: "2025-01-15",
        establishments: [
            {
                name: "The Roasted Spirit",
                address: "756 W Montrose Street, Clermont, FL 34711",
                category: "Bar/Cocktail Lounge",
                description: "Elevated spirits bar with craft cocktails",
                phone: "(352) 394-8844",
                specialties: ["Craft Cocktails", "Wine Selection", "Small Plates"],
                hours: {
                    monday_thursday: "11:00 AM - 11:00 PM",
                    friday_saturday: "11:00 AM - 12:00 AM",
                    sunday: "12:00 PM - 10:00 PM"
                },
                distance_from_center: "0.1 miles"
            },
            {
                name: "Clermont Brewing Company",
                address: "691 W Montrose St, Clermont, FL 34711",
                category: "Brewery/Restaurant",
                description: "Local brewery with handcrafted beers and pub food",
                phone: "(352) 241-2337",
                specialties: ["Craft Beer", "Burgers", "Wings"],
                hours: {
                    monday_thursday: "11:00 AM - 10:00 PM",
                    friday_saturday: "11:00 AM - 11:00 PM",
                    sunday: "12:00 PM - 9:00 PM"
                },
                distance_from_center: "0.2 miles"
            },
            {
                name: "Waterfront Inn",
                address: "1105 W Highway 50, Clermont, FL 34711",
                category: "Waterfront Restaurant/Bar",
                description: "Lakefront dining with beautiful sunset views",
                phone: "(352) 394-4424",
                specialties: ["Seafood", "Steaks", "Sunset Views"],
                hours: {
                    sunday_monday: "11:00 AM - 9:00 PM",
                    tuesday_wednesday: "11:00 AM - 9:00 PM",
                    thursday: "11:00 AM - 9:00 PM",
                    friday_saturday: "11:00 AM - 10:00 PM"
                },
                distance_from_center: "0.5 miles"
            },
            {
                name: "Los Tres Amigos",
                address: "1035 W Highway 50, Clermont, FL 34711",
                category: "Mexican Restaurant/Bar",
                description: "Authentic Mexican cuisine with margaritas",
                phone: "(352) 394-7041",
                specialties: ["Margaritas", "Tacos", "Fajitas"],
                hours: "Daily 11:00 AM - 10:00 PM",
                distance_from_center: "0.4 miles"
            },
            {
                name: "Hickory Point Bar & Grill",
                address: "2107 Hooks St, Clermont, FL 34711",
                category: "BBQ Restaurant",
                description: "Smoky BBQ and cold beers",
                phone: "(352) 394-2711",
                specialties: ["BBQ Ribs", "Brisket", "Cold Beer"],
                hours: "Daily 11:00 AM - 9:00 PM",
                distance_from_center: "0.8 miles"
            }
        ]
    };

    const showStatus = useCallback((message, type) => {
        setStatus({ message, type, visible: true });
        setTimeout(() => {
            setStatus(prev => ({ ...prev, visible: false }));
        }, 5000);
    }, []);

    const getLocationIcon = useCallback((type) => {
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
    }, []);

    const createInfoWindowContent = useCallback((location) => {
        return `
            <div style="padding: 12px; max-width: 300px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">
                    ${getLocationIcon(location.type)} ${location.name}
                    ${location.featured ? ' ⭐' : ''}
                </h4>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    ${location.address}
                </p>
                ${location.category ? `
                    <p style="margin: 4px 0; font-size: 12px; color: #d4af37; font-weight: bold;">
                        ${location.category}
                    </p>
                ` : ''}
                ${location.description ? `
                    <p style="margin: 8px 0; font-size: 12px; line-height: 1.4; color: #555;">
                        ${location.description}
                    </p>
                ` : ''}
                ${location.hours ? `
                    <p style="margin: 4px 0; font-size: 11px; color: #666;">
                        🕒 ${location.hours}
                    </p>
                ` : ''}
                ${location.phone ? `
                    <p style="margin: 4px 0; font-size: 11px; color: #666;">
                        📞 ${location.phone}
                    </p>
                ` : ''}
                <button 
                    onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}', '_blank')"
                    style="
                        background: linear-gradient(135deg, #d4af37, #f5d76e, #926f34);
                        color: #0a0a0a;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 8px;
                    "
                >
                    Get Directions
                </button>
            </div>
        `;
    }, [getLocationIcon]);

    const getMarkerIcon = useCallback((type) => {
        const icons = {
            winery: '🍷',
            restaurant: '🍽️',
            shop: '🛍️',
            checkpoint: '📍',
            hotel: '🏨',
            bar: '🍸',
            brewery: '🍺'
        };
        const icon = icons[type] || '🍽️';
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#d4af37" stroke-width="3"/>
                    <text x="20" y="28" text-anchor="middle" font-size="16" fill="#333">${icon}</text>
                </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
        };
    }, []);

    const addLocationMarkers = useCallback((mapInstance) => {
        if (!mapInstance || !window.google || !window.google.maps) return;
        
        // Clear existing markers safely
        locationMarkers.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        
        const newMarkers = [];
        locations.forEach((location, index) => {
            const position = {
                lat: location.lat + (index * 0.0005), // Smaller offset to prevent clustering
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
                // Close all other info windows
                newMarkers.forEach(m => {
                    if (m.infoWindow && m.infoWindow.close) {
                        m.infoWindow.close();
                    }
                });
                infoWindow.open(mapInstance, marker);
            });
            
            marker.infoWindow = infoWindow;
            newMarkers.push(marker);
        });
        
        setLocationMarkers(newMarkers);
        
        if (newMarkers.length > 0) {
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
        }
    }, [locations, locationMarkers, getMarkerIcon, createInfoWindowContent]);

    const initMap = useCallback(() => {
        if (!window.google || !window.google.maps || !mapRef.current) {
            console.log('Google Maps not ready yet');
            return;
        }
        
        const defaultCenter = { lat: 28.5493, lng: -81.7731 };
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 15,
            center: defaultCenter,
            styles: [
                { 
                    featureType: 'poi', 
                    elementType: 'labels', 
                    stylers: [{ visibility: 'off' }] 
                }
            ],
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        setMap(mapInstance);
        
        if (locations.length > 0) {
            addLocationMarkers(mapInstance);
        }
        
        showStatus('Interactive Google Maps loaded successfully!', 'success');
    }, [locations, addLocationMarkers, showStatus]);

    const loadGoogleMaps = useCallback(() => {
        if (DEMO_MODE) {
            // Demo mode - simulate map loading without actual Google Maps API
            setMapsLoaded(true);
            showStatus('Demo mode: Map interface loaded (no API key required)', 'success');
            console.log('Running in DEMO MODE - set DEMO_MODE to false for live Google Maps');
            return;
        }

        // Live mode - load actual Google Maps
        if (window.google && window.google.maps) {
            setMapsLoaded(true);
            initMap();
            return;
        }
        
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
            console.error('Google Maps API key not configured');
            showStatus('Google Maps API key required for live mode. Using demo mode.', 'error');
            setMapsLoaded(true);
            return;
        }
        
        showStatus('Loading Google Maps...', 'success');
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setMapsLoaded(true);
            initMap();
            showStatus('Google Maps loaded successfully!', 'success');
        };
        script.onerror = () => {
            console.error('Failed to load Google Maps API');
            showStatus('Failed to load Google Maps. Check your API key and internet connection.', 'error');
            setMapsLoaded(true); // Still show the interface, just without the map
        };
        document.head.appendChild(script);
    }, [initMap, showStatus]);

    const getCategoryType = useCallback((category) => {
        const categoryMap = {
            'Bar/Cocktail Lounge': 'bar',
            'BBQ Restaurant': 'restaurant',
            'Brewery/Restaurant': 'brewery',
            'Waterfront Restaurant/Bar': 'restaurant',
            'Mexican Restaurant/Bar': 'restaurant',
            'Fine Dining Restaurant/Bar': 'restaurant',
            'Restaurant': 'restaurant',
            'Bar': 'bar',
            'Brewery': 'brewery',
            'Winery': 'winery'
        };
        return categoryMap[category] || 'restaurant';
    }, []);

    const formatHours = useCallback((hours) => {
        if (!hours) return null;
        if (typeof hours === 'string') return hours;
        
        if (hours.monday_thursday) {
            return `Mon-Thu: ${hours.monday_thursday}, Fri-Sat: ${hours.friday_saturday || hours.monday_thursday}, Sun: ${hours.sunday || hours.monday_thursday}`;
        }
        if (hours.sunday_monday) {
            return `Sun-Mon: ${hours.sunday_monday}, Tue-Wed: ${hours.tuesday_wednesday}, Thu: ${hours.thursday}, Fri-Sat: ${hours.friday_saturday}`;
        }
        
        return 'See website for hours';
    }, []);

    const loadLocationsFromData = useCallback(() => {
        try {
            const wineWalkData = defaultWineWalkData; // Use the mock data
            let locationsData = [];
            
            if (wineWalkData && wineWalkData.establishments) {
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
            }
            
            if (locationsData.length > 0) {
                const sortedLocations = locationsData.sort((a, b) => {
                    return (a.order || a.id) - (b.order || b.id);
                });
                setLocations(sortedLocations);
                showStatus(`Loaded ${sortedLocations.length} local establishments!`, 'success');
                console.log('Loaded locations:', sortedLocations);
            } else {
                throw new Error('No valid locations found');
            }
        } catch (error) {
            console.error('Failed to load locations:', error);
            showStatus('Using demo data', 'error');
        }
    }, [getCategoryType, formatHours, showStatus]);

    useEffect(() => {
        loadLocationsFromData();
        loadGoogleMaps(); // Now uses the flag system
        
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [loadLocationsFromData, loadGoogleMaps, watchId]);

    // Rest of your methods remain the same...
    const calculateDistance = useCallback((pos1, pos2) => {
        const R = 6371;
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }, []);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            showStatus('Geolocation is not supported by this browser.', 'error');
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        
        if (ENABLE_CONTINUOUS_TRACKING) {
            // Continuous tracking mode
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    const newUserLocation = { lat, lng };
                    
                    setUserLocation(newUserLocation);
                    setIsTracking(true);
                    showStatus(`Location updated! Accuracy: ${Math.round(accuracy)}m`, 'success');
                    console.log('User position updated:', newUserLocation);
                    
                    // Update map marker if in live mode
                    if (!DEMO_MODE && map && window.google) {
                        if (userMarker) {
                            userMarker.setPosition(newUserLocation);
                        } else {
                            const marker = new window.google.maps.Marker({
                                position: newUserLocation,
                                map: map,
                                title: 'Your Location',
                                icon: {
                                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                                            <circle cx="15" cy="15" r="12" fill="#4285F4" stroke="#ffffff" stroke-width="3"/>
                                            <circle cx="15" cy="15" r="5" fill="#ffffff"/>
                                        </svg>
                                    `),
                                    scaledSize: new window.google.maps.Size(30, 30),
                                    anchor: new window.google.maps.Point(15, 15)
                                },
                                zIndex: 1000
                            });
                            setUserMarker(marker);
                        }
                        map.setCenter(newUserLocation);
                        map.setZoom(16);
                    }
                },
                (error) => {
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
                },
                options
            );
            setWatchId(id);
        } else {
            // Single location mode
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    const newUserLocation = { lat, lng };
                    
                    setUserLocation(newUserLocation);
                    setIsTracking(true);
                    showStatus(`Location found! Accuracy: ${Math.round(accuracy)}m`, 'success');
                    console.log('User position:', newUserLocation);
                },
                (error) => {
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
                },
                options
            );
        }
    }, [showStatus, map, userMarker]);

    const stopTracking = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
        setUserLocation(null);
        showStatus('GPS tracking stopped.', 'success');
    }, [watchId, showStatus]);

    const findNearestLocation = useCallback(() => {
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
            showStatus(
                `Nearest: ${nearestLocation.name} (${nearestDistance.toFixed(1)} km away)`, 
                'success'
            );
        }
    }, [userLocation, locations, calculateDistance, showStatus]);

    const showAllLocations = useCallback(() => {
        if (locations.length === 0) {
            showStatus('No locations to display.', 'error');
            return;
        }
        
        console.log('Showing all locations:', locations);
        showStatus(`Displaying all ${locations.length} establishments`, 'success');
    }, [locations, showStatus]);

    const getDirections = useCallback((lat, lng, name) => {
        const destination = `${lat},${lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, '_blank');
        showStatus(`Opening directions to ${name}`, 'success');
    }, [showStatus]);

    const getDistanceToLocation = useCallback((location) => {
        if (!userLocation) return null;
        const distance = calculateDistance(userLocation, location);
        return distance.toFixed(1);
    }, [userLocation, calculateDistance]);

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#121212',
            minHeight: '100vh',
            color: '#ffffff',
            background: 'linear-gradient(rgba(18, 18, 18, 0.95), rgba(18, 18, 18, 0.95)), radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.08), transparent 40%), radial-gradient(circle at 70% 60%, rgba(184, 134, 11, 0.05), transparent 50%)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{
                        fontSize: '2.5em',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #d4af37, #f5d76e, #926f34)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}>
                        🍽️ Clermont Food & Drink Walk
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                        Discover the best local establishments within walking distance
                    </p>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
                        Explore {defaultWineWalkData.total_establishments} establishments within {defaultWineWalkData.search_center.radius} of downtown Clermont
                    </div>
                    {/* Configuration Info */}
                    <div style={{ 
                        fontSize: '12px', 
                        opacity: 0.6, 
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: DEMO_MODE ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                        borderRadius: '15px',
                        display: 'inline-block',
                        border: DEMO_MODE ? '1px solid rgba(255, 193, 7, 0.3)' : '1px solid rgba(40, 167, 69, 0.3)'
                    }}>
                        {DEMO_MODE ? '🔧 Demo Mode' : '🌐 Live Mode'} | 
                        {ENABLE_CONTINUOUS_TRACKING ? ' Continuous GPS' : ' Single Location GPS'}
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(224, 184, 65, 0.1)',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        <button 
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                background: isTracking ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #d4af37, #f5d76e, #926f34)',
                                color: isTracking ? 'rgba(255, 255, 255, 0.9)' : '#0a0a0a',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={isTracking ? stopTracking : startTracking}
                        >
                            {isTracking ? '⏹️ Stop Tracking' : '📍 Start GPS Tracking'}
                        </button>
                        
                        <button 
                            style={{
                                padding: '12px 20px',
                                border: '1px solid rgba(224, 184, 65, 0.3)',
                                borderRadius: '25px',
                                cursor: userLocation ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                opacity: userLocation ? 1 : 0.5,
                                transition: 'all 0.3s ease'
                            }}
                            onClick={findNearestLocation}
                            disabled={!userLocation}
                        >
                            🎯 Find Nearest Location
                        </button>
                        
                        <button 
                            style={{
                                padding: '12px 20px',
                                border: '1px solid rgba(224, 184, 65, 0.3)',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={showAllLocations}
                        >
                            🗺️ Show All Locations
                        </button>
                    </div>
                    
                    {status.visible && (
                        <div style={{
                            margin: '15px 0',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            background: status.type === 'success' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                            color: status.type === 'success' ? '#e0b841' : '#ff6b6b',
                            border: status.type === 'success' ? '1px solid rgba(224, 184, 65, 0.2)' : '1px solid rgba(255, 107, 107, 0.2)'
                        }}>
                            {status.message}
                        </div>
                    )}

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

                <div style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(224, 184, 65, 0.1)',
                    height: '600px',
                    position: 'relative',
                    marginBottom: '20px'
                }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
                        {DEMO_MODE ? (
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
                                <div>Interactive Map (Demo Mode)</div>
                                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                                    GPS tracking and directions still work!
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '20px', opacity: 0.6, maxWidth: '400px' }}>
                                    Set DEMO_MODE = false and add your Google Maps API key for full map functionality
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    marginTop: '15px',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '20px',
                                    opacity: 0.7
                                }}>
                                    Current: DEMO_MODE = {DEMO_MODE.toString()}
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

                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px',
                    borderRadius: '15px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    marginTop: '20px'
                }}>
                    <h3 style={{ color: '#333', marginBottom: '20px' }}>Local Establishments ({locations.length})</h3>
                    <div>
                        {locations.length === 0 ? (
                            <div style={{
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                Loading locations...
                            </div>
                        ) : (
                            locations.map((location, index) => (
                                <div key={location.id || index} style={{
                                    padding: '15px',
                                    border: '1px solid #eee',
                                    borderRadius: '10px',
                                    marginBottom: '10px',
                                    background: 'white',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
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
                                        <div style={{ color: '#666', fontSize: '14px' }}>{location.address}</div>
                                        
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
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            style={{
                                                padding: '8px 15px',
                                                fontSize: '12px',
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #d4af37, #f5d76e, #926f34)',
                                                color: '#0a0a0a',
                                                border: 'none',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
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
                        Search center: {defaultWineWalkData.search_center.address}
                    </div>
                    <div style={{marginTop: '5px'}}>
                        Search date: {defaultWineWalkData.search_date}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WineWalkMap;