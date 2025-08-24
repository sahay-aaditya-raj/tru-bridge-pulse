import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

// This endpoint helps fix missing timestamps in existing documents
export async function POST(request) {
  try {
    await connectDB();

    // Find documents without createdAt field
    const documentsWithoutTimestamps = await Summary.find({
      createdAt: { $exists: false }
    });

    console.log(`Found ${documentsWithoutTimestamps.length} documents without createdAt field`);

    if (documentsWithoutTimestamps.length === 0) {
      return NextResponse.json(
        { message: 'All documents already have createdAt timestamps' },
        { status: 200 }
      );
    }

    // Update documents to add timestamps
    const updatePromises = documentsWithoutTimestamps.map(doc => {
      // Extract timestamp from ObjectId
      const createdAt = new Date(parseInt(doc._id.toString().substring(0, 8), 16) * 1000);
      const updatedAt = new Date();
      
      console.log(`Updating document ${doc._id} with createdAt: ${createdAt}`);
      
      return Summary.findByIdAndUpdate(
        doc._id,
        {
          $set: {
            createdAt: createdAt,
            updatedAt: updatedAt
          }
        },
        { new: true }
      );
    });

    const updatedDocuments = await Promise.all(updatePromises);

    return NextResponse.json(
      {
        message: 'Timestamps added successfully',
        updatedCount: updatedDocuments.length,
        documents: updatedDocuments
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fix timestamps error:', error);
    return NextResponse.json(
      { error: 'Failed to fix timestamps', details: error.message },
      { status: 500 }
    );
  }
}
