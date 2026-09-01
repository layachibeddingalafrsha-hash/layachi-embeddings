/**
 * Client-side helper to send events to the Meta Conversions API
 * This ensures both client-side pixel and server-side API fire with the same event_id
 */

export interface MetaEventUserData {
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  external_id?: string;
}

export interface MetaEventCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

export interface MetaEventParams {
  event_name: string;
  event_id: string;
  user_data?: MetaEventUserData;
  custom_data?: MetaEventCustomData;
  event_source_url?: string;
}

/**
 * Generate a unique event ID for deduplication between client and server events
 */
export function generateEventId(prefix: string = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Send an event to the Meta Conversions API via our server endpoint
 * This should be called alongside client-side fbq() calls with the same event_id
 */
export async function sendMetaEvent(params: MetaEventParams): Promise<boolean> {
  const debug = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_META_DEBUG === 'true';
  
  try {
    const eventSourceUrl = params.event_source_url || (typeof window !== 'undefined' ? window.location.href : undefined);
    
    const response = await fetch('/api/meta-event', {
      method: 'POST',
      keepalive: true,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: params.event_name,
        event_id: params.event_id,
        event_time: Math.floor(Date.now() / 1000),
        user_data: params.user_data || {},
        custom_data: params.custom_data || {},
        event_source_url: eventSourceUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (debug) {
        console.error('Meta Conversions API error:', errorData);
      }
      return false;
    }

    if (debug) {
      const data = await response.json();
      console.log(`Meta Conversions API: ${params.event_name} sent successfully`, data);
    }

    return true;
  } catch (error) {
    if (debug) {
      console.error('Failed to send Meta Conversions API event:', error);
    }
    return false;
  }
}

/**
 * Convenience functions for common events
 */

export async function sendViewContentEvent(
  productId: string,
  productName: string,
  value: number,
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'ViewContent',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
      value,
      currency: 'DZD',
    },
  });
}

export async function sendAddToCartEvent(
  productId: string,
  value: number,
  quantity: number,
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'AddToCart',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      content_ids: [productId],
      content_type: 'product',
      value,
      currency: 'DZD',
      num_items: quantity,
    },
  });
}

export async function sendInitiateCheckoutEvent(
  value: number,
  numItems: number,
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'InitiateCheckout',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      value,
      currency: 'DZD',
      num_items: numItems,
    },
  });
}

export async function sendPurchaseEvent(
  orderId: string,
  value: number,
  numItems: number,
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'Purchase',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      value,
      currency: 'DZD',
      num_items: numItems,
      order_id: orderId,
    },
  });
}

export async function sendContactEvent(
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'Contact',
    event_id: eventId,
    user_data: userData,
    custom_data: {},
  });
}

export async function sendLeadEvent(
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'Lead',
    event_id: eventId,
    user_data: userData,
    custom_data: {},
  });
}

export async function sendAddPaymentInfoEvent(
  value: number,
  eventId: string,
  userData?: MetaEventUserData
): Promise<boolean> {
  return sendMetaEvent({
    event_name: 'AddPaymentInfo',
    event_id: eventId,
    user_data: userData,
    custom_data: {
      value,
      currency: 'DZD',
    },
  });
}

