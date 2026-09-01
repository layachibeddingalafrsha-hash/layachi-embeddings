import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const SOCIAL_ID = '690e04c230a9c64225404db4';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch the single socials document by ID
    const socialsDoc = await db
      .collection("socials")
      .findOne({ _id: new ObjectId(SOCIAL_ID) });

    if (!socialsDoc) {
      return NextResponse.json({ 
        success: false, 
        data: [],
        error: "Social links document not found" 
      }, { status: 404 });
    }

    // Transform the document into an array of social link objects
    const links = [
      socialsDoc.facebook && { platform: "facebook", url: socialsDoc.facebook, icon: "facebook", display_order: 1 },
      socialsDoc.instagram && { platform: "instagram", url: socialsDoc.instagram, icon: "instagram", display_order: 2 },
      socialsDoc.tiktok && { platform: "tiktok", url: socialsDoc.tiktok, icon: "tiktok", display_order: 3 },
      socialsDoc.whatsapp && { platform: "whatsapp", url: socialsDoc.whatsapp, icon: "whatsapp", display_order: 4 },
      socialsDoc.email && { platform: "email", url: socialsDoc.email, icon: "email", display_order: 5 },
    ].filter(Boolean); // Remove any null/undefined entries

    return NextResponse.json({ 
      success: true, 
      data: links 
    });
  } catch (error: any) {
    console.error("Error fetching social links:", error);
    
    // Fallback data if database fails
    const fallbackLinks = [
      { platform: "facebook", url: "https://facebook.com/crocco", icon: "facebook", display_order: 1 },
      { platform: "instagram", url: "https://instagram.com/crocco", icon: "instagram", display_order: 2 },
    ];
    
    return NextResponse.json({ 
      success: false, 
      data: fallbackLinks,
      error: "Database connection failed, using fallback data" 
    }, { status: 200 });
  }
}
