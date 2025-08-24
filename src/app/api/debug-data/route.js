import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

// Debug endpoint to check data structure
export async function GET(request) {
  try {
    await connectDB();

    // Get one sample document to see its structure
    const sampleDoc = await Summary.findOne({}).lean();
    
    if (!sampleDoc) {
      return NextResponse.json(
        { message: 'No documents found' },
        { status: 404 }
      );
    }

    // Extract timestamp from ObjectId for comparison
    const objectIdTimestamp = sampleDoc._id.getTimestamp ? 
      sampleDoc._id.getTimestamp() : 
      new Date(parseInt(sampleDoc._id.toString().substring(0, 8), 16) * 1000);

    return NextResponse.json(
      {
        message: 'Sample document structure',
        document: sampleDoc,
        objectIdTimestamp: objectIdTimestamp,
        hasCreatedAt: !!sampleDoc.createdAt,
        hasUpdatedAt: !!sampleDoc.updatedAt,
        fieldsPresent: Object.keys(sampleDoc)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
