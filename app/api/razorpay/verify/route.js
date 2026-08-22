import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PendingOrder from "@/models/PendingOrder";
import { buildOrderFromItems, decrementStock } from "@/lib/buildOrderFromItems";

async function generateOrderNumber() {
  const prefix = "KMC";
  const date = new Date();
  const datePart = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const count = await Order.countDocuments();
  const seq = (count + 1).toString().padStart(4, "0");
  return `${prefix}-${datePart}-${seq}`;
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // If the webhook already finished this order (it can race ahead of the
    // browser, especially on slow connections), just return the existing one
    // instead of creating a duplicate.
    const existing = await Order.findOne({ "razorpay.orderId": razorpay_order_id });
    if (existing) {
      return NextResponse.json({ order: existing }, { status: 200 });
    }

    const pending = await PendingOrder.findOne({ razorpayOrderId: razorpay_order_id });
    if (!pending) {
      return NextResponse.json({ error: "Order session not found. Please contact support." }, { status: 404 });
    }
    if (pending.status === "completed" && pending.finalOrder) {
      const order = await Order.findById(pending.finalOrder);
      return NextResponse.json({ order }, { status: 200 });
    }

    const { validatedItems, subtotal } = await buildOrderFromItems(pending.items);
    const total = subtotal + Number(pending.shippingFee || 0);
    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: pending.customer,
      items: validatedItems,
      subtotal,
      shippingFee: pending.shippingFee,
      total,
      paymentMethod: "Online",
      paymentStatus: "paid",
      status: "confirmed",
      statusHistory: [{ status: "confirmed", note: "Paid via Razorpay" }],
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    await decrementStock(validatedItems);

    pending.status = "completed";
    pending.finalOrder = order._id;
    await pending.save();

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Payment verification failed." }, { status: 500 });
  }
}