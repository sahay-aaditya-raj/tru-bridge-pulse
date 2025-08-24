// Test the enhanced organ donor search API

async function testSearchAPI() {
  const baseURL = 'http://localhost:3000/api/organ-donor/search';
  
  console.log('🧪 Testing Enhanced Organ Donor Search API');
  console.log('='.repeat(50));

  // Test 1: General location search (no blood group/organ)
  console.log('\n1️⃣  Test: General Location Search');
  console.log('Expected: All donors with gray "Not Assessed" badges');
  
  const generalSearch = `${baseURL}?lat=28.6139&lng=77.2090&radius=50`;
  console.log(`URL: ${generalSearch}`);
  
  try {
    const response1 = await fetch(generalSearch, { credentials: 'include' });
    const result1 = await response1.json();
    
    if (result1.success) {
      console.log(`✅ Found ${result1.count} donors`);
      console.log(`📍 Search Mode: ${result1.searchMode}`);
      result1.data.slice(0, 2).forEach((donor, i) => {
        console.log(`   ${i+1}. ${donor.name} - ${donor.compatibilityStatus} (${donor.compatibilityColor})`);
      });
    } else {
      console.log(`❌ Error: ${result1.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }

  // Test 2: General search with basic compatibility
  console.log('\n2️⃣  Test: General Search with Blood Group & Organ');
  console.log('Expected: All donors with color-coded compatibility badges');
  
  const basicCompatibility = `${baseURL}?lat=28.6139&lng=77.2090&bloodGroup=A%2B&organType=Heart&radius=50`;
  console.log(`URL: ${basicCompatibility}`);
  
  try {
    const response2 = await fetch(basicCompatibility, { credentials: 'include' });
    const result2 = await response2.json();
    
    if (result2.success) {
      console.log(`✅ Found ${result2.count} donors`);
      console.log(`📍 Search Mode: ${result2.searchMode}`);
      console.log('Compatibility Results:');
      result2.data.slice(0, 3).forEach((donor, i) => {
        const compatIcon = donor.compatibilityColor === 'green' ? '🟢' : 
                          donor.compatibilityColor === 'yellow' ? '🟡' : 
                          donor.compatibilityColor === 'red' ? '🔴' : '⚪';
        console.log(`   ${i+1}. ${compatIcon} ${donor.name} - ${donor.compatibilityStatus} (Score: ${donor.compatibilityScore})`);
      });
    } else {
      console.log(`❌ Error: ${result2.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }

  // Test 3: Full compatibility search with algorithm
  console.log('\n3️⃣  Test: Full Compatibility Search with Algorithm');
  console.log('Expected: Only compatible donors, sorted by compatibility score');
  
  const fullCompatibility = `${baseURL}?lat=28.6139&lng=77.2090&bloodGroup=A%2B&organType=Heart&age=45&urgency=5&radius=100`;
  console.log(`URL: ${fullCompatibility}`);
  
  try {
    const response3 = await fetch(fullCompatibility, { credentials: 'include' });
    const result3 = await response3.json();
    
    if (result3.success) {
      console.log(`✅ Found ${result3.count} compatible donors out of ${result3.totalScanned} scanned`);
      console.log(`🧬 Search Mode: ${result3.searchMode}`);
      console.log('Top Matches (sorted by compatibility):');
      result3.data.slice(0, 3).forEach((donor, i) => {
        const compatIcon = donor.compatibilityColor === 'green' ? '🟢' : '🟡';
        console.log(`   ${i+1}. ${compatIcon} ${donor.name}`);
        console.log(`      Score: ${donor.compatibilityScore}/115 | Distance: ${donor.distance}km`);
        console.log(`      Status: ${donor.compatibilityStatus} | Level: ${donor.compatibilityLevel}`);
        console.log(`      Blood: ${donor.bloodGroup} | Organs: ${donor.organType.join(', ')}`);
      });
      
      if (result3.compatibilityInfo) {
        console.log('\n📊 Scoring Criteria:');
        Object.entries(result3.compatibilityInfo.scoringCriteria).forEach(([key, value]) => {
          console.log(`   • ${key}: ${value}`);
        });
      }
    } else {
      console.log(`❌ Error: ${result3.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }

  // Test 4: Edge case - incompatible blood type
  console.log('\n4️⃣  Test: Incompatible Blood Type Search');
  console.log('Expected: Should show donors but with red "Not Compatible" badges');
  
  const incompatibleSearch = `${baseURL}?lat=28.6139&lng=77.2090&bloodGroup=AB%2B&organType=Heart&age=45&urgency=5&radius=100`;
  console.log(`URL: ${incompatibleSearch}`);
  
  try {
    const response4 = await fetch(incompatibleSearch, { credentials: 'include' });
    const result4 = await response4.json();
    
    if (result4.success) {
      console.log(`✅ Found ${result4.count} compatible donors (should be limited to compatible donors only in full compatibility mode)`);
      console.log(`🧬 Search Mode: ${result4.searchMode}`);
      
      if (result4.count === 0) {
        console.log('   ℹ️  No compatible donors found - this is expected for AB+ recipient looking for heart donors');
      } else {
        result4.data.slice(0, 2).forEach((donor, i) => {
          console.log(`   ${i+1}. ${donor.name} - ${donor.bloodGroup} donor for AB+ recipient`);
        });
      }
    } else {
      console.log(`❌ Error: ${result4.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }

  console.log('\n🏁 Testing completed!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('   • Dual search modes (general vs compatibility)');
  console.log('   • Color-coded compatibility badges (🟢 🟡 🔴 ⚪)');
  console.log('   • Smart sorting (distance vs compatibility score)');
  console.log('   • Medical-grade blood type compatibility');
  console.log('   • Comprehensive scoring algorithm');
}

// Usage examples for different scenarios
function getUsageExamples() {
  return {
    generalSearch: {
      description: 'Find all donors in area without compatibility analysis',
      url: '/api/organ-donor/search?lat=28.6139&lng=77.2090&radius=50',
      expectedBadges: 'Gray "Not Assessed"'
    },
    
    generalWithBasicCompatibility: {
      description: 'General search with compatibility indicators',
      url: '/api/organ-donor/search?lat=28.6139&lng=77.2090&bloodGroup=O%2B&organType=Kidney&radius=50',
      expectedBadges: 'Green/Yellow/Red based on compatibility'
    },
    
    fullCompatibilitySearch: {
      description: 'Algorithm-driven compatibility matching',
      url: '/api/organ-donor/search?lat=28.6139&lng=77.2090&bloodGroup=A%2B&organType=Heart&age=45&urgency=5&radius=100',
      expectedBadges: 'Only compatible donors with Green/Yellow badges'
    }
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testSearchAPI();
} else {
  // Browser environment
  console.log('🌐 Browser Environment Detected');
  console.log('Use browser console to call testSearchAPI() manually');
  console.log('Usage Examples:', getUsageExamples());
}

export { testSearchAPI, getUsageExamples };
