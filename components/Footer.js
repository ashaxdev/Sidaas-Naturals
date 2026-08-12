import Link from "next/link";
import { LeafIcon, PhoneIcon, WhatsappIcon, LocationIcon } from "./Icons";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaAmazon } from "react-icons/fa6";

// Wraps a real brand glyph (from react-icons) in a correctly colored circle badge.
function BrandBadge({ children, background, className }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full text-white ${className}`}
      style={{ background }}
    >
      {children}
    </span>
  );
}

function FacebookIcon({ className }) {
  return (
    <BrandBadge background="#1877F2" className={className}>
      <FaFacebookF className="w-[52%] h-[52%]" />
    </BrandBadge>
  );
}

function InstagramIcon({ className }) {
  return (
    <BrandBadge
      background="radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
      className={className}
    >
      <FaInstagram className="w-[62%] h-[62%]" />
    </BrandBadge>
  );
}

function AmazonIcon({ className }) {
  return (
    <BrandBadge background="#232F3E" className={className}>
      <FaAmazon className="w-[58%] h-[58%]" style={{ color: "#FF9900" }} />
    </BrandBadge>
  );
}

function MeeshoIcon({ className }) {
  return (
    <BrandBadge background="#F43397" className={className}>
      <span className="font-black italic" style={{ fontSize: "1.1em", lineHeight: 1 }}>
        M
      </span>
    </BrandBadge>
  );
}

export default function Footer({ settings }) {
  const storeName = settings?.storeName || "Sidaas Naturals";
  const phone = settings?.phone || "+91 8344092627";
  const whatsapp = settings?.whatsapp || "918344092627";
  const address = settings?.address || "Surambati valasu, Erode, Tamil Nadu";

  const instagram =
    settings?.instagram ||
    "https://www.instagram.com/kmc_organic_products?igsh=MWZncXMxN2xvMjMyMA==";
  const facebook =
    settings?.facebook || "https://www.facebook.com/share/1EPxhtXdps/?mibextid=wwXIfr";
  const amazon =
    settings?.amazon ||
    "https://www.amazon.in/b?ie=UTF8&node=27943762031&me=AW3M1SX9Q4BOW";
  const meesho = settings?.meesho || "https://www.meesho.com/KMCORGANICFARM?_ms=3.0.1";
  const youtube = settings?.youtube;

  const socialLinks = [
    { href: facebook, label: "Facebook", Icon: FacebookIcon },
    { href: instagram, label: "Instagram", Icon: InstagramIcon },
    { href: amazon, label: "Amazon", Icon: AmazonIcon },
    { href: meesho, label: "Meesho", Icon: MeeshoIcon },
    { href: youtube, label: "YouTube", Icon: null },
  ].filter((s) => s.href);

  return (
    <footer className="bg-green-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Column 1 - Brand & Contact */}
        <div>
          <div className="flex items-center gap-4 mb-5">
            <Image
              src="/images/logo.jpeg"
              alt={`${storeName} Logo`}
              width={80}
              height={80}
              className="rounded-full object-contain"
            />

            <h2 className="text-2xl font-semibold">{storeName}</h2>
          </div>

          <p className="text-green-100 leading-relaxed max-w-md">
            Fresh and natural organic products.
           
          </p>

          <div className="mt-6 space-y-3 text-green-100">
            {phone && (
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5" />
                {phone}
              </p>
            )}

            {address && (
              <p className="flex items-center gap-2">
                <LocationIcon className="w-5 h-5" />
                {address}
              </p>
            )}

            <p className="text-sm text-green-200">
              GST No: {settings?.gst || "33CFZPA9521C1ZH"}
            </p>

            <p className="text-sm text-green-200">
              MSME Registration: {settings?.msme || "TN-18-0098443"}
            </p>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-green-300 transition"
              >
                <WhatsappIcon className="w-5 h-5" />
                WhatsApp Us
              </a>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-6 flex items-center gap-5">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="flex flex-col items-center gap-1 text-green-100 hover:text-green-300 hover:-translate-y-0.5 transition-transform text-xs font-medium"
                >
                  {Icon ? (
                    <Icon className="w-12 h-12 drop-shadow-md" />
                  ) : (
                    <span className="w-11 h-11 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                      YT
                    </span>
                  )}
                  <span>{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-green-700 mt-10 pt-5 text-center text-sm text-green-200">
        <p>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>

        <p className="mt-2">
          Developed &amp; Designed by{" "}
          <a
            href="https://www.nexirasolution.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-300 hover:text-white hover:underline transition"
          >
            Nexira Solution
          </a>
        </p>
      </div>
    </footer>
  );
}

