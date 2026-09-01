// Admin dashboard stats API
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalProducts,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      recentOrders,
      unreadMessages,
      allProducts,
      activeBundles,
      todayOrders,
      todayDelivered,
    ] = await Promise.all([
      db.collection("products").countDocuments({}),
      db.collection("orders").countDocuments({}),
      db.collection("orders").find({ status: "delivered" }).toArray(),
      db.collection("orders").countDocuments({ status: "pending" }),
      db.collection("orders").find({}).sort({ createdAt: -1 }).limit(10).toArray(),
      db.collection("contact_messages").countDocuments({ read: { $ne: true } }),
      db.collection("products").find({}, { projection: { stockQuantity: 1, stock_quantity: 1, inStock: 1, in_stock: 1 } }).toArray(),
      db.collection("product_bundles").countDocuments({ active: true }),
      db.collection("orders").countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      db.collection("orders").find({ status: "delivered", createdAt: { $gte: todayStart, $lte: todayEnd } }).toArray(),
    ]);

    // Calculate total revenue from delivered orders
    const totalRevenue = deliveredOrders.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0
    );

    // Calculate today's revenue
    const todayRevenue = todayDelivered.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0
    );

    // Stock calculations
    const totalStock = allProducts.reduce(
      (sum: number, p: any) => sum + (p.stockQuantity || p.stock_quantity || 0),
      0
    );
    const outOfStockProducts = allProducts.filter(
      (p: any) => (p.stockQuantity || p.stock_quantity || 0) === 0 || p.inStock === false || p.in_stock === false
    ).length;
    const lowStockProducts = allProducts.filter(
      (p: any) => {
        const qty = p.stockQuantity || p.stock_quantity || 0;
        return qty > 0 && qty < 5;
      }
    ).length;

    // Order status distribution
    const statusPipeline = [
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ];
    const statusDistribution = await db
      .collection("orders")
      .aggregate(statusPipeline)
      .toArray();

    // Revenue over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const revenuePipeline = [
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as const } },
    ];
    const revenueByDay = await db
      .collection("orders")
      .aggregate(revenuePipeline)
      .toArray();

    // Top selling products
    const topProducts = await db
      .collection("products")
      .find({})
      .sort({ salesCount: -1, sales_count: -1 })
      .limit(5)
      .project({
        name: 1,
        salesCount: 1,
        sales_count: 1,
        stockQuantity: 1,
        stock_quantity: 1,
        price: 1,
        images: 1,
      })
      .toArray();

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        unreadMessages,
        totalStock,
        outOfStockProducts,
        lowStockProducts,
        activeBundles,
        todayOrders,
        todayRevenue,
      },
      statusDistribution: statusDistribution.map((s: any) => ({
        status: s._id || "unknown",
        count: s.count,
      })),
      revenueByDay: revenueByDay.map((r: any) => ({
        date: r._id,
        revenue: r.revenue,
        orders: r.count,
      })),
      recentOrders: recentOrders.map((o: any) => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber || o.order_number || "",
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        wilayaName: o.wilayaName,
        itemCount: o.orderItems?.length || 0,
      })),
      topProducts: topProducts.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        salesCount: p.salesCount || p.sales_count || 0,
        stockQuantity: p.stockQuantity || p.stock_quantity || 0,
        price: p.price,
        image: p.images?.[0] || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
