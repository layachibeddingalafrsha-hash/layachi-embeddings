import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { ObjectId } from 'mongodb';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SOCIAL_ID = '690e04c230a9c64225404db4';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const socials = await db.collection('socials').findOne({ 
      _id: new ObjectId(SOCIAL_ID)
    });

    if (!socials) {
      return NextResponse.json(
        { success: false, error: 'Social links not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        instagram: socials.instagram || '',
        facebook: socials.facebook || '',
        tiktok: socials.tiktok || '',
        whatsapp: socials.whatsapp || '',
        email: socials.email || '',
      }
    });
    
  } catch (error) {
    console.error('Error fetching socials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social links' },
      { status: 500 }
    );
  }
}
