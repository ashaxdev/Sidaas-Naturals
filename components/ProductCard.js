"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { BagIcon, LeafIcon } from "./Icons";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const media = product.media?.[0] || product.images?.[0];

  const image = media?.url;
  const mediaType = media?.type || media?.mediaType || "image";
  const outOfStock = product.stock <= 0;

  const hasDiscount = product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="card-hover group relative flex flex-col overflow-hidden rounded-xl2 border border-gold/15 bg-white shadow-card">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-champagne">
        {image ? (
          mediaType === "video" ? (
            <video
              src={image}
              muted
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-forest/30">
            <LeafIcon className="h-12 w-12" />
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ivory">
            Out of Stock
          </span>
        )}

        {!outOfStock && hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-terracotta px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ivory">
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gold-dark">
          {product.category?.name}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-display text-base font-semibold leading-snug text-ink hover:text-forest">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-forest">₹{product.price}</span>
              {hasDiscount && (
                <span className="text-xs text-muted line-through">₹{product.compareAtPrice}</span>
              )}
            </div>
            <p className="text-[11px] text-muted">{product.unit}</p>
          </div>
          <button
            onClick={() => addItem(product, 1)}
            disabled={outOfStock}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-ivory transition hover:bg-forest-light disabled:cursor-not-allowed disabled:bg-muted/40"
            aria-label="Add to cart"
          >
            <BagIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}