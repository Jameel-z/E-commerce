import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | 961shop",
  description:
    "961shop is a Lebanon-based retailer of laptops, computers, and tech accessories, with a physical store in Zefta, Nabatieh and online ordering with cash on delivery.",
  openGraph: {
    title: "About Us | 961shop",
    description:
      "961shop is a Lebanon-based retailer of laptops, computers, and tech accessories, with a physical store in Zefta, Nabatieh and online ordering with cash on delivery.",
    url: "https://961shop.com/about",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/about",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SALES_PHONE = "+961 76 840474";
const SALES_PHONE_TEL = "+96176840474";
const SUPPORT_PHONE = "+961 03751903";
const SUPPORT_PHONE_TEL = "+96103751903";
const CONTACT_EMAIL = "support@961shop.com";
const ADDRESS = "Hamdan Building, Main Road, 1st Floor, Zefta, Nabatieh Governorate 7104, Lebanon";

export default function AboutPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "About Us",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            About 961shop
          </h1>
        </div>

        {/* Intro narrative */}
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground mb-10">
          <p>Welcome to 961shop.</p>

          <p className="italic font-medium text-foreground">
            Lebanon&apos;s destination for laptops, computers, and technology
            accessories.
          </p>

          <p>
            961shop was established to give customers in Lebanon a dependable way
            to purchase technology: genuine products, transparent pricing, and
            responsive customer support at every step of the purchase.
          </p>

          <p>
            We offer a carefully curated selection of laptops, desktops, and
            accessories from the world&apos;s most trusted technology brands —
            chosen for their quality, performance, and reliability. Our products
            are available through our Zefta store and online at{" "}
            <a href="https://961shop.com" className="text-primary underline underline-offset-2">
              961shop.com
            </a>
            , with cash-on-delivery service for added convenience.
          </p>

          <p>
            We invite you to explore our{" "}
            <Link href="/products" className="text-primary underline underline-offset-2">
              full product range
            </Link>
            . Should you have any questions, our team is available by phone,
            WhatsApp, email, or in person at our store.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <Section id="our-store" title="Our Store">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">961shop</p>
                <p className="text-sm text-muted-foreground">{ADDRESS}</p>
              </div>
            </div>
          </Section>

          <Section id="how-to-reach-us" title="How to Reach Us">
            <p>You can reach our team through any of the following channels:</p>
            <div className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-2">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <strong>Sales:</strong>{" "}
                <a href={`tel:${SALES_PHONE_TEL}`} className="text-primary underline underline-offset-2">
                  {SALES_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <strong>Support:</strong>{" "}
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-primary underline underline-offset-2">
                  {SUPPORT_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <strong>WhatsApp:</strong>{" "}
                <a
                  href={`https://wa.me/${SALES_PHONE_TEL.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {SALES_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <strong>Email:</strong>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </Section>

          <Section id="our-policies" title="Our Policies">
            <p>
              For details on how we handle orders, returns, and your data, see our{" "}
              <Link href="/return-policy" className="text-primary underline underline-offset-2">
                Return Policy
              </Link>
              ,{" "}
              <Link href="/terms" className="text-primary underline underline-offset-2">
                Terms and Conditions
              </Link>
              , and{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/contact" className="hover:text-foreground transition-colors underline underline-offset-2">
            Contact Us
          </Link>
          <Link href="/return-policy" className="hover:text-foreground transition-colors underline underline-offset-2">
            Return Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-2">
            Terms and Conditions
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </UnifiedLayout>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-foreground mb-3 border-l-4 border-primary pl-3">
        {title}
      </h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
