// Example React component to display donor search results with compatibility badges

import React, { useState, useEffect } from 'react';

const DonorSearchResults = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    lat: '',
    lng: '',
    bloodGroup: '',
    organType: '',
    age: '',
    urgency: 3,
    radius: 50
  });

  // Function to get badge style based on compatibility color
  const getCompatibilityBadgeStyle = (color, status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textAlign: 'center',
      display: 'inline-block',
      minWidth: '120px'
    };

    switch(color) {
      case 'green':
        return {
          ...baseStyle,
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'yellow':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7'
        };
      case 'red':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      case 'gray':
      default:
        return {
          ...baseStyle,
          backgroundColor: '#e2e3e5',
          color: '#6c757d',
          border: '1px solid #d6d8db'
        };
    }
  };

  // Search function
  const searchDonors = async () => {
    if (!searchParams.lat || !searchParams.lng) {
      alert('Please provide latitude and longitude');
      return;
    }

    setLoading(true);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      lat: searchParams.lat,
      lng: searchParams.lng,
      radius: searchParams.radius.toString()
    });

    // Add optional parameters for compatibility search
    if (searchParams.bloodGroup) queryParams.append('bloodGroup', searchParams.bloodGroup);
    if (searchParams.organType) queryParams.append('organType', searchParams.organType);
    if (searchParams.age) queryParams.append('age', searchParams.age.toString());
    if (searchParams.urgency) queryParams.append('urgency', searchParams.urgency.toString());

    try {
      const response = await fetch(`/api/organ-donor/search?${queryParams}`, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDonors(result.data);
      } else {
        alert('Search failed: ' + result.message);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Organ Donor Search</h2>
      
      {/* Search Form */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Latitude *</label>
            <input
              type="number"
              step="any"
              value={searchParams.lat}
              onChange={(e) => setSearchParams({...searchParams, lat: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="28.6139"
            />
          </div>
          
          <div>
            <label>Longitude *</label>
            <input
              type="number"
              step="any"
              value={searchParams.lng}
              onChange={(e) => setSearchParams({...searchParams, lng: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="77.2090"
            />
          </div>
          
          <div>
            <label>Blood Group (for compatibility)</label>
            <select
              value={searchParams.bloodGroup}
              onChange={(e) => setSearchParams({...searchParams, bloodGroup: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div>
            <label>Organ Type (for compatibility)</label>
            <select
              value={searchParams.organType}
              onChange={(e) => setSearchParams({...searchParams, organType: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select Organ</option>
              <option value="Heart">Heart</option>
              <option value="Liver">Liver</option>
              <option value="Kidneys">Kidneys</option>
              <option value="Lungs">Lungs</option>
              <option value="Pancreas">Pancreas</option>
              <option value="Corneas">Corneas</option>
            </select>
          </div>
          
          <div>
            <label>Age</label>
            <input
              type="number"
              value={searchParams.age}
              onChange={(e) => setSearchParams({...searchParams, age: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="35"
            />
          </div>
          
          <div>
            <label>Radius (km)</label>
            <input
              type="number"
              value={searchParams.radius}
              onChange={(e) => setSearchParams({...searchParams, radius: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
        </div>
        
        <button
          onClick={searchDonors}
          disabled={loading}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search Donors'}
        </button>
      </div>

      {/* Search Mode Indicator */}
      {donors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ 
            backgroundColor: donors[0]?.searchMode === 'compatibility' ? '#d4edda' : '#e2e3e5',
            padding: '10px',
            borderRadius: '4px',
            margin: '0'
          }}>
            <strong>Search Mode:</strong> {
              donors[0]?.searchMode === 'compatibility' 
                ? '🧬 Compatibility Analysis - Results sorted by medical compatibility' 
                : '📍 General Location Search - Add blood group and organ type for compatibility analysis'
            }
          </p>
        </div>
      )}

      {/* Results */}
      <div>
        <h3>Search Results ({donors.length} donors found)</h3>
        
        {donors.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
            No donors found. Try adjusting your search criteria.
          </p>
        )}
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {donors.map((donor, index) => (
            <div
              key={donor._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {donor.name}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                    <div><strong>Blood Group:</strong> {donor.bloodGroup}</div>
                    <div><strong>Age:</strong> {donor.age} years</div>
                    <div><strong>Location:</strong> {donor.location}</div>
                    <div><strong>Distance:</strong> {donor.distance} km</div>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Available Organs:</strong> {donor.organType.join(', ')}
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    <strong>Contact:</strong> {donor.email} | {donor.contactNumber}
                  </div>
                </div>
                
                {/* Compatibility Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={getCompatibilityBadgeStyle(donor.compatibilityColor, donor.compatibilityStatus)}>
                    {donor.compatibilityStatus}
                  </div>
                  
                  {donor.compatibilityScore !== null && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                      Score: {donor.compatibilityScore}
                      {donor.searchMode === 'compatibility' && '/115'}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#6c757d' }}>
                    {donor.compatibilityLevel}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonorSearchResults;
