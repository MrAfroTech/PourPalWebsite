import React, { useState } from 'react';
import '../styles/FoodTruckMap.css';
import ezfestLocations from '../data/ezfestLocations.json';

const FoodTruckMap = () => {
    const [selectedTruck, setSelectedTruck] = useState(null);

    return (
        <div className="food-truck-container">
            <div className="food-truck-inner">
                <div className="food-truck-header">
                    <h1>🎪 Food Truck Festival</h1>
                    <p>Explore delicious food trucks at EzFest</p>
                    <div style={{fontSize: '14px', opacity: 0.8, marginTop: '10px'}}>
                        {ezfestLocations.foodTrucks.length} food trucks serving amazing cuisine
                    </div>
                    <div style={{ 
                        fontSize: '12px', 
                        opacity: 0.6, 
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        borderRadius: '15px',
                        display: 'inline-block',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}>
                        🎪 EzFest Festival | 📍 Central Park, New York
                    </div>
                </div>

                <div className="food-truck-map-container">
                    <div className="food-truck-map">
                        {/* Festival background with paths */}
                        <div className="festival-background">
                            <div className="festival-path path-1"></div>
                            <div className="festival-path path-2"></div>
                            <div className="festival-path path-3"></div>
                        </div>
                        
                        {/* Food truck markers */}
                        {ezfestLocations.foodTrucks.map((truck) => (
                            <div
                                key={truck.id}
                                className={`truck-marker ${selectedTruck?.id === truck.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTruck(truck)}
                                style={{
                                    left: `${20 + (truck.id - 1) * 10}%`,
                                    top: `${15 + (truck.id - 1) * 8}%`
                                }}
                            >
                                <div className="truck-icon">{truck.icon}</div>
                                <div className="truck-tooltip">{truck.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="food-truck-location-list">
                    <h3>Food Trucks ({ezfestLocations.foodTrucks.length})</h3>
                    <div>
                        {ezfestLocations.foodTrucks.map((truck, index) => (
                            <div 
                                key={truck.id || index} 
                                className={`food-truck-location-item ${selectedTruck?.id === truck.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTruck(truck)}
                            >
                                <div className="food-truck-location-info">
                                    <div className="food-truck-location-name">
                                        {truck.icon} {truck.name}
                                        <span style={{color: '#ffd700', marginLeft: '8px'}}>⭐ {truck.rating}</span>
                                    </div>
                                    <div className="food-truck-location-type">{truck.type}</div>
                                    <div className="food-truck-location-description">{truck.description}</div>
                                    
                                    <div style={{
                                        fontSize: '12px', 
                                        color: '#666', 
                                        marginTop: '6px',
                                        fontStyle: 'italic'
                                    }}>
                                        ⏱️ {truck.waitTime}
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '12px', 
                                        color: '#888', 
                                        marginTop: '4px'
                                    }}>
                                        Popular: {truck.menu.slice(0, 3).join(', ')}
                                        {truck.menu.length > 3 && '...'}
                                    </div>
                                </div>
                                
                                <div className="food-truck-location-actions">
                                    <button 
                                        className="food-truck-btn food-truck-btn-primary food-truck-btn-small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTruck(truck);
                                        }}
                                    >
                                        View Menu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedTruck && (
                    <div className="food-truck-detail">
                        <div className="food-truck-detail-header">
                            <h3>{selectedTruck.icon} {selectedTruck.name}</h3>
                            <span className="food-truck-detail-type">{selectedTruck.type}</span>
                        </div>
                        <p className="food-truck-detail-description">{selectedTruck.description}</p>
                        <div className="food-truck-detail-stats">
                            <span className="rating">⭐ {selectedTruck.rating}</span>
                            <span className="wait-time">⏱️ {selectedTruck.waitTime}</span>
                        </div>
                        <div className="food-truck-detail-menu">
                            <strong>Full Menu:</strong>
                            <div className="menu-items">
                                {selectedTruck.menu.map((item, index) => (
                                    <span key={index} className="menu-item">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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