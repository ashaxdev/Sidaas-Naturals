"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { LeafIcon, BagIcon } from "./Icons";
import { Search, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
];

function ShippingMarquee({ settings }) {
  const freeShipping = settings?.freeShipping ?? 999;
  // const shippingFee = settings?.shippingFee ?? 49;

  const messages = [
    `🚚 FREE SHIPPING on orders above ₹${freeShipping}`,
    `🌿 100% Natural & Organic Products`,
    `✅ Pan India Delivery`,
  ];

  // Duplicate the messages so the marquee loops seamlessly
  const track = [...messages, ...messages];

  return (
    <div className="relative overflow-hidden bg-green-700 py-2 text-ivory">
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap px-4 text-xs font-semibold tracking-wide md:text-sm">
        {track.map((msg, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {msg}
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 22s linear infinite;
        }
        .relative:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function Navbar({ settings }) {
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const storeName = settings?.storeName || "Sidaas Naturals";
  const [brand, tagline] = storeName.includes(" ")
    ? [storeName.split(" ")[0], storeName.split(" ").slice(1).join(" ")]
    : [storeName, ""];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <ShippingMarquee settings={settings} />

      <header className="sticky top-0 z-40 border-b border-gold/20 bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.jpeg"
              alt={storeName}
              width={55}
              height={55}
              priority
              className="h-12 w-12 object-contain"
            />

            <div className="leading-tight">
              <h1 className="font-display text-xl font-bold text-forest">
                {brand}
              </h1>
              {tagline && (
                <p className="text-xs uppercase tracking-[0.25em] text-muted">
                  {tagline}
                </p>
              )}
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink/80 transition hover:text-forest"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Desktop expanding search */}
            <div className="hidden items-center md:flex">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center overflow-hidden rounded-full border border-gold/30 bg-white pl-4 pr-1 py-1.5 transition-all"
                >
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink/60 hover:bg-champagne"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-forest transition hover:bg-champagne"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mobile search toggle icon (next to cart) */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-forest transition hover:bg-champagne md:hidden"
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-forest transition hover:bg-champagne"
              aria-label="View cart"
            >
              <BagIcon className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-semibold text-ivory">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <div className="flex flex-col justify-between h-4 w-5">
                <span
                  className={`block h-0.5 w-5 bg-ink transition-all duration-300 ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-ink transition-all duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-ink transition-all duration-300 ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar row (below header) */}
        {searchOpen && (
          <div className="border-t border-gold/20 bg-ivory px-5 py-3 md:hidden">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full border border-gold/30 bg-white px-4 py-2.5"
            >
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </form>
          </div>
        )}

        {open && (
          <nav className="flex flex-col gap-1 border-t border-gold/20 bg-ivory px-5 py-3 md:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-ink/80 hover:bg-champagne"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}