import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";
import { CONTACT } from "@/shared/constants/config";

const DESCRIPTION =
  "961shop delivers free of charge to all regions of Lebanon. Orders are processed within 0–1 business days and delivered within 1–3 business days.";

export const metadata: Metadata = {
  title: "Shipping Policy | 961shop",
  description: DESCRIPTION,
  openGraph: {
    title: "Shipping Policy | 961shop",
    description: DESCRIPTION,
    url: "https://961shop.com/shipping-policy",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/shipping-policy",
  },
};

// Must match the shipping settings in Merchant Center and the product
// schema in shared/utils/schema.ts (handling 0–1 days, transit 1–3 days, free).
const LAST_UPDATED = "November 23, 2026";
const SITE_NAME = "961shop";
const SITE_URL = "https://961shop.com";
const WHATSAPP_LINK = `https://wa.me/${CONTACT.phone.tel.replace("+", "")}`;

export default function ShippingPolicyPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Shipping Policy",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            This page explains where {SITE_NAME} delivers, how long delivery
            takes, and what it costs.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <SummaryItem label="Delivery coverage" value="All regions of Lebanon" />
          <SummaryItem label="Shipping cost" value="Free on all orders" />
          <SummaryItem label="Order processing" value="0–1 business days" />
          <SummaryItem label="Delivery time" value="1–3 business days" />
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <Section id="coverage" title="1. Delivery Coverage">
            <ul>
              <li>
                We deliver to <strong>all regions of Lebanon</strong>, in every
                governorate.
              </li>
              <li>We do not ship outside Lebanon.</li>
            </ul>
          </Section>

          <Section id="processing" title="2. Order Processing Time">
            <ul>
              <li>
                Orders are processed and prepared for delivery within{" "}
                <strong>0–1 business days</strong> of being placed.
              </li>
              <li>
                We may contact you by phone or WhatsApp to confirm your order
                and delivery address before it is sent.
              </li>
            </ul>
          </Section>

          <Section id="delivery-time" title="3. Delivery Time">
            <ul>
              <li>
                After your order is sent, delivery takes{" "}
                <strong>1–3 business days</strong> across Lebanon.
              </li>
              <li>
                In total, most orders arrive within{" "}
                <strong>1–4 business days</strong> of being placed.
              </li>
              <li>
                Delivery times are estimates. Rare delays can happen because of
                weather, road conditions, or other events outside our control.
                If your order is delayed, we will contact you.
              </li>
            </ul>
          </Section>

          <Section id="cost" title="4. Shipping Cost">
            <ul>
              <li>
                Delivery is <strong>free of charge on all orders</strong>, with
                no minimum order amount.
              </li>
              <li>
                There are no extra delivery fees. The price you see at checkout
                is the total you pay.
              </li>
            </ul>
          </Section>

          <Section id="payment" title="5. Payment on Delivery">
            <p>
              You pay in cash when your order is delivered to you.
            </p>
          </Section>

          <Section id="missed-delivery" title="6. Missed Deliveries">
            <p>
              If we cannot reach you or deliver your order on the first
              attempt, we will contact you to arrange another delivery time,
              free of charge.
            </p>
          </Section>

          <Section id="damaged" title="7. Damaged or Incorrect Items">
            <p>
              If your order arrives damaged or you receive the wrong item,
              contact us within 48 hours of delivery. See our{" "}
              <Link href="/return-policy" className="text-primary underline underline-offset-2">
                Return Policy
              </Link>{" "}
              for details.
            </p>
          </Section>

          <Section id="contact" title="8. Contact Us">
            <p>For any shipping or delivery questions, reach us through:</p>
            <div className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-1">
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a href={WHATSAPP_LINK} className="text-primary underline underline-offset-2">
                  {CONTACT.phone.display}
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${CONTACT.email}`} className="text-primary underline underline-offset-2">
                  {CONTACT.email}
                </a>
              </p>
              <p>
                <strong>Phone:</strong> {CONTACT.phone.display}
              </p>
              <p>
                <strong>Address:</strong> {CONTACT.address.line1},{" "}
                {CONTACT.address.line2}
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a href={SITE_URL} className="text-primary underline underline-offset-2">
                  {SITE_URL}
                </a>
              </p>
            </div>
          </Section>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
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
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
