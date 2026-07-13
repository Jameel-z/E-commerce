import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy | 961shop",
  description: "Learn about 961shop's return and refund policy. We accept returns for defective or incorrect items.",
  openGraph: {
    title: "Return Policy | 961shop",
    description: "Learn about 961shop's return and refund policy.",
    url: "https://961shop.com/return-policy",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/return-policy",
  },
};

const LAST_UPDATED = "May 30, 2026";
const SITE_NAME = "961shop";
const SITE_URL = "https://961shop.com";
const CONTACT_EMAIL = "support@961shop.com";
const CONTACT_PHONE = "+961 76 840474";
const WHATSAPP = "+961 76 840474";

export default function ReturnPolicyPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Return Policy",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Return & Refund Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            At {SITE_NAME}, we want you to be completely satisfied with your purchase.
            If you are not happy with your order, we are here to help.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <Section id="eligibility" title="1. Return Eligibility">
            <p>
              We accept returns <strong>only</strong> in the following cases:
            </p>
            <ul>
              <li>The item received is defective or not functioning as described.</li>
              <li>The item was damaged during shipping or delivery.</li>
              <li>You received the wrong item (different from what you ordered).</li>
            </ul>
            <p>
              Returns are <strong>not accepted</strong> for change of mind, incorrect size selection,
              or any reason other than a product defect or fulfillment error.
            </p>
            <p>The following items are additionally <strong>not eligible</strong> for return:</p>
            <ul>
              <li>Items marked as "Final Sale" or "Non-Returnable" on the product page.</li>
              <li>Perishable goods, digital products, or downloadable items.</li>
              <li>Items that have been used, damaged, or altered by the customer after delivery.</li>
            </ul>
          </Section>

          <Section id="defective" title="2. Defective or Damaged Items">
            <p>
              If you receive a defective, damaged, or incorrect item, please contact us within
              <strong> 48 hours</strong> of delivery. We will arrange a free return and send you
              a replacement or issue a full refund at no cost to you.
            </p>
            <p>Please include photos of the damage when contacting us.</p>
          </Section>

          <Section id="how-to-return" title="3. How to Start a Return">
            <p>To initiate a return:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                Contact us via WhatsApp at{" "}
                <a href={`https://wa.me/${WHATSAPP.replace(/\s+/g, "")}`} className="text-primary underline underline-offset-2">
                  {WHATSAPP}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>Provide your order number and reason for return.</li>
              <li>We will confirm eligibility and provide return instructions within <strong>24 hours</strong>.</li>
              <li>Ship the item back using the provided instructions.</li>
            </ol>
          </Section>

          <Section id="refunds" title="4. Refunds">
            <p>Once we receive and inspect your returned item:</p>
            <ul>
              <li>We will notify you of the approval or rejection of your refund.</li>
              <li>If approved, your refund will be processed within <strong>5–7 business days</strong>.</li>
              <li>Refunds are issued to the original payment method used at checkout.</li>
            </ul>
            <p>
              <strong>Shipping costs</strong> are non-refundable unless the return is due to our error
              (wrong item, defective product).
            </p>
          </Section>

          <Section id="exchanges" title="5. Exchanges">
            <p>
              We offer exchanges for items of the same value. If you need a different size, color,
              or variant, contact us and we will arrange an exchange subject to availability.
            </p>
          </Section>

          <Section id="contact" title="6. Contact Us">
            <p>For any return or refund questions, reach us through:</p>
            <div className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-1">
              <p><strong>WhatsApp:</strong>{" "}
                <a href={`https://wa.me/${WHATSAPP.replace(/\s+/g, "")}`} className="text-primary underline underline-offset-2">
                  {WHATSAPP}
                </a>
              </p>
              <p><strong>Email:</strong>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p><strong>Phone:</strong> {CONTACT_PHONE}</p>
              <p><strong>Website:</strong>{" "}
                <a href={SITE_URL} className="text-primary underline underline-offset-2">
                  {SITE_URL}
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* Footer Nav */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-2">
            Terms and Conditions
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">
            Privacy Policy
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
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
