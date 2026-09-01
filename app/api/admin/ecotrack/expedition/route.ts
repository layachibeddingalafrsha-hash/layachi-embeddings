// Ecom-DZ Delivery API — send orders, track shipments
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const EXPEDITION_DISABLED_MESSAGE = "Shipping company expedition actions are disabled for this store.";

const ECOMDZ_URL = process.env.ECOMDZ_API_URL || "https://ecom-dz.net/Api_v1";
const ECOMDZ_KEY = process.env.ECOMDZ_API_KEY || "";
const ECOMDZ_TOKEN = process.env.ECOMDZ_API_TOKEN || "";

async function ecomdzRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" = "GET",
  body?: any,
  page?: number
) {
  const url = `${ECOMDZ_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Key": ECOMDZ_KEY,
    "Token": ECOMDZ_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (page && page > 0) {
    headers["Page"] = String(page);
  }

  const options: RequestInit = { method, headers };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, data };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    const { db } = await connectToDatabase();

    if (["send-order", "send-orders", "mark-ready", "delete-orders", "sync-orders"].includes(action)) {
      return NextResponse.json(
        { error: EXPEDITION_DISABLED_MESSAGE, action },
        { status: 410 }
      );
    }

    // ── Test Connection ───────────────────────────────────────
    if (action === "test-connection") {
      const { status, data } = await ecomdzRequest("/Test");
      return NextResponse.json(data, { status });
    }

    // ── Send Single Order to Ecom-DZ ────────────────────────
    if (action === "send-order") {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ error: "orderId required" }, { status: 400 });
      }

      const order = await db
        .collection("orders")
        .findOne({ _id: new ObjectId(orderId) });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.tracking_number) {
        return NextResponse.json(
          { error: "Order already expedited", tracking: order.tracking_number },
          { status: 400 }
        );
      }

      // Get order items for product details
      const items = await db
        .collection("orderitems")
        .find({ orderId: new ObjectId(orderId) })
        .toArray();

      const productNames = items.map((i: any) => i.productName).join(", ");
      const firstItem = items[0];

      // Build Ecom-DZ request body
      const colisData = {
        Echange: 0, // 0 = normal delivery, 1 = exchange
        Stopdesk: order.deliveryType === "to_desk" ? 1 : 0,
        NomComplet: order.customerName,
        Mobile_1: order.customerPhone,
        Mobile_2: "",
        Adresse: order.address || "",
        Wilaya: String(order.wilayaCode || ""),
        Commune: order.commune || "",
        Article: productNames || "Product",
        Ref_Article: firstItem?.sku || firstItem?.productId?.toString().substring(0, 8) || "",
        NoteFournisseur: order.notes || "",
        Total: order.total.toString(),
        ID_Externe: order._id.toString(),
        Source: "Website"
      };

      const { status, data } = await ecomdzRequest("/Colis", "POST", {
        Colis: [colisData]
      });

      if (status === 200 && data.Colis && data.Colis.length > 0) {
        const coliResponse = data.Colis[0];
        
        // Update order with tracking number and set status to "sent"
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              tracking_number: coliResponse.Tracking,
              delivery_status: coliResponse.Avancement || "En Préparation",
              delivery_situation: coliResponse.Situation || "EnCours",
              status: "sent",
              sent_to_delivery_at: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          tracking: coliResponse.Tracking,
          label: coliResponse.label,
          status: coliResponse.Avancement,
          quota: data.Quota
        });
      } else {
        return NextResponse.json(
          { error: "Failed to create delivery order", details: data },
          { status: 400 }
        );
      }
    }

    // ── Send Multiple Orders to Ecom-DZ ─────────────────────
    if (action === "send-orders") {
      const { orderIds } = body;
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: "orderIds array required" }, { status: 400 });
      }

      const results: Record<string, any> = {};
      
      for (const orderId of orderIds) {
        try {
          const order = await db
            .collection("orders")
            .findOne({ _id: new ObjectId(orderId) });

          if (!order || order.tracking_number) {
            results[orderId] = { success: false, error: "Invalid or already sent" };
            continue;
          }

          // Get order items
          const items = await db
            .collection("orderitems")
            .find({ orderId: new ObjectId(orderId) })
            .toArray();

          const productNames = items.map((i: any) => i.productName).join(", ");
          const firstItem = items[0];

          const colisData = {
            Echange: 0,
            Stopdesk: order.deliveryType === "to_desk" ? 1 : 0,
            NomComplet: order.customerName,
            Mobile_1: order.customerPhone,
            Mobile_2: "",
            Adresse: order.address || "",
            Wilaya: String(order.wilayaCode || ""),
            Commune: order.commune || "",
            Article: productNames || "Product",
            Ref_Article: firstItem?.sku || firstItem?.productId?.toString().substring(0, 8) || "",
            NoteFournisseur: order.notes || "",
            Total: order.total.toString(),
            ID_Externe: order._id.toString(),
            Source: "Website"
          };

          const { status, data } = await ecomdzRequest("/Colis", "POST", {
            Colis: [colisData]
          });

          if (status === 200 && data.Colis && data.Colis.length > 0) {
            const coliResponse = data.Colis[0];
            
            await db.collection("orders").updateOne(
              { _id: new ObjectId(orderId) },
              {
                $set: {
                  tracking_number: coliResponse.Tracking,
                  delivery_status: coliResponse.Avancement || "En Préparation",
                  delivery_situation: coliResponse.Situation || "EnCours",
                  status: "sent",
                  sent_to_delivery_at: new Date(),
                  updatedAt: new Date(),
                },
              }
            );

            results[orderId] = {
              success: true,
              tracking: coliResponse.Tracking
            };
          } else {
            results[orderId] = { success: false, error: "API error" };
          }
        } catch (err: any) {
          results[orderId] = { success: false, error: err.message };
        }
      }

      return NextResponse.json({ results });
    }

    // ── Get Order Status ─────────────────────────────────────
    if (action === "get-status") {
      const { tracking } = body;
      if (!tracking) {
        return NextResponse.json({ error: "tracking required" }, { status: 400 });
      }

      const { status, data } = await ecomdzRequest(`/Colis/Tracking/${tracking}`);
      return NextResponse.json(data, { status });
    }

    // ── Modify Order Info (PUT /Colis/{Tracking}) ───────────
    if (action === "modify-order") {
      const { tracking, colisData } = body;
      if (!tracking) {
        return NextResponse.json({ error: "tracking required" }, { status: 400 });
      }
      if (!colisData || typeof colisData !== "object") {
        return NextResponse.json({ error: "colisData object required" }, { status: 400 });
      }

      // Only these fields can be modified (while "En Préparation")
      const allowed = ["NomComplet", "Mobile_1", "Mobile_2", "Adresse", "Commune",
        "Article", "Ref_Article", "NoteFournisseur", "Total", "ID_Externe", "Source"];
      const payload: Record<string, any> = {};
      for (const key of allowed) {
        if (colisData[key] !== undefined) payload[key] = colisData[key];
      }

      const { status, data } = await ecomdzRequest(`/Colis/${tracking}`, "PUT", {
        Colis: payload,
      });

      if (status === 200) {
        // Update local order if ID_Externe present
        const order = await db.collection("orders").findOne({ tracking_number: tracking });
        if (order) {
          const updates: Record<string, any> = { updatedAt: new Date() };
          if (payload.NomComplet) updates.customerName = payload.NomComplet;
          if (payload.Mobile_1) updates.customerPhone = payload.Mobile_1;
          if (payload.Adresse) updates.address = payload.Adresse;
          if (payload.Total) updates.total = Number(payload.Total);
          if (payload.NoteFournisseur) updates.notes = payload.NoteFournisseur;
          await db.collection("orders").updateOne({ _id: order._id }, { $set: updates });
        }
      }

      return NextResponse.json(data, { status });
    }

    // ── Mark Ready to Ship (PUT /aExpédier) ──────────────────
    if (action === "mark-ready") {
      const { trackings } = body;
      if (!Array.isArray(trackings) || trackings.length === 0) {
        return NextResponse.json({ error: "trackings array required" }, { status: 400 });
      }

      const colisPayload = trackings.map((t: string) => ({ Tracking: t }));
      const { status, data } = await ecomdzRequest("/aExpédier", "PUT", {
        Colis: colisPayload,
      });

      if (status === 200) {
        // Update local delivery_status to "En Traitement"
        for (const t of trackings) {
          await db.collection("orders").updateOne(
            { tracking_number: t },
            { $set: { delivery_status: "En Traitement", updatedAt: new Date() } }
          );
        }
      }

      return NextResponse.json(data, { status });
    }

    // ── Delete / Cancel Orders (PUT /Supprimer) ──────────────
    if (action === "delete-orders") {
      const { trackings } = body;
      if (!Array.isArray(trackings) || trackings.length === 0) {
        return NextResponse.json({ error: "trackings array required" }, { status: 400 });
      }

      const colisPayload = trackings.map((t: string) => ({ Tracking: t }));
      const { status, data } = await ecomdzRequest("/Supprimer", "PUT", {
        Colis: colisPayload,
      });

      if (status === 200) {
        // Remove tracking from local orders and reset delivery fields + status
        for (const t of trackings) {
          await db.collection("orders").updateOne(
            { tracking_number: t },
            {
              $set: { status: "pending", updatedAt: new Date() },
              $unset: {
                tracking_number: "",
                delivery_status: "",
                delivery_situation: "",
                delivery_comment: "",
                delivery_date: "",
                sent_to_delivery_at: "",
              },
            }
          );
        }
      }

      return NextResponse.json(data, { status });
    }

    // ── Filter by Date (GET /Colis/Date_*/{Date}) ────────────
    if (action === "filter-by-date") {
      const { filterType, date, page: reqPage } = body;
      if (!filterType || !date) {
        return NextResponse.json(
          { error: "filterType (creation|livree|last_status) and date (DD/MM/YYYY) required" },
          { status: 400 }
        );
      }

      const endpointMap: Record<string, string> = {
        creation: `/Colis/Date_Creation/${date}`,
        livree: `/Colis/Date_Livree/${date}`,
        last_status: `/Colis/Date_last_status/${date}`,
      };

      const ep = endpointMap[filterType];
      if (!ep) {
        return NextResponse.json(
          { error: "filterType must be creation, livree, or last_status" },
          { status: 400 }
        );
      }

      const { status, data } = await ecomdzRequest(ep, "GET", undefined, reqPage || 1);
      return NextResponse.json(data, { status });
    }

    // ── Bulk Tracking Lookup (POST /Colis/Liste) ─────────────
    if (action === "bulk-tracking") {
      const { trackings } = body;
      if (!Array.isArray(trackings) || trackings.length === 0) {
        return NextResponse.json({ error: "trackings array required" }, { status: 400 });
      }

      const colisPayload = trackings.map((t: string) => ({ Tracking: t }));
      const { status, data } = await ecomdzRequest("/Colis/Liste", "POST", {
        Colis: colisPayload,
      });

      return NextResponse.json(data, { status });
    }

    // ── Sync All Orders (with pagination) ────────────────────
    if (action === "sync-orders") {
      const reqPage = body.page || 1;
      const { status, data } = await ecomdzRequest("/Colis", "GET", undefined, reqPage);
      
      if (status === 200 && data.Colis) {
        let updated = 0;
        
        for (const colis of data.Colis) {
          if (colis.ID_Externe) {
            try {
              const result = await db.collection("orders").updateOne(
                { _id: new ObjectId(colis.ID_Externe) },
                {
                  $set: {
                    tracking_number: colis.Tracking,
                    delivery_status: colis.Avancement,
                    delivery_situation: colis.Situation,
                    delivery_comment: colis.Commentaire || null,
                    delivery_date: colis.Date_Livrée ? new Date(colis.Date_Livrée) : null,
                    updatedAt: new Date(),
                  },
                }
              );
              if (result.modifiedCount > 0) updated++;
            } catch (err) {
              console.error("Error updating order:", err);
            }
          }
        }

        return NextResponse.json({
          success: true,
          synced: updated,
          total: data.Nb_Colis,
          totalPages: data.Nb_Page || 1,
          currentPage: data.Current_Page || reqPage,
          quota: data.Quota
        });
      }

      return NextResponse.json({ error: "Failed to sync orders" }, { status: 400 });
    }

    // ── List Expedited Orders ────────────────────────────────
    if (action === "list-expedited") {
      const page = body.page || 1;
      const limit = body.limit || 20;
      const search = body.search || "";
      const deliveryStatus = body.deliveryStatus || "";

      const filter: any = {
        tracking_number: { $exists: true, $ne: null },
      };

      if (search) {
        filter.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { customerPhone: { $regex: search, $options: "i" } },
          { tracking_number: { $regex: search, $options: "i" } },
        ];
      }

      if (deliveryStatus) {
        filter.delivery_status = deliveryStatus;
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        db.collection("orders").find(filter).sort({ sent_to_delivery_at: -1 }).skip(skip).limit(limit).toArray(),
        db.collection("orders").countDocuments(filter),
      ]);

      // Fetch items
      const orderIds = orders.map((o: any) => o._id);
      const allItems = await db
        .collection("orderitems")
        .find({ orderId: { $in: orderIds } })
        .toArray();

      const ordersWithItems = orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        items: allItems
          .filter((item: any) => item.orderId.toString() === order._id.toString())
          .map((item: any) => ({ ...item, _id: item._id.toString() })),
      }));

      return NextResponse.json({
        orders: ordersWithItems,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Ecom-DZ API error:", error);
    return NextResponse.json(
      { error: "Delivery API error", message: error.message },
      { status: 500 }
    );
  }
}
