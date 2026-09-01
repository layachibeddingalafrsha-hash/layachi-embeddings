import { sha256 } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function isSha256(value: string): boolean {
  return value.length === 64 && /^[a-f0-9]+$/i.test(value);
}

function normalizePhone(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.startsWith("213")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `213${digitsOnly.slice(1)}`;

  return digitsOnly;
}

export async function POST(request: NextRequest) {
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  
  try {
    const body = await request.json();
    const { event_name, event_id, event_time, user_data, custom_data, event_source_url } = body;

    // Validate required fields
    if (!event_name) {
      return NextResponse.json(
        { error: "event_name is required" },
        { status: 400 }
      );
    }

    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_PIXEL_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      if (debug) {
        console.warn("Meta Pixel not configured - missing NEXT_PUBLIC_META_PIXEL_ID or META_PIXEL_ACCESS_TOKEN");
      }
      return NextResponse.json(
        {
          error: "Meta Pixel not configured",
          missing: {
            pixelId: !pixelId,
            accessToken: !accessToken,
          },
          event_name,
        },
        { status: 503 }
      );
    }

    // Hash PII if present and not already hashed
    const userData: any = {};
    
    if (user_data?.email) {
      if (isSha256(user_data.email)) {
        userData.em = [user_data.email];
      } else if (user_data.email.indexOf("@") !== -1) {
        userData.em = [sha256(user_data.email.trim().toLowerCase())];
      }
    }

    if (user_data?.phone) {
      if (isSha256(user_data.phone)) {
        userData.ph = [user_data.phone];
      } else {
        const normalizedPhone = normalizePhone(user_data.phone.trim());
        if (normalizedPhone) {
          userData.ph = [sha256(normalizedPhone)];
        }
      }
    }

    if (user_data?.fbp) {
      userData.fbp = user_data.fbp;
    }

    if (user_data?.fbc) {
      userData.fbc = user_data.fbc;
    }

    if (user_data?.external_id) {
      userData.external_id = [isSha256(user_data.external_id) ? user_data.external_id : sha256(user_data.external_id.trim())];
    }

    // Get client IP for better matching (forwarded from client)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") ||
                     undefined;

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Add client_ip_address and client_user_agent if available
    if (clientIp) {
      userData.client_ip_address = clientIp;
    }
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    const metaEventUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;
    
    const eventPayload: any = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || process.env.NEXT_PUBLIC_SITE_URL,
      action_source: "website",
      user_data: Object.keys(userData).length > 0 ? userData : undefined,
      custom_data: custom_data || undefined,
    };

    // Add event_id for deduplication (critical for matching with client-side pixel)
    if (event_id) {
      eventPayload.event_id = event_id;
    }

    const eventData = {
      data: [eventPayload],
      access_token: accessToken,
      test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
    };

    if (debug) {
      console.log("Sending Meta Conversion Event:", JSON.stringify(eventData, null, 2));
    }

    const response = await fetch(metaEventUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Meta API error:", responseData);
      return NextResponse.json(
        { error: "Failed to send event to Meta", details: responseData },
        { status: response.status }
      );
    }

    if (debug) {
      console.log("Meta API Response:", responseData);
    }

    return NextResponse.json({
      success: true,
      event_id: event_id,
      response: responseData,
    });
  } catch (error) {
    console.error("Error sending Meta event:", error);
    return NextResponse.json(
      { error: "Failed to send Meta event", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
