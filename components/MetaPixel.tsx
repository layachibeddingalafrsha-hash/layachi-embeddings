"use client";

import {
    generateEventId,
    sendAddPaymentInfoEvent,
    sendAddToCartEvent,
    sendContactEvent,
    sendInitiateCheckoutEvent,
    sendLeadEvent,
    sendPurchaseEvent,
    sendViewContentEvent,
    type MetaEventUserData,
} from "@/utils/meta-events";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbq: any;
  }
}

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function buildMetaUserData(userData?: MetaEventUserData): MetaEventUserData | undefined {
  const merged: MetaEventUserData = {
    ...userData,
    fbp: userData?.fbp || getCookieValue("_fbp"),
    fbc: userData?.fbc || getCookieValue("_fbc"),
  };

  return Object.values(merged).some(Boolean) ? merged : undefined;
}

export default function MetaPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";

  // Prevent hydration issues by mounting only on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Check for consent (simplified - in production use proper consent management)
    const storedConsent = localStorage.getItem("analytics_consent");
    if (storedConsent === "true" || storedConsent === null) {
      // Auto-grant consent if not set (you can change this for GDPR compliance)
      setConsent(true);
      if (storedConsent === null) {
        localStorage.setItem("analytics_consent", "true");
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (!consent || !pixelId || !window.fbq) return;

    // Generate unique event_id for PageView deduplication
    const eventId = generateEventId('pageview');

    // Fire PageView on route change with event_id
    window.fbq("track", "PageView", {}, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: PageView tracked for", pathname, "eventID:", eventId);
    }
  }, [pathname, consent, pixelId, debug]);

  if (!pixelId || !consent || !isMounted) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView', {}, {eventID: 'pageview_${Date.now()}_initial'});
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          className="hidden"
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track ViewContent event (product page views)
 * Fires both client-side pixel and server-side Conversions API with same event_id
 */
export async function trackViewContent(
  productId: string,
  productName: string,
  value: number,
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('viewcontent');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: value,
      currency: "DZD",
    }, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: ViewContent tracked", { productId, productName, value, eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendViewContentEvent(productId, productName, value, eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API ViewContent failed", { productId, productName, eventId });
  }

  return eventId;
}

/**
 * Track AddToCart event
 * Fires both client-side pixel and server-side Conversions API with same event_id
 */
export async function trackAddToCart(
  productId: string,
  value: number,
  quantity: number = 1,
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('addtocart');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [productId],
      content_type: "product",
      value: value,
      currency: "DZD",
      num_items: quantity,
    }, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: AddToCart tracked", { productId, value, quantity, eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendAddToCartEvent(productId, value, quantity, eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API AddToCart failed", { productId, quantity, eventId });
  }

  return eventId;
}

/**
 * Track InitiateCheckout event
 * Fires both client-side pixel and server-side Conversions API with same event_id
 */
export async function trackInitiateCheckout(
  value: number,
  numItems: number,
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('initiatecheckout');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: value,
      currency: "DZD",
      num_items: numItems,
    }, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: InitiateCheckout tracked", { value, numItems, eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendInitiateCheckoutEvent(value, numItems, eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API InitiateCheckout failed", { value, numItems, eventId });
  }

  return eventId;
}

/**
 * Track Purchase event
 * Fires both client-side pixel and server-side Conversions API with same event_id
 */
export async function trackPurchase(
  orderId: string,
  value: number,
  numItems: number,
  userData?: MetaEventUserData,
  existingEventId?: string
): Promise<string> {
  const eventId = existingEventId || generateEventId('purchase');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData({
    ...userData,
    external_id: userData?.external_id || orderId,
  });

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value: value,
      currency: "DZD",
      num_items: numItems,
      order_id: orderId,
    }, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: Purchase tracked", { orderId, value, numItems, eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendPurchaseEvent(orderId, value, numItems, eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API Purchase failed", { orderId, value, numItems, eventId });
  }

  return eventId;
}

/**
 * Track Contact event
 * Fires when a customer contacts the business (e.g. submitting a contact form)
 */
export async function trackContact(
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('contact');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {}, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: Contact tracked", { eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendContactEvent(eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API Contact failed", { eventId });
  }

  return eventId;
}

/**
 * Track Lead event
 * Fires when a customer submits information (e.g. contact form, newsletter signup)
 */
export async function trackLead(
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('lead');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {}, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: Lead tracked", { eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendLeadEvent(eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API Lead failed", { eventId });
  }

  return eventId;
}

/**
 * Track AddPaymentInfo event
 * Fires when a customer adds payment/billing information during checkout
 */
export async function trackAddPaymentInfo(
  value: number,
  userData?: MetaEventUserData
): Promise<string> {
  const eventId = generateEventId('addpaymentinfo');
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";
  const enrichedUserData = buildMetaUserData(userData);

  // Client-side pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddPaymentInfo", {
      value: value,
      currency: "DZD",
    }, { eventID: eventId });

    if (debug) {
      console.log("Meta Pixel: AddPaymentInfo tracked", { value, eventId });
    }
  }

  // Server-side Conversions API
  const success = await sendAddPaymentInfoEvent(value, eventId, enrichedUserData);

  if (!success && debug) {
    console.error("Meta Conversions API AddPaymentInfo failed", { value, eventId });
  }

  return eventId;
}

/**
 * Track Search event (standard Meta event)
 * Fires when a user performs a search or filters content
 */
export function trackSearch(searchString: string, extraData?: Record<string, any>): void {
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Search", {
      search_string: searchString,
      ...extraData,
    });

    if (debug) {
      console.log("Meta Pixel: Search tracked", { searchString, ...extraData });
    }
  }
}

/**
 * Track FindLocation event (standard Meta event)
 * Fires when a user finds a store location / selects a wilaya for delivery
 */
export function trackFindLocation(location: string): void {
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "FindLocation", {
      content_name: location,
    });

    if (debug) {
      console.log("Meta Pixel: FindLocation tracked", { location });
    }
  }
}

/**
 * Track a custom event (trackCustom) for any button/interaction
 * Use this for non-standard events like button clicks, CTA clicks, navigation, etc.
 */
export function trackCustomEvent(
  eventName: string,
  data?: Record<string, any>
): void {
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, data || {});

    if (debug) {
      console.log(`Meta Pixel: Custom event '${eventName}' tracked`, data);
    }
  }
}

/**
 * Track CompleteRegistration event (standard Meta event)
 * Fires when a user completes a newsletter signup or registration
 */
export function trackCompleteRegistration(extraData?: Record<string, any>): void {
  const debug = process.env.NEXT_PUBLIC_META_DEBUG === "true";

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "CompleteRegistration", extraData || {});

    if (debug) {
      console.log("Meta Pixel: CompleteRegistration tracked", extraData);
    }
  }
}
