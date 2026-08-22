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

// Razorpay requires the RAW request body (not parsed JSON) to verify the
// webhook signature, so we read req.text() rather than req.json().
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (expectedSignature !== signature) {
    console.error("Razorpay webhook signature mismatch.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // We only care about successful captures. Razorpay sends several event
  // types (order.paid, payment.authorized, etc) — payment.captured is the
  // reliable "money has actually landed" signal for standard checkout.
  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  try {
    await connectDB();

    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;

    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Missing order id in payload." }, { status: 400 });
    }

    // Idempotency guard #1: if an Order already exists for this Razorpay
    // order (created by the client-side verify route beating us here),
    // there's nothing left to do.
    const alreadyExists = await Order.findOne({ "razorpay.orderId": razorpayOrderId });
    if (alreadyExists) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    const pending = await PendingOrder.findOne({ razorpayOrderId });
    if (!pending) {
      // Nothing we can build the order from — log for manual reconciliation.
      console.error(`No PendingOrder found for Razorpay order ${razorpayOrderId}`);
      return NextResponse.json({ error: "No matching pending order." }, { status: 404 });
    }

    // Idempotency guard #2: PendingOrder itself already marked completed
    // (race with the client verify route landing first).
    if (pending.status === "completed") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
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
      statusHistory: [{ status: "confirmed", note: "Paid via Razorpay (webhook)" }],
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: signature,
      },
    });

    await decrementStock(validatedItems);

    pending.status = "completed";
    pending.finalOrder = order._id;
    await pending.save();

    return NextResponse.json({ received: true, orderId: order._id });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Failed to process webhook." }, { status: 500 });
  }
}