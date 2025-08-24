import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrganDonor from '@/models/OrganDonor';
import jwt from 'jsonwebtoken';
import { 
  DonorNode, 
  RecipientNode, 
  findOptimalMatches,
  calculateDistance 
} from '@/lib/organMatchingUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

export async function POST(request) {
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

    const body = await request.json();
    const { recipients, searchRadius = 100 } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipients array is required' },
        { status: 400 }
      );
    }

    // Validate recipient data
    for (const recipient of recipients) {
      if (!recipient.bloodGroup || !recipient.organType || !recipient.lat || !recipient.lng) {
        return NextResponse.json(
          { success: false, message: 'Each recipient must have bloodGroup, organType, lat, and lng' },
          { status: 400 }
        );
      }
    }

    // Get all active donors
    const allDonors = await OrganDonor.find({ isActive: true })
      .select('name email contactNumber location bloodGroup organType age registrationDate coordinates')
      .lean();

    // Create donor nodes
    const donorNodes = allDonors.map(donor => new DonorNode(
      donor._id.toString(),
      donor.bloodGroup,
      donor.location,
      donor.age,
      donor.organType,
      donor.coordinates
    ));

    // Create recipient nodes with urgency calculation
    const recipientNodes = recipients.map((recipient, index) => {
      // Calculate urgency based on position (earlier in list = higher urgency)
      const urgency = Math.max(1, 5 - Math.floor(index / recipients.length * 4));
      
      return new RecipientNode(
        recipient.id || `recipient_${index}`,
        recipient.bloodGroup,
        recipient.city || 'Unknown',
        recipient.age || 35,
        recipient.urgency || urgency,
        recipient.organType,
        { coordinates: [recipient.lng, recipient.lat] }
      );
    });

    // Filter donors by location for each recipient
    const locationFilteredResults = recipientNodes.map(recipient => {
      const nearbyDonors = donorNodes.filter(donor => {
        const distance = calculateDistance(
          recipient.coordinates.coordinates[1], // recipient lat
          recipient.coordinates.coordinates[0], // recipient lng
          donor.coordinates.coordinates[1],     // donor lat
          donor.coordinates.coordinates[0]      // donor lng
        );
        return distance <= searchRadius;
      });

      return {
        recipient,
        nearbyDonors,
        donorCount: nearbyDonors.length
      };
    });

    // Find optimal matches for all recipients
    const allNearbyDonors = [...new Set(locationFilteredResults.flatMap(r => r.nearbyDonors))];
    const { matches } = findOptimalMatches(allNearbyDonors, recipientNodes);

    // Format results
    const matchResults = recipientNodes.map(recipient => {
      const match = matches.find(m => m.recipient.id === recipient.id);
      const recipientData = recipients.find(r => (r.id || `recipient_${recipients.indexOf(r)}`) === recipient.id);
      
      if (match) {
        const donorData = allDonors.find(d => d._id.toString() === match.donor.id);
        const distance = calculateDistance(
          recipientData.lat,
          recipientData.lng,
          donorData.coordinates.coordinates[1],
          donorData.coordinates.coordinates[0]
        );

        return {
          recipient: {
            id: recipient.id,
            bloodGroup: recipient.bloodGroup,
            organType: recipient.organType,
            age: recipient.age,
            urgency: recipient.urgency,
            location: recipientData
          },
          match: {
            donor: donorData,
            compatibilityScore: match.compatibilityScore,
            distance: Math.round(distance * 100) / 100,
            matchQuality: getMatchQuality(match.compatibilityScore)
          }
        };
      } else {
        const locationResult = locationFilteredResults.find(r => r.recipient.id === recipient.id);
        return {
          recipient: {
            id: recipient.id,
            bloodGroup: recipient.bloodGroup,
            organType: recipient.organType,
            age: recipient.age,
            urgency: recipient.urgency,
            location: recipientData
          },
          match: null,
          reason: locationResult.donorCount === 0 ? 'No donors found in radius' : 'No compatible donors available'
        };
      }
    });

    const successfulMatches = matchResults.filter(r => r.match !== null);
    const failedMatches = matchResults.filter(r => r.match === null);

    return NextResponse.json({
      success: true,
      data: {
        matches: matchResults,
        summary: {
          totalRecipients: recipients.length,
          successfulMatches: successfulMatches.length,
          failedMatches: failedMatches.length,
          matchRate: `${Math.round((successfulMatches.length / recipients.length) * 100)}%`
        },
        searchParameters: {
          radius: searchRadius,
          totalDonorsConsidered: allNearbyDonors.length,
          algorithm: 'Hungarian Algorithm for Optimal Matching'
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Batch matching error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMatchQuality(score) {
  if (score >= 100) return 'Perfect';
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Fair';
  return 'Poor';
}
