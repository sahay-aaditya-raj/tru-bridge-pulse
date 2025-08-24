// Example usage of the enhanced organ donor search API

// Example 1: Single patient search with compatibility scoring
async function searchCompatibleDonors(patientData) {
  const { lat, lng, bloodGroup, organType, age, urgency } = patientData;
  
  const searchParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    bloodGroup,
    organType,
    age: age.toString(),
    urgency: urgency.toString(),
    radius: '100', // 100km radius
    limit: '10'
  });

  try {
    const response = await fetch(`/api/organ-donor/search?${searchParams}`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Found ${result.count} compatible donors out of ${result.totalScanned} scanned`);
      
      result.data.forEach((donor, index) => {
        console.log(`${index + 1}. ${donor.name}`);
        console.log(`   Blood Group: ${donor.bloodGroup}`);
        console.log(`   Compatibility Score: ${donor.compatibilityScore}/115`);
        console.log(`   Compatibility Level: ${donor.compatibilityLevel}`);
        console.log(`   Distance: ${donor.distance} km`);
        console.log(`   Organs: ${donor.organType.join(', ')}`);
        console.log('---');
      });
    } else {
      console.error('Search failed:', result.message);
    }
  } catch (error) {
    console.error('Error searching donors:', error);
  }
}

// Example usage for a heart patient
const heartPatient = {
  lat: 28.6139,
  lng: 77.2090,
  bloodGroup: 'A+',
  organType: 'Heart',
  age: 45,
  urgency: 5 // Very urgent
};

// Example 2: Batch matching for multiple patients
async function batchMatchPatients(patients) {
  const requestBody = {
    recipients: patients,
    searchRadius: 150 // 150km radius
  };

  try {
    const response = await fetch('/api/organ-donor/batch-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Batch Matching Results:');
      console.log(`Success Rate: ${result.data.summary.matchRate}`);
      console.log(`Successful Matches: ${result.data.summary.successfulMatches}`);
      console.log(`Failed Matches: ${result.data.summary.failedMatches}`);
      
      result.data.matches.forEach((match, index) => {
        console.log(`\nPatient ${index + 1} (${match.recipient.id}):`);
        if (match.match) {
          console.log(`  ✅ Matched with: ${match.match.donor.name}`);
          console.log(`  📊 Compatibility: ${match.match.compatibilityScore} (${match.match.matchQuality})`);
          console.log(`  📍 Distance: ${match.match.distance} km`);
        } else {
          console.log(`  ❌ No match found: ${match.reason}`);
        }
      });
    } else {
      console.error('Batch matching failed:', result.message);
    }
  } catch (error) {
    console.error('Error in batch matching:', error);
  }
}

// Example usage for multiple patients
const multiplePatients = [
  {
    id: 'patient_001',
    bloodGroup: 'O+',
    organType: 'Kidney',
    age: 35,
    lat: 28.6139,
    lng: 77.2090,
    urgency: 4
  },
  {
    id: 'patient_002',
    bloodGroup: 'A-',
    organType: 'Liver',
    age: 42,
    lat: 28.7041,
    lng: 77.1025,
    urgency: 5
  },
  {
    id: 'patient_003',
    bloodGroup: 'B+',
    organType: 'Heart',
    age: 28,
    lat: 28.5355,
    lng: 77.3910,
    urgency: 3
  }
];

// Usage examples:
// searchCompatibleDonors(heartPatient);
// batchMatchPatients(multiplePatients);

export { searchCompatibleDonors, batchMatchPatients };
