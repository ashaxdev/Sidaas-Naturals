// lib/settings.js
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const DEFAULTS = {
  storeName: "Sidaas Naturals",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  shippingFee: 49,
  freeShipping: 999,
  deliveryTime: "2-4 Days",
  instagram: "",
  facebook: "",
  youtube: "",
  seoTitle: "Sidaas Naturals",
  seoDescription: "",
  maintenanceMode: false,
};

export async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : DEFAULTS;
}