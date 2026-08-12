import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BottomNav from "@/components/BottomNav";
import { getSettings } from "@/lib/settings";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.seoTitle || "Sidaas Naturals | Natural & Handmade Products",
    description:
      settings.seoDescription ||
      "Sidaas Naturals — 100% natural, eco-friendly, handmade products from Surambati valasu, Erode.",
    icons: {
      icon: "/images/logo.jpeg",
      shortcut: "/images/logo.jpeg",
      apple: "/images/logo.jpeg",
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  if (settings.maintenanceMode) {
    return (
      <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body className="font-body antialiased flex min-h-screen items-center justify-center bg-champagne px-5 text-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest">We'll be back soon</h1>
            <p className="mt-3 text-muted">{settings.storeName} is currently undergoing maintenance.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body antialiased pb-16 md:pb-0">
        <CartProvider>
          {children}
          <FloatingWhatsApp whatsapp={settings.whatsapp} />
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}