import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (body.status && body.status !== order.status) {
      if (body.status === "cancelled" && order.status !== "cancelled") {
        // Restock items on cancellation
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
          }
        }
      }
      order.status = body.status;
      order.statusHistory.push({ status: body.status, note: body.note || "" });
    }

    if (body.tracking) {
      const { courier = "", trackingNumber = "", trackingUrl = "" } = body.tracking;
      order.tracking = {
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
        updatedAt: new Date(),
      };
    }

    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.notes !== undefined) order.notes = body.notes;

    await order.save();
    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}