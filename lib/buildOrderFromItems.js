import Product from "@/models/Product";

// Validates stock/price server-side and builds the line items stored on an Order.
// Throws an Error with a user-facing message if something is invalid.
export async function buildOrderFromItems(items) {
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product unavailable: ${item.name || item.productId}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    const firstImage = product.media?.find((m) => m.type === "image");

    subtotal += product.price * item.quantity;
    validatedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku || "",
      // media is the current field; images is kept as a fallback for any
      // legacy products that haven't been re-saved under the new schema.
      image: firstImage?.url || product.images?.[0]?.url || "",
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
    });
  }

  return { validatedItems, subtotal };
}

export async function decrementStock(validatedItems) {
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
}

export async function restockItems(items) {
  for (const item of items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }
}