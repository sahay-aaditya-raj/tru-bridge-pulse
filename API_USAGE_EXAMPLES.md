# Enhanced Organ Donor Search API Examples

## 1. General Location-Based Search (No Compatibility Analysis)

```bash
# Basic location search - shows all donors in area
curl -X GET "http://localhost:3000/api/organ-donor/search?lat=28.6139&lng=77.2090&radius=50" \
  -H "Cookie: token=your_jwt_token"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "donor1",
      "name": "John Doe",
      "bloodGroup": "O+",
      "organType": ["Heart", "Kidney"],
      "age": 35,
      "location": "Delhi",
      "distance": 12.5,
      "searchMode": "general",
      "compatibilityStatus": "Not Assessed",
      "compatibilityLevel": "General Search",
      "compatibilityColor": "gray",
      "isCompatible": null,
      "compatibilityScore": null
    }
  ],
  "searchMode": "general",
  "generalSearchInfo": {
    "message": "General location-based search - provide blood group and organ type for compatibility analysis",
    "sortedBy": "distance"
  }
}
```

## 2. General Search with Basic Compatibility Indicators

```bash
# General search but with blood group and organ type for basic compatibility
curl -X GET "http://localhost:3000/api/organ-donor/search?lat=28.6139&lng=77.2090&bloodGroup=A%2B&organType=Heart&radius=50" \
  -H "Cookie: token=your_jwt_token"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "donor1",
      "name": "John Doe",
      "bloodGroup": "O+",
      "organType": ["Heart", "Kidney"],
      "age": 35,
      "location": "Delhi",
      "distance": 12.5,
      "searchMode": "general",
      "compatibilityStatus": "Compatible",
      "compatibilityLevel": "Good Match",
      "compatibilityColor": "yellow",
      "isCompatible": true,
      "compatibilityScore": 85
    },
    {
      "_id": "donor2",
      "name": "Jane Smith",
      "bloodGroup": "B+",
      "organType": ["Liver"],
      "age": 42,
      "location": "Delhi",
      "distance": 8.3,
      "searchMode": "general",
      "compatibilityStatus": "Not Compatible",
      "compatibilityLevel": "Incompatible",
      "compatibilityColor": "red",
      "isCompatible": false,
      "compatibilityScore": 0
    }
  ],
  "searchMode": "general",
  "generalSearchInfo": {
    "message": "General search with compatibility indicators shown",
    "sortedBy": "distance"
  }
}
```

## 3. Full Compatibility Search with Algorithm

```bash
# Compatibility-based search with full algorithm
curl -X GET "http://localhost:3000/api/organ-donor/search?lat=28.6139&lng=77.2090&bloodGroup=A%2B&organType=Heart&age=45&urgency=5&radius=100" \
  -H "Cookie: token=your_jwt_token"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "donor1",
      "name": "Perfect Match Donor",
      "bloodGroup": "A+",
      "organType": ["Heart", "Kidney"],
      "age": 44,
      "location": "Delhi",
      "distance": 15.2,
      "searchMode": "compatibility",
      "compatibilityScore": 105,
      "compatibilityStatus": "Fully Compatible",
      "compatibilityLevel": "Excellent Match",
      "compatibilityColor": "green",
      "isCompatible": true
    },
    {
      "_id": "donor2",
      "name": "Good Match Donor",
      "bloodGroup": "O+",
      "organType": ["Heart"],
      "age": 38,
      "location": "Gurgaon",
      "distance": 25.8,
      "searchMode": "compatibility",
      "compatibilityScore": 78,
      "compatibilityStatus": "Highly Compatible",
      "compatibilityLevel": "Very Good Match",
      "compatibilityColor": "green",
      "isCompatible": true
    },
    {
      "_id": "donor3",
      "name": "Fair Match Donor",
      "bloodGroup": "O-",
      "organType": ["Heart", "Liver"],
      "age": 55,
      "location": "Noida",
      "distance": 18.4,
      "searchMode": "compatibility",
      "compatibilityScore": 52,
      "compatibilityStatus": "Compatible",
      "compatibilityLevel": "Good Match",
      "compatibilityColor": "yellow",
      "isCompatible": true
    }
  ],
  "searchMode": "compatibility",
  "compatibilityInfo": {
    "message": "Results sorted by compatibility score and distance",
    "scoringCriteria": {
      "bloodCompatibility": "50 points",
      "organMatch": "30 points",
      "ageCompatibility": "up to 20 points",
      "urgencyBonus": "25 points",
      "perfectBloodMatch": "10 points bonus"
    }
  }
}
```

## 4. Color-Coded Compatibility Status

### 🟢 Green (Excellent/High Compatibility)
- **Status:** "Fully Compatible" or "Highly Compatible"
- **Score Range:** 70-115+
- **Meaning:** Excellent medical compatibility, recommended match

### 🟡 Yellow (Moderate Compatibility) 
- **Status:** "Compatible" or "Low Compatibility"
- **Score Range:** 30-69
- **Meaning:** Medically compatible but not optimal, acceptable match

### 🔴 Red (No Compatibility)
- **Status:** "Not Compatible"
- **Score:** 0
- **Meaning:** Blood type or organ incompatibility, not suitable

### ⚪ Gray (Not Assessed)
- **Status:** "Not Assessed"
- **Meaning:** General search without compatibility criteria

## 5. Frontend Integration Example

```javascript
// Example of how to display compatibility badge in React
const CompatibilityBadge = ({ donor }) => {
  const getBadgeClass = (color) => {
    switch(color) {
      case 'green': return 'badge-success';
      case 'yellow': return 'badge-warning'; 
      case 'red': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(donor.compatibilityColor)}`}>
      {donor.compatibilityStatus}
      {donor.compatibilityScore && ` (${donor.compatibilityScore})`}
    </span>
  );
};
```

## 6. Search Flow

1. **General Search:** User searches by location only
   - Shows all donors in radius
   - Gray "Not Assessed" badges
   - Sorted by distance

2. **General + Basic Compatibility:** User adds blood group and organ type
   - Shows all donors with compatibility indicators
   - Color-coded badges based on compatibility
   - Still sorted by distance (general search mode)

3. **Full Compatibility Search:** User provides all criteria
   - Algorithm-driven compatibility scoring
   - Only shows compatible donors (score > 0)
   - Sorted by compatibility score first, then distance
   - Detailed scoring breakdown

This flexible approach allows both casual browsing and medical-grade compatibility matching in the same interface!
