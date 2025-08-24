import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Summary from '@/models/Summary';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user to get their username
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.username); // Debug log

    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const severity = url.searchParams.get('severity');

    // Build query
    const query = { username: user.username };
    console.log('Query:', query); // Debug log

    // Add severity filter if provided
    if (severity) {
      query.severity = severity;
    }



    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch summaries with pagination
    const summaries = await Summary.find(query)
      .sort({ createdAt: -1, _id: -1 }) // Sort by newest first, fallback to _id for documents without createdAt
      .skip(skip)
      .limit(limit);

    console.log('Found summaries:', summaries.length); // Debug log
    console.log('Sample summary:', summaries[0]); // Debug log

    // Get total count for pagination
    const totalCount = await Summary.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        summaries,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          severity,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
