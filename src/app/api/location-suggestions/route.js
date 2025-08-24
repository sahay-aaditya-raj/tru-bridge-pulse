import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Query must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Using OpenStreetMap Nominatim API for location suggestions
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'OrganDonorApp/1.0'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch location suggestions');
    }

    const suggestions = data.map(item => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      place_id: item.place_id,
      type: item.type,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
        postcode: item.address?.postcode
      }
    }));

    return NextResponse.json(
      { 
        success: true, 
        suggestions 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Location suggestions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch location suggestions' },
      { status: 500 }
    );
  }
}
