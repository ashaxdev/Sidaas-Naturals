import mongoose from "mongoose";

// A PendingOrder is created the moment we ask Razorpay for an order id
// (i.e. the instant checkout starts), and holds everything needed to build
// the real Order later. This lets the webhook finalize an order even if the
// customer closes the browser right after paying, before the client-side
// verify() call ever runs.
const PendingOrderSchema = new mongoose.Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      address: { type: String, required: true },
      city: { type: String, default: "" },
      state: { type: String, default: "Tamil Nadu" },
      pincode: { type: String, default: "" },
    },
    items: {
      type: [
        {
          productId: String,
          quantity: Number,
        },
      ],
      required: true,
    },
    shippingFee: { type: Number, default: 0 },
    // "pending" until either the webhook or the client-side verify route
    // successfully turns this into a real Order. Prevents double-processing.
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

// Auto-expire pending orders after 24h if nothing ever completed them
// (e.g. user opened checkout, got a Razorpay order id, then abandoned entirely).
PendingOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default mongoose.models.PendingOrder ||
  mongoose.model("PendingOrder", PendingOrderSchema);