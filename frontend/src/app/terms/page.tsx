import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | 961shop",
  description:
    "Read 961shop's Terms and Conditions governing the use of our website, products, orders, payments, shipping, and returns.",
  openGraph: {
    title: "Terms and Conditions | 961shop",
    description:
      "Read 961shop's Terms and Conditions governing the use of our website, products, orders, payments, shipping, and returns.",
    url: "https://961shop.com/terms",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "May 30, 2026";
const SITE_NAME = "961shop";
const SITE_URL = "https://961shop.com";
const CONTACT_EMAIL = "support@invoicepoint.net";
const CONTACT_PHONE = "+961 76 840474";

export default function TermsPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Terms and Conditions",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Terms and Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Please read these Terms and Conditions carefully before using the{" "}
            {SITE_NAME} website located at{" "}
            <a
              href={SITE_URL}
              className="text-primary underline underline-offset-2"
            >
              {SITE_URL}
            </a>
            . By accessing or using our service, you agree to be bound by these
            terms. If you do not agree, please discontinue use immediately.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          {/* 1. Acceptance */}
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By visiting, browsing, or making a purchase on {SITE_NAME}, you
              confirm that you are at least 18 years of age (or the legal age of
              majority in your jurisdiction), have read and understood these
              Terms and Conditions, and agree to be legally bound by them along
              with our{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              We reserve the right to update or modify these Terms at any time.
              Continued use of the website after changes are posted constitutes
              your acceptance of the revised Terms.
            </p>
          </Section>

          {/* 2. About Us */}
          <Section id="about" title="2. About 961shop">
            <p>
              {SITE_NAME} is an online retail store specializing in computers,
              peripherals, and tech gadgets, operating out of Lebanon. Our
              website facilitates the browsing and purchase of products for
              personal and professional use.
            </p>
          </Section>

          {/* 3. Account Registration */}
          <Section id="accounts" title="3. User Accounts">
            <ul>
              <li>
                You may create an account to access features such as order
                tracking, wishlists, and a faster checkout experience.
              </li>
              <li>
                A valid email address is required to register. You will receive a
                verification email and must verify your address before accessing
                all account features.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials and for all activities that occur under your
                account.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                during registration and to update it as necessary.
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that
                violate these Terms, engage in fraudulent activity, or are
                inactive for an extended period.
              </li>
              <li>
                You may not share your account credentials with third parties or
                create multiple accounts to circumvent restrictions.
              </li>
            </ul>
          </Section>

          {/* 4. Products */}
          <Section id="products" title="4. Products and Pricing">
            <ul>
              <li>
                We make every effort to display product descriptions, images,
                and specifications as accurately as possible. However, we do not
                warrant that all product descriptions are error-free.
              </li>
              <li>
                All prices are listed in Lebanese Pounds (LBP) or USD as
                displayed and are subject to change without prior notice.
              </li>
              <li>
                We reserve the right to limit the quantity of any product
                purchased per customer or household.
              </li>
              <li>
                Product availability is not guaranteed. In the event an item
                becomes unavailable after your order is placed, we will notify
                you promptly and offer a refund or alternative.
              </li>
              <li>
                Promotional prices and discounts apply only for the duration
                stated and cannot be applied retroactively.
              </li>
            </ul>
          </Section>

          {/* 5. Orders */}
          <Section id="orders" title="5. Orders and Payment">
            <ul>
              <li>
                Placing an order constitutes an offer to purchase. We reserve
                the right to accept or decline any order at our discretion.
              </li>
              <li>
                Order confirmation is sent via email. A binding contract is
                formed once we confirm the order has been processed and payment
                has been received.
              </li>
              <li>
                We accept payment through methods listed at checkout. All
                transactions are processed securely.
              </li>
              <li>
                You warrant that you are authorized to use the payment method
                provided and that all billing information is accurate.
              </li>
              <li>
                We reserve the right to cancel orders in cases of suspected
                fraud, pricing errors, or stock unavailability, issuing a full
                refund where payment was collected.
              </li>
            </ul>
          </Section>

          {/* 6. Shipping */}
          <Section id="shipping" title="6. Shipping and Delivery">
            <ul>
              <li>
                Delivery times are estimates and are not guaranteed. Delays may
                occur due to circumstances beyond our control including customs,
                weather, or carrier delays.
              </li>
              <li>
                Risk of loss and title for items pass to you upon delivery to
                the carrier.
              </li>
              <li>
                Shipping fees are calculated at checkout and are non-refundable
                unless the item is defective or the order was incorrectly
                fulfilled.
              </li>
              <li>
                We currently deliver within Lebanon. International shipping may
                be available for select products — please contact us for details.
              </li>
              <li>
                If a delivery attempt is unsuccessful due to an incorrect
                address or absence of the recipient, re-delivery fees may apply.
              </li>
            </ul>
          </Section>

          {/* 7. Returns & Refunds */}
          <Section id="returns" title="7. Returns and Refunds">
            <ul>
              <li>
                We accept returns <strong>only</strong> for items that are
                defective, damaged during shipping, or incorrectly fulfilled
                (wrong item received). Returns for change of mind or any other
                reason are not accepted.
              </li>
              <li>
                Defective or incorrect items must be reported within{" "}
                <strong>48 hours</strong> of delivery with photographic evidence
                of the issue.
              </li>
              <li>
                To initiate a return, please contact our support team at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                with your order number, photos of the issue, and a description
                of the defect.
              </li>
              <li>
                Approved refunds will be issued within 5–7 business days
                through the original payment method. Shipping costs are
                non-refundable unless the return is due to our error.
              </li>
              <li>
                Certain products (e.g., opened software, consumables, or items
                marked final sale) are not eligible for return under any
                circumstances.
              </li>
            </ul>
            <p>
              For full details, see our{" "}
              <Link href="/return-policy" className="text-primary underline underline-offset-2">
                Return Policy
              </Link>
              .
            </p>
          </Section>

          {/* 8. Intellectual Property */}
          <Section id="ip" title="8. Intellectual Property">
            <p>
              All content on {SITE_NAME}, including but not limited to text,
              graphics, logos, images, product photographs, and software, is the
              property of {SITE_NAME} or its content suppliers and is protected
              by applicable copyright and trademark laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative
              works from any content without our express written permission. You
              are granted a limited, non-exclusive, non-transferable license
              solely to access and use the website for personal, non-commercial
              purposes.
            </p>
          </Section>

          {/* 9. Prohibited Conduct */}
          <Section id="prohibited" title="9. Prohibited Activities">
            <p>You agree not to:</p>
            <ul>
              <li>
                Use automated tools, bots, scrapers, or scripts to access the
                website without prior written consent.
              </li>
              <li>
                Engage in any fraudulent, abusive, or unlawful activity through
                our platform.
              </li>
              <li>
                Attempt to gain unauthorized access to any portion of the
                website or related systems.
              </li>
              <li>
                Submit false, misleading, or defamatory reviews or user-generated
                content.
              </li>
              <li>
                Violate any applicable local, national, or international laws or
                regulations.
              </li>
              <li>
                Use the website in any manner that could disable, overburden, or
                impair our servers or infrastructure.
              </li>
            </ul>
          </Section>

          {/* 10. Third-Party Links */}
          <Section id="third-party" title="10. Third-Party Links and Services">
            <p>
              Our website may contain links to third-party websites, payment
              processors, or services. These links are provided for convenience
              only. We have no control over, and assume no responsibility for,
              the content, privacy policies, or practices of any third-party
              sites. We encourage you to review the terms and privacy policies of
              any third-party services you visit.
            </p>
          </Section>

          {/* 11. Disclaimer */}
          <Section id="disclaimer" title="11. Disclaimer of Warranties">
            <p>
              The website and its contents are provided on an &quot;as is&quot; and
              &quot;as available&quot; basis without any warranties of any kind, either
              express or implied. To the fullest extent permitted by law,{" "}
              {SITE_NAME} disclaims all warranties including but not limited to
              implied warranties of merchantability, fitness for a particular
              purpose, and non-infringement.
            </p>
            <p>
              We do not warrant that the website will be uninterrupted,
              error-free, or free of viruses or other harmful components.
            </p>
          </Section>

          {/* 12. Limitation of Liability */}
          <Section id="liability" title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, {SITE_NAME} and
              its affiliates, officers, employees, and agents shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of, or inability to use, our website
              or products — even if we have been advised of the possibility of
              such damages.
            </p>
            <p>
              Our total liability for any claim arising out of or relating to
              these Terms shall not exceed the amount paid by you for the
              specific product or service giving rise to the claim.
            </p>
          </Section>

          {/* 13. Indemnification */}
          <Section id="indemnification" title="13. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless {SITE_NAME} and
              its affiliates from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable legal fees) arising out
              of or in any way connected with your access to or use of our
              website, your violation of these Terms, or your violation of any
              rights of another person or entity.
            </p>
          </Section>

          {/* 14. Governing Law */}
          <Section id="governing-law" title="14. Governing Law and Jurisdiction">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the Republic of Lebanon, without regard to its conflict
              of law principles. Any disputes arising under these Terms shall be
              subject to the exclusive jurisdiction of the courts located in
              Lebanon.
            </p>
          </Section>

          {/* 15. Changes */}
          <Section id="changes" title="15. Changes to These Terms">
            <p>
              We reserve the right to modify these Terms at any time. When we
              make changes, we will update the &quot;Last updated&quot; date at the top
              of this page. We encourage you to review these Terms periodically.
              Your continued use of {SITE_NAME} after any modifications constitutes
              your acceptance of the revised Terms.
            </p>
          </Section>

          {/* 16. Contact */}
          <Section id="contact" title="16. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding these
              Terms and Conditions, please contact us:
            </p>
            <div className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-1">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong>Phone:</strong> {CONTACT_PHONE}
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={SITE_URL}
                  className="text-primary underline underline-offset-2"
                >
                  {SITE_URL}
                </a>
              </p>
            </div>
          </Section>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
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
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
