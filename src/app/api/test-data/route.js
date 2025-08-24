import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

// This is a test endpoint - remove in production
export async function POST(request) {
  try {
    await connectDB();

    // Sample data matching the exact structure from your MongoDB entry
    const sampleSummaries = [
      {
        "patientInfo": {
          "name": "Piyush",
          "age": "21",
          "gender": "male"
        },
        "symptoms": ["Heart attack", "Severe chest pain", "Shortness of breath", "Pain in arms, back, neck, jaw, or stomach"],
        "duration": "Unknown",
        "severity": "Severe",
        "possibleCauses": ["Heart attack"],
        "emotionalState": "Distressed",
        "doctorNotes": "Patient is experiencing severe symptoms of a possible heart attack, needs immediate medical attention",
        "username": "pkheria7"
      },
      {
        "patientInfo": {
          "name": "Test User",
          "age": "25",
          "gender": "male"
        },
        "symptoms": [
          "Mild headache",
          "Fatigue"
        ],
        "duration": "2 days",
        "severity": "Mild",
        "possibleCauses": ["Stress", "Dehydration"],
        "emotionalState": "Slightly concerned",
        "doctorNotes": "Mild symptoms, likely due to stress. Recommend rest and hydration.",
        "username": "testuser"
      },
      {
        "patientInfo": {
          "name": "Test User",
          "age": "25",
          "gender": "male"
        },
        "symptoms": [
          "Persistent cough",
          "Fever",
          "Body aches"
        ],
        "duration": "5 days",
        "severity": "Moderate",
        "possibleCauses": ["Viral infection", "Common cold"],
        "emotionalState": "Worried",
        "doctorNotes": "Moderate symptoms consistent with viral infection. Monitor temperature and rest.",
        "username": "testuser"
      }
    ];

    // Insert all sample summaries
    const insertedSummaries = await Summary.insertMany(sampleSummaries);

    return NextResponse.json(
      { 
        message: 'Test data inserted successfully',
        count: insertedSummaries.length,
        summaries: insertedSummaries
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Test data insertion error:', error);
    return NextResponse.json(
      { error: 'Failed to insert test data' },
      { status: 500 }
    );
  }
}
