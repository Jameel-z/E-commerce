import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy | 961shop",
  description: "961shop accepts returns only for defective, damaged, or incorrect items reported within 48 hours of delivery, with free collection and a replacement or full refund.",
  openGraph: {
    title: "Return Policy | 961shop",
    description: "961shop accepts returns only for defective, damaged, or incorrect items reported within 48 hours of delivery, with free collection and a replacement or full refund.",
    url: "https://961shop.com/return-policy",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/return-policy",
  },
};

const LAST_UPDATED = "November 19, 2026";
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

          <Section id="eligibility" title="1. What We Accept">
            <p>
              We accept returns <strong>only</strong> for items that arrive defective, damaged,
              or different from what you ordered:
            </p>
            <ul>
              <li>The item is defective or does not work as described.</li>
              <li>The item was damaged during delivery.</li>
              <li>You received the wrong item.</li>
            </ul>
            <p>
              We do <strong>not</strong> accept returns or exchanges for change of mind or for
              items that work as described.
            </p>
          </Section>

          <Section id="how-to-return" title="2. How to Report a Problem">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                Contact us within <strong>48 hours</strong> of delivery via WhatsApp at{" "}
                <a href={`https://wa.me/${WHATSAPP.replace(/\s+/g, "")}`} className="text-primary underline underline-offset-2">
                  {WHATSAPP}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
                .
              </li>
              <li>Include your order number and photos of the problem.</li>
              <li>We will confirm and arrange collection of the item.</li>
            </ol>
          </Section>

          <Section id="refunds" title="3. Replacement or Refund">
            <ul>
              <li>We collect the item from you <strong>free of charge</strong>.</li>
              <li>
                Once we receive and check it, we send you a replacement or give you a{" "}
                <strong>full refund</strong>.
              </li>
              <li>Refunds are processed within <strong>5–7 business days</strong>.</li>
            </ul>
          </Section>

          <Section id="contact" title="4. Contact Us">
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
