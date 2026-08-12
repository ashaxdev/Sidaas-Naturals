// Seed script — populates the database with KMC's real product categories
// and a few starter products so the store isn't empty on first run.
//
// Usage:  npm run seed
// Requires MONGODB_URI to be set in .env.local

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true },
    sortOrder: Number,
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    shortDescription: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: Number,
    compareAtPrice: Number,
    unit: String,
    images: [{ url: String, publicId: String }],
    stock: Number,
    lowStockThreshold: Number,
    isFeatured: Boolean,
    isActive: Boolean,
    attributes: {
      handmade: Boolean,
      natural: Boolean,
      ecoFriendly: Boolean,
    },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const CATEGORIES = [
  { name: "Handmade Wire Bags", slug: "handmade-wire-bags", icon: "bag", sortOrder: 1, description: "Durable, reusable wire bags in various sizes and colors." },
  { name: "Organic Fertilizers & Soil Enhancers", slug: "organic-fertilizers", icon: "drop", sortOrder: 2, description: "Vermicompost, cow dung manure, fish amino acid and more." },
  { name: "Clay Products", slug: "clay-products", icon: "pot", sortOrder: 3, description: "Traditional handcrafted clay pots, cookware and decor." },
  { name: "Wooden Products", slug: "wooden-products", icon: "wood", sortOrder: 4, description: "Handcrafted wooden items, kitchen utensils and decor." },
  { name: "Handmade Wooden Toys & Miniatures", slug: "wooden-toys", icon: "wood", sortOrder: 5, description: "Safe, sustainable, educational wooden toys." },
  { name: "Herbal Products", slug: "herbal-products", icon: "herb", sortOrder: 6, description: "Dried herbs, leaves and homemade health powders." },
];

const PRODUCTS = [
  { name: "Fish Amino Acid (FAA) - 1 Litre", category: "organic-fertilizers", price: 250, unit: "1 litre", stock: 40, isFeatured: true, description: "100% natural organic plant growth promoter, suitable for home and terrace gardens." },
  { name: "Vermicompost", category: "organic-fertilizers", price: 180, unit: "1 kg", stock: 60, isFeatured: false, description: "Natural soil conditioner rich in nutrients for healthy plant growth." },
  { name: "Terracotta Water Storage Pot", category: "clay-products", price: 450, unit: "piece", stock: 15, isFeatured: true, description: "Traditional handcrafted clay pot that keeps water naturally cool." },
  { name: "Clay Coffee Cup", category: "clay-products", price: 90, unit: "piece", stock: 50, isFeatured: false, description: "Eco-friendly handcrafted clay cup, perfect for your morning coffee." },
  { name: "Wooden Spoon Set", category: "wooden-products", price: 320, unit: "set of 6", stock: 25, isFeatured: true, description: "Handcrafted wooden kitchen utensils, customized and durable." },
  { name: "Handmade Wire Shopping Bag", category: "handmade-wire-bags", price: 220, unit: "piece", stock: 30, isFeatured: true, description: "Durable and reusable wire bag, available in various sizes and colors." },
  { name: "Wooden Miniature Toy Set", category: "wooden-toys", price: 350, unit: "set", stock: 12, isFeatured: false, description: "Safe, child-friendly, traditional wooden toys." },
  { name: "Dried Curry Leaves Powder", category: "herbal-products", price: 120, unit: "200 g", stock: 35, isFeatured: false, description: "Homemade herbal powder made from sun-dried curry leaves." },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap[cat.slug] = existing._id;
      console.log(`Category exists: ${cat.name}`);
      continue;
    }
    const created = await Category.create(cat);
    categoryMap[cat.slug] = created._id;
    console.log(`Created category: ${cat.name}`);
  }

  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      console.log(`Product exists: ${p.name}`);
      continue;
    }
    await Product.create({
      ...p,
      slug,
      category: categoryMap[p.category],
      lowStockThreshold: 5,
      attributes: { handmade: true, natural: true, ecoFriendly: true },
      isActive: true,
      images: [],
    });
    console.log(`Created product: ${p.name}`);
  }

  console.log("\nSeeding complete. Add product images from the admin panel (Products > Edit).");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
