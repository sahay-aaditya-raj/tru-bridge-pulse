'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const OrganDonorPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState(null);
  const locationInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    location: '',
    bloodGroup: '',
    age: '',
    organType: [],
    aadharNumber: ''
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
    // Only check registration after user is loaded and authentication is complete
    if (user && !loading) {
      checkExistingRegistration();
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        age: user.age?.toString() || ''
      }));
    }
  }, [user, loading]);

  const checkExistingRegistration = async () => {
    try {
      // Small delay to ensure cookie is available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch('/api/organ-donor', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExistingRegistration(data.data);
      } else if (response.status === 404) {
        // No existing registration found, which is fine
        setExistingRegistration(null);
      } else if (response.status === 401) {
        // Authentication failed - this is okay if user just hasn't registered yet
        setExistingRegistration(null);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error checking existing registration:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch location suggestions when typing in location field
    if (name === 'location' && value.length >= 3) {
      fetchLocationSuggestions(value);
    } else if (name === 'location' && value.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleOrganTypeChange = (organ) => {
    setFormData(prev => ({
      ...prev,
      organType: prev.organType.includes(organ)
        ? prev.organType.filter(o => o !== organ)
        : [...prev.organType, organ]
    }));
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
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name
    }));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Validation
      if (formData.organType.length === 0) {
        setMessage('Please select at least one organ type');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/organ-donor', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Organ donor registration successful!');
        setMessageType('success');
        setExistingRegistration(data.data);
        // Reset form
        setFormData({
          name: user.name || '',
          email: '',
          contactNumber: '',
          location: '',
          bloodGroup: '',
          age: user.age?.toString() || '',
          organType: [],
          aadharNumber: ''
        });
      } else {
        setMessage(data.message || 'Registration failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An error occurred during registration');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
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

  if (existingRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Already Registered</h2>
            <p className="mt-2 text-gray-600">
              You have already registered as an organ donor on {new Date(existingRegistration.registrationDate).toLocaleDateString()}.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Your Registration Details:</h3>
              <p><strong>Name:</strong> {existingRegistration.name}</p>
              <p><strong>Blood Group:</strong> {existingRegistration.bloodGroup}</p>
              <p><strong>Organs:</strong> {existingRegistration.organType.join(', ')}</p>
              <p><strong>Location:</strong> {existingRegistration.location}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organ Donor Registration</h1>
            <p className="mt-2 text-gray-600">
              Help save lives by registering as an organ donor
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  required
                  pattern="[0-9]{10}"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="18"
                  max="80"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  required
                  pattern="[0-9]{12}"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhar number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                ref={locationInputRef}
                value={formData.location}
                onChange={handleInputChange}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Organs to Donate * (Select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {organTypes.map(organ => (
                  <label key={organ} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.organType.includes(organ)}
                      onChange={() => handleOrganTypeChange(organ)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{organ}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting ? 'Registering...' : 'Register as Organ Donor'}
              </button>
            </div>
          </form>

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
    </div>
  );
};

export default OrganDonorPage;
