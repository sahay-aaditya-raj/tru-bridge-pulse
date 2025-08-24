import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrganDonor from '@/models/OrganDonor';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

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
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Build query
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

    // Add blood group filter if provided
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // Add organ type filter if provided
    if (organType) {
      query.organType = { $in: [organType] };
    }

    const donors = await OrganDonor.find(query)
      .select('name email contactNumber location bloodGroup organType age registrationDate coordinates')
      .limit(limit)
      .lean();

    // Calculate distance for each donor
    const donorsWithDistance = donors.map(donor => {
      const distance = calculateDistance(
        lat, lng,
        donor.coordinates.coordinates[1], // latitude
        donor.coordinates.coordinates[0]  // longitude
      );
      
      return {
        ...donor,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        data: donorsWithDistance,
        count: donorsWithDistance.length,
        searchParams: {
          location: { lat, lng },
          radius,
          bloodGroup,
          organType
        }
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

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
