# Organ Donor Registration System

This feature allows authenticated users to register as organ donors and helps medical professionals find nearby donors in emergency situations.

## Features

### 1. Organ Donor Registration (`/organ-donor`)
- **Authentication Required**: Only logged-in users can register
- **One Registration Per User**: Prevents duplicate registrations
- **Comprehensive Form**: Collects all necessary donor information
- **Location Autocomplete**: Real-time location suggestions using OpenStreetMap
- **Coordinate Storage**: Automatically stores GPS coordinates for location-based searches
- **Form Validation**: Client-side and server-side validation for all fields

### 2. Form Fields
- **Name**: Full legal name (2-100 characters)
- **Email**: Valid email address
- **Contact Number**: 10-digit Indian mobile number
- **Location**: Address with autocomplete suggestions
- **Blood Group**: A+, A-, B+, B-, AB+, AB-, O+, O-
- **Age**: 18-80 years (age restrictions for organ donation)
- **Organ Types**: Multiple selection from 12 available organ types
- **Aadhar Number**: 12-digit unique identifier

### 3. API Endpoints

#### Registration & Profile
- `POST /api/organ-donor` - Register as organ donor
- `GET /api/organ-donor` - Get user's registration details

#### Location Services
- `GET /api/location-suggestions?q={query}` - Get location suggestions

#### Search (for medical professionals)
- `GET /api/organ-donor/search` - Find nearby donors
  - Parameters: `lat`, `lng`, `radius`, `bloodGroup`, `organType`, `limit`

### 4. Database Schema

#### OrganDonor Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String (required),
  email: String (required),
  contactNumber: String (required, 10 digits),
  location: String (required),
  coordinates: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  bloodGroup: String (enum),
  age: Number (18-80),
  organType: [String] (enum),
  aadharNumber: String (unique, 12 digits),
  isActive: Boolean (default: true),
  registrationDate: Date (default: now),
  timestamps: true
}
```

### 5. Indexes
- 2dsphere index on `coordinates` for geospatial queries
- Indexes on `userId`, `bloodGroup`, `organType`, `location` for faster searches

### 6. Validation Rules

#### Age Restrictions
- General: 18-80 years
- Specific organs have different upper limits:
  - Heart, Pancreas, Small Intestine: 60 years
  - Lungs: 65 years
  - Liver: 70 years
  - Kidneys: 75 years
  - Corneas, Skin, Bone, Heart Valves, Blood Vessels, Connective Tissue: 80 years

#### Format Validation
- Aadhar: Exactly 12 digits
- Phone: Exactly 10 digits
- Email: Standard email format
- Blood Group: Must be one of the 8 valid types

### 7. Security Features
- JWT Authentication required for all operations
- Input sanitization and validation
- Unique Aadhar number constraint
- Location coordinate verification

### 8. Location Features
- **Autocomplete**: Real-time location suggestions while typing
- **Geocoding**: Automatic conversion of address to GPS coordinates
- **Geographic Search**: Find donors within specified radius
- **Distance Calculation**: Haversine formula for accurate distance measurement

### 9. User Experience
- **Existing Registration Check**: Shows registration status if already registered
- **Form Feedback**: Real-time validation messages
- **Loading States**: Visual feedback during API calls
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper form labels and error messages

### 10. Integration Points
- **Dashboard**: Quick access button with prominent styling
- **User Authentication**: Integrates with existing auth system
- **MongoDB**: Uses existing database connection
- **Notification System**: Uses existing message display components

### 11. Privacy Considerations
- Only authenticated users can search for donors
- Contact information visible only to medical professionals
- Coordinates stored separately from personal data
- Option to deactivate registration (isActive flag)

### 12. Future Enhancements
- Email notifications for new registrations
- SMS alerts for nearby emergencies
- Medical institution verification
- Donation history tracking
- Family member notifications
- Regional coordinator system

## Usage Instructions

### For Users:
1. Login to your account
2. Go to Dashboard
3. Click "❤️ Register as Organ Donor" button
4. Fill out the registration form
5. Use location autocomplete for accurate address
6. Select organs you wish to donate
7. Submit the form

### For Medical Professionals:
1. Use the search API with location coordinates
2. Filter by blood group and organ type
3. Get list of nearby donors with contact information
4. Contact donors directly in emergency situations

## Technical Requirements
- Node.js 18+
- MongoDB with geospatial indexing support
- Internet connection for location services
- JWT authentication system

## Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

This organ donor registration system provides a comprehensive solution for managing organ donor information while ensuring privacy, security, and ease of use for both donors and medical professionals.
