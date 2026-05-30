import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | 961shop",
  description:
    "Get in touch with 961shop. Reach us by phone, WhatsApp, or email for support, orders, or inquiries.",
  openGraph: {
    title: "Contact Us | 961shop",
    description:
      "Get in touch with 961shop. Reach us by phone, WhatsApp, or email.",
    url: "https://961shop.com/contact",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/contact",
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
const CONTACT_EMAIL = "support@invoicepoint.net";

export default function ContactPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Contact Us",
      }}
    >
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Contact Us
          </h1>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            We&apos;re here to help. Reach out to us through any of the
            channels below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="space-y-4">
          {/* Sales Department */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                Sales Department
              </p>
              <p className="text-sm font-semibold text-foreground">{SALES_PHONE}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`tel:${SALES_PHONE_TEL}`}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Call"
              >
                <Phone className="h-4 w-4 text-primary" />
              </a>
              <a
                href={`https://wa.me/${SALES_PHONE_TEL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
              </a>
            </div>
          </div>

          {/* Technical Support */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                Technical Support
              </p>
              <p className="text-sm font-semibold text-foreground">{SUPPORT_PHONE}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Call"
              >
                <Phone className="h-4 w-4 text-primary" />
              </a>
              <a
                href={`https://wa.me/${SUPPORT_PHONE_TEL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
              </a>
            </div>
          </div>

          {/* Email */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                Email
              </p>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </p>
            </div>
          </a>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link
            href="/return-policy"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Return Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
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
