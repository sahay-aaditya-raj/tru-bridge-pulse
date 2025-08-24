import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrganDonor from '@/models/OrganDonor';
import jwt from 'jsonwebtoken';
import { 
  isBloodCompatible, 
  getCompatibilityLevel, 
  calculateDistance 
} from '@/lib/organMatchingUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

// Calculate compatibility score between donor and search criteria
function getCompatibilityScore(donor, searchParams) {
  const { bloodGroup: recipientBG, organType: requiredOrgan, age: recipientAge, urgency = 3 } = searchParams;
  
  // Check blood compatibility first
  if (!isBloodCompatible(donor.bloodGroup, recipientBG)) return 0;
  
  // Check if donor has the required organ
  if (!donor.organType.includes(requiredOrgan)) return 0;

  let score = 0;
  
  // Base score for blood compatibility
  score += 50;
  
  // Organ type exact match bonus
  if (donor.organType.includes(requiredOrgan)) score += 30;
  
  // Age compatibility (closer ages get higher scores)
  if (recipientAge) {
    const ageDifference = Math.abs(donor.age - recipientAge);
    score += Math.max(0, 20 - ageDifference);
  }
  
  // Urgency factor (higher urgency increases score)
  score += urgency * 5;
  
  // Perfect blood type match bonus (exact same blood group)
  if (donor.bloodGroup === recipientBG) score += 10;
  
  return score;
}

// Get compatibility status with color coding for UI
function getCompatibilityStatus(score) {
  if (score === 0) {
    return {
      status: 'Not Compatible',
      level: 'Incompatible',
      color: 'red'
    };
  } else if (score >= 90) {
    return {
      status: 'Fully Compatible',
      level: 'Excellent Match',
      color: 'green'
    };
  } else if (score >= 70) {
    return {
      status: 'Highly Compatible',
      level: 'Very Good Match',
      color: 'green'
    };
  } else if (score >= 50) {
    return {
      status: 'Compatible',
      level: 'Good Match',
      color: 'yellow'
    };
  } else {
    return {
      status: 'Low Compatibility',
      level: 'Fair Match',
      color: 'yellow'
    };
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseInt(searchParams.get('radius')) || 50; // Default 50km radius
    const bloodGroup = searchParams.get('bloodGroup');
    const organType = searchParams.get('organType');
    const age = parseInt(searchParams.get('age'));
    const urgency = parseInt(searchParams.get('urgency')) || 3; // Default urgency level
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Determine if this is a general search or compatibility search
    const isCompatibilitySearch = bloodGroup && organType;
    const isGeneralSearch = !isCompatibilitySearch;

    // Build base query for location
    const query = {
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat] // [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    };

    // For general search, add optional filters if provided
    if (isGeneralSearch) {
      if (bloodGroup) {
        query.bloodGroup = bloodGroup;
      }
      if (organType) {
        query.organType = { $in: [organType] };
      }
    }

    // Get donors within radius
    const allDonors = await OrganDonor.find(query)
      .select('name email contactNumber location bloodGroup organType age registrationDate coordinates')
      .lean();

    let processedDonors;

    if (isCompatibilitySearch) {
      // Compatibility-based search with algorithm
      const searchCriteria = {
        bloodGroup,
        organType,
        age,
        urgency
      };

      processedDonors = allDonors
        .map(donor => {
          const compatibilityScore = getCompatibilityScore(donor, searchCriteria);
          const distance = calculateDistance(
            lat, lng,
            donor.coordinates.coordinates[1], // latitude
            donor.coordinates.coordinates[0]  // longitude
          );
          
          const compatibilityStatus = getCompatibilityStatus(compatibilityScore);
          
          return {
            ...donor,
            distance: Math.round(distance * 100) / 100,
            compatibilityScore,
            compatibilityStatus: compatibilityStatus.status,
            compatibilityLevel: compatibilityStatus.level,
            compatibilityColor: compatibilityStatus.color,
            isCompatible: compatibilityScore > 0,
            searchMode: 'compatibility'
          };
        })
        .sort((a, b) => {
          // Sort by compatibility score first (descending), then by distance (ascending)
          if (b.compatibilityScore !== a.compatibilityScore) {
            return b.compatibilityScore - a.compatibilityScore;
          }
          return a.distance - b.distance;
        })
        .slice(0, limit);

    } else {
      // General search - show all donors with basic compatibility info if criteria provided
      processedDonors = allDonors
        .map(donor => {
          const distance = calculateDistance(
            lat, lng,
            donor.coordinates.coordinates[1], // latitude
            donor.coordinates.coordinates[0]  // longitude
          );

          let compatibilityInfo = null;
          
          // If bloodGroup and organType are provided in general search, show basic compatibility
          if (bloodGroup && organType) {
            const compatibilityScore = getCompatibilityScore(donor, { bloodGroup, organType, age, urgency });
            const compatibilityStatus = getCompatibilityStatus(compatibilityScore);
            
            compatibilityInfo = {
              compatibilityScore,
              compatibilityStatus: compatibilityStatus.status,
              compatibilityLevel: compatibilityStatus.level,
              compatibilityColor: compatibilityStatus.color,
              isCompatible: compatibilityScore > 0
            };
          }
          
          return {
            ...donor,
            distance: Math.round(distance * 100) / 100,
            searchMode: 'general',
            ...(compatibilityInfo || {
              compatibilityStatus: 'Not Assessed',
              compatibilityLevel: 'General Search',
              compatibilityColor: 'gray',
              isCompatible: null,
              compatibilityScore: null
            })
          };
        })
        .sort((a, b) => a.distance - b.distance) // Sort by distance for general search
        .slice(0, limit);
    }

    return NextResponse.json(
      { 
        success: true, 
        data: processedDonors,
        count: processedDonors.length,
        totalScanned: allDonors.length,
        searchMode: isCompatibilitySearch ? 'compatibility' : 'general',
        searchParams: {
          location: { lat, lng },
          radius,
          bloodGroup: bloodGroup || null,
          organType: organType || null,
          age: age || null,
          urgency: urgency || null
        },
        ...(isCompatibilitySearch && {
          compatibilityInfo: {
            message: 'Results sorted by compatibility score and distance',
            scoringCriteria: {
              bloodCompatibility: '50 points',
              organMatch: '30 points',
              ageCompatibility: 'up to 20 points',
              urgencyBonus: `${urgency * 5} points`,
              perfectBloodMatch: '10 points bonus'
            }
          }
        }),
        ...(isGeneralSearch && {
          generalSearchInfo: {
            message: bloodGroup && organType 
              ? 'General search with compatibility indicators shown'
              : 'General location-based search - provide blood group and organ type for compatibility analysis',
            sortedBy: 'distance'
          }
        })
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Search donors error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


