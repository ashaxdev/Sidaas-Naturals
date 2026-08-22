import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import PendingOrder from "@/models/PendingOrder";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { amount, customer, items, shippingFee = 0 } = body; // amount in rupees

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: "Name, phone and address are required." }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // Save everything needed to build the real Order, keyed by the Razorpay
    // order id. If the customer closes the tab right after paying, the
    // webhook will use this record to finish the job.
    await PendingOrder.create({
      razorpayOrderId: order.id,
      customer,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingFee,
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create Razorpay order." }, { status: 500 });
  }
}