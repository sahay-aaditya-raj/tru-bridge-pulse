'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const DonorSearchPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [searchMode, setSearchMode] = useState('coordinates'); // 'coordinates' or 'location'
  const locationInputRef = useRef(null);
  const [expandedDonors, setExpandedDonors] = useState(new Set());
  
  const [searchParams, setSearchParams] = useState({
    lat: '',
    lng: '',
    radius: '50',
    bloodGroup: '',
    organType: '',
    age: '',
    limit: '20'
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organTypes = [
    'Heart',
    'Liver',
    'Kidneys',
    'Lungs',
    'Pancreas',
    'Small Intestine',
    'Corneas',
    'Skin',
    'Bone',
    'Heart Valves',
    'Blood Vessels',
    'Connective Tissue'
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setSearchParams(prev => ({
            ...prev,
            lat: latitude.toString(),
            lng: longitude.toString()
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setMessage('Could not get your current location. Please enter coordinates manually.');
          setMessageType('error');
        }
      );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setManualLocation(value);

    // Fetch location suggestions when typing
    if (value.length >= 3) {
      fetchLocationSuggestions(value);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchLocationSuggestions = async (query) => {
    try {
      const response = await fetch(`/api/location-suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setLocationSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationSelect = (suggestion) => {
    setManualLocation(suggestion.display_name);
    setSearchParams(prev => ({
      ...prev,
      lat: suggestion.lat.toString(),
      lng: suggestion.lon.toString()
    }));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    if (mode === 'coordinates') {
      setManualLocation('');
    } else {
      // Clear coordinates when switching to location mode
      setSearchParams(prev => ({
        ...prev,
        lat: '',
        lng: ''
      }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setMessage('');
    setDonors([]);

    try {
      // If in location mode and no coordinates are set, try to get them from the location
      if (searchMode === 'location' && (!searchParams.lat || !searchParams.lng) && manualLocation) {
        setMessage('Getting coordinates for the location...');
        setMessageType('info');
        
        try {
          const response = await fetch(`/api/location-suggestions?q=${encodeURIComponent(manualLocation)}`);
          const data = await response.json();
          
          if (data.success && data.suggestions.length > 0) {
            const firstSuggestion = data.suggestions[0];
            setSearchParams(prev => ({
              ...prev,
              lat: firstSuggestion.lat.toString(),
              lng: firstSuggestion.lon.toString()
            }));
            
            // Continue with the search using the new coordinates
            await performSearch({
              ...searchParams,
              lat: firstSuggestion.lat.toString(),
              lng: firstSuggestion.lon.toString()
            });
            return;
          } else {
            setMessage('Could not find coordinates for the specified location');
            setMessageType('error');
            setIsSearching(false);
            return;
          }
        } catch (error) {
          setMessage('Error getting location coordinates');
          setMessageType('error');
          setIsSearching(false);
          return;
        }
      }

      if (!searchParams.lat || !searchParams.lng) {
        setMessage('Please provide coordinates or select a location');
        setMessageType('error');
        setIsSearching(false);
        return;
      }

      await performSearch(searchParams);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('An error occurred during search');
      setMessageType('error');
      setIsSearching(false);
    }
  };

  const performSearch = async (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    // Add mode parameter to enable compatibility scoring when blood group and organ type are provided
    if (params.bloodGroup && params.organType) {
      queryParams.append('mode', 'compatibility');
    }

    const response = await fetch(`/api/organ-donor/search?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      setDonors(data.data);
      const modeText = params.bloodGroup && params.organType ? 
        `Found ${data.count} donor(s) with compatibility analysis` : 
        `Found ${data.count} donor(s) within ${params.radius}km`;
      setMessage(modeText);
      setMessageType('success');
    } else {
      setMessage(data.message || 'Search failed');
      setMessageType('error');
    }
    
    setIsSearching(false);
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      setSearchParams(prev => ({
        ...prev,
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString()
      }));
    }
  };

  // Helper function to get compatibility badge
  const getCompatibilityBadge = (compatibilityStatus) => {
    const statusConfig = {
      'fully-compatible': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Fully Compatible' 
      },
      'compatible': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Compatible' 
      },
      'not-compatible': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Not Compatible' 
      },
      'unknown': { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: 'No Analysis' 
      }
    };

    const config = statusConfig[compatibilityStatus] || statusConfig['unknown'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Helper function to toggle algorithm breakdown
  const toggleAlgorithmBreakdown = (donorId) => {
    const newExpanded = new Set(expandedDonors);
    if (newExpanded.has(donorId)) {
      newExpanded.delete(donorId);
    } else {
      newExpanded.add(donorId);
    }
    setExpandedDonors(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Search Organ Donors</h1>
            <p className="mt-2 text-gray-600">
              Find nearby organ donors for emergency situations
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : messageType === 'info'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMode"
                    value="coordinates"
                    checked={searchMode === 'coordinates'}
                    onChange={(e) => handleSearchModeChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use Coordinates</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMode"
                    value="location"
                    checked={searchMode === 'location'}
                    onChange={(e) => handleSearchModeChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Search by Location</span>
                </label>
              </div>
            </div>

            {searchMode === 'location' ? (
              <div className="relative mb-6">
                <label htmlFor="manualLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="manualLocation"
                  name="manualLocation"
                  required
                  ref={locationInputRef}
                  value={manualLocation}
                  onChange={handleLocationInputChange}
                  placeholder="Start typing your location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleLocationSelect(suggestion)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {suggestion.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchParams.lat && searchParams.lng && (
                  <p className="mt-2 text-sm text-gray-500">
                    Coordinates: {parseFloat(searchParams.lat).toFixed(4)}, {parseFloat(searchParams.lng).toFixed(4)}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    required
                    step="any"
                    value={searchParams.lat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    required
                    step="any"
                    value={searchParams.lng}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={!userLocation}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Use Current Location
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius (km)
                </label>
                <input
                  type="number"
                  id="radius"
                  name="radius"
                  min="1"
                  max="1000"
                  value={searchParams.radius}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group (Optional)
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={searchParams.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="organType" className="block text-sm font-medium text-gray-700 mb-2">
                  Organ Type (Optional)
                </label>
                <select
                  id="organType"
                  name="organType"
                  value={searchParams.organType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Organs</option>
                  {organTypes.map(organ => (
                    <option key={organ} value={organ}>{organ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Age (Optional)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  max="120"
                  value={searchParams.age}
                  onChange={handleInputChange}
                  placeholder="Enter patient age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  id="limit"
                  name="limit"
                  value={searchParams.limit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSearching ? 'Searching...' : 'Search Donors'}
              </button>
            </div>
          </form>
        </div>

        {donors.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
            <div className="grid gap-6">
              {donors.map((donor, index) => (
                <div key={donor._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{donor.name}</h3>
                        {donor.compatibilityStatus && donor.compatibilityStatus !== 'unknown' && getCompatibilityBadge(donor.compatibilityStatus)}
                      </div>
                      <p className="text-gray-600">Age: {donor.age} years</p>
                      <p className="text-gray-600">Blood Group: <span className="font-medium text-red-600">{donor.bloodGroup}</span></p>
                      <p className="text-gray-600">Distance: <span className="font-medium text-blue-600">{donor.distance} km</span></p>
                      {donor.compatibilityScore !== undefined && donor.compatibilityScore !== null && donor.compatibilityStatus !== 'unknown' && (
                        <p className="text-gray-600">
                          Compatibility Score: <span className="font-medium text-purple-600">{donor.compatibilityScore}</span>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-600"><strong>Email:</strong> {donor.email}</p>
                      <p className="text-gray-600"><strong>Phone:</strong> {donor.contactNumber}</p>
                      <p className="text-gray-600 text-sm"><strong>Location:</strong> {donor.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-2"><strong>Available Organs:</strong></p>
                      <div className="flex flex-wrap gap-1">
                        {donor.organType.map((organ, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {organ}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm mt-2">
                        Registered: {new Date(donor.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Algorithm Breakdown Section */}
                  {donor.algorithmBreakdown && donor.compatibilityStatus !== 'unknown' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleAlgorithmBreakdown(donor._id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-3"
                      >
                        <span>{expandedDonors.has(donor._id) ? '▼' : '▶'}</span>
                        Algorithm Analysis Details
                      </button>
                      
                      {expandedDonors.has(donor._id) && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Blood Compatibility</p>
                              <p className="text-gray-600">
                                {donor.algorithmBreakdown.bloodCompatible ? 
                                  <span className="text-green-600">✓ Compatible</span> : 
                                  <span className="text-red-600">✗ Not Compatible</span>
                                }
                              </p>
                              <p className="text-gray-500">Score: {donor.algorithmBreakdown.bloodScore}/50</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-700">Organ Match</p>
                              <p className="text-gray-600">
                                {donor.algorithmBreakdown.organMatch ? 
                                  <span className="text-green-600">✓ Available</span> : 
                                  <span className="text-red-600">✗ Not Available</span>
                                }
                              </p>
                              <p className="text-gray-500">Score: {donor.algorithmBreakdown.organScore}/30</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-700">Age Compatibility</p>
                              <p className="text-gray-600">Age difference: {donor.algorithmBreakdown.ageDifference} years</p>
                              <p className="text-gray-500">Score: {donor.algorithmBreakdown.ageScore}/20</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-700">Additional Factors</p>
                              <p className="text-gray-500">Urgency: {donor.algorithmBreakdown.urgencyScore}/25</p>
                              {donor.algorithmBreakdown.perfectMatchBonus > 0 && (
                                <p className="text-green-600">Perfect Match Bonus: +{donor.algorithmBreakdown.perfectMatchBonus}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                              Total Compatibility Score: 
                              <span className="ml-2 text-lg font-bold text-purple-600">
                                {donor.compatibilityScore}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Based on blood compatibility, organ availability, age matching, and urgency factors
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                    <a
                      href={`tel:${donor.contactNumber}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                    >
                      Call Now
                    </a>
                    <a
                      href={`mailto:${donor.email}`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorSearchPage;
