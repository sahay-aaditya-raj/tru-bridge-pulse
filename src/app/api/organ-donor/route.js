import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrganDonor from '@/models/OrganDonor';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

// Get coordinates from location name using a geocoding service
async function getCoordinates(location) {
  try {
    // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [longitude, latitude]
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

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

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const {
      name,
      email,
      contactNumber,
      location,
      bloodGroup,
      age,
      organType,
      aadharNumber
    } = await request.json();

    // Validate required fields
    if (!name || !email || !contactNumber || !location || !bloodGroup || !age || !organType || !aadharNumber) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user has already registered
    const existingDonor = await OrganDonor.findOne({ userId: decoded.userId });
    if (existingDonor) {
      return NextResponse.json(
        { success: false, message: 'You have already registered as an organ donor' },
        { status: 400 }
      );
    }

    // Check if Aadhar number is already registered
    const existingAadhar = await OrganDonor.findOne({ aadharNumber });
    if (existingAadhar) {
      return NextResponse.json(
        { success: false, message: 'This Aadhar number is already registered' },
        { status: 400 }
      );
    }

    // Get coordinates for the location
    const coordinates = await getCoordinates(location);
    if (!coordinates) {
      return NextResponse.json(
        { success: false, message: 'Could not find coordinates for the provided location' },
        { status: 400 }
      );
    }

    // Create new organ donor registration
    const organDonor = new OrganDonor({
      userId: decoded.userId,
      name,
      email,
      contactNumber,
      location,
      coordinates: {
        type: 'Point',
        coordinates: coordinates
      },
      bloodGroup,
      age,
      organType: Array.isArray(organType) ? organType : [organType],
      aadharNumber
    });

    await organDonor.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Organ donor registration successful',
        data: organDonor
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Organ donor registration error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, message: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
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

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's organ donor registration
    const organDonor = await OrganDonor.findOne({ userId: decoded.userId });

    if (!organDonor) {
      return NextResponse.json(
        { success: false, message: 'No organ donor registration found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: organDonor
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get organ donor error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
