import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const { username, password, name, age, gender } = await request.json();

    // Validate required fields
    if (!username || !password || !name || !age || !gender) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate age
    if (age < 13 || age > 120) {
      return NextResponse.json(
        { error: 'Age must be between 13 and 120' },
        { status: 400 }
      );
    }

    // Validate gender
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return NextResponse.json(
        { error: 'Gender must be male, female, or other' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      password,
      name,
      age: parseInt(age),
      gender: gender.toLowerCase()
    });

    await user.save();

    // Return success response (password is automatically excluded by toJSON method)
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: user.toJSON()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}