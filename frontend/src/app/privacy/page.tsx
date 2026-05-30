import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | 961shop",
  description:
    "Learn how 961shop collects, uses, and protects your personal information when you use our website and services.",
  openGraph: {
    title: "Privacy Policy | 961shop",
    description:
      "Learn how 961shop collects, uses, and protects your personal information when you use our website and services.",
    url: "https://961shop.com/privacy",
    siteName: "961shop",
    type: "website",
  },
  alternates: {
    canonical: "https://961shop.com/privacy",
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

export default function PrivacyPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Privacy Policy",
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            At {SITE_NAME}, your privacy is important to us. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit{" "}
            <a
              href={SITE_URL}
              className="text-primary underline underline-offset-2"
            >
              {SITE_URL}
            </a>
            . Please read it carefully. By using our website, you consent to the
            practices described in this policy.
          </p>
        </div>

        {/* Quick Navigation */}
        <nav className="mb-8 p-4 bg-muted rounded-lg text-sm">
          <p className="font-semibold text-foreground mb-2">Contents</p>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground columns-1 sm:columns-2">
            {[
              ["#information-collected", "Information We Collect"],
              ["#how-we-use", "How We Use Your Information"],
              ["#sharing", "How We Share Information"],
              ["#cookies", "Cookies and Tracking Technologies"],
              ["#data-security", "Data Security"],
              ["#data-retention", "Data Retention"],
              ["#your-rights", "Your Rights and Choices"],
              ["#children", "Children's Privacy"],
              ["#third-party", "Third-Party Links"],
              ["#international", "International Users"],
              ["#changes", "Changes to This Policy"],
              ["#contact", "Contact Us"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          {/* 1. Information Collected */}
          <Section id="information-collected" title="1. Information We Collect">
            <p>
              We collect different types of information depending on how you
              interact with our website:
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">
              a) Information You Provide Directly
            </h3>
            <ul>
              <li>
                <strong>Account Information:</strong> Name, email address,
                password (hashed), and phone number when you register.
              </li>
              <li>
                <strong>Order Information:</strong> Billing and shipping
                address, payment details (processed securely — we do not store
                full card numbers), and order history.
              </li>
              <li>
                <strong>Communications:</strong> Messages, inquiries, or
                feedback you submit through our contact channels.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">
              b) Information Collected Automatically
            </h3>
            <ul>
              <li>
                <strong>Usage Data:</strong> Pages visited, time spent on pages,
                links clicked, search queries, and browsing behavior within the
                site.
              </li>
              <li>
                <strong>Device and Log Data:</strong> IP address, browser type
                and version, operating system, referring URL, and device
                identifiers.
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> Session data,
                preferences, and analytics identifiers. See Section 4 for
                details.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">
              c) Information from Third Parties
            </h3>
            <ul>
              <li>
                Payment processors may share transaction status and fraud
                signals with us.
              </li>
              <li>
                If you use social login features, we may receive basic profile
                information (name, email) from the third-party provider, subject
                to their privacy policies.
              </li>
            </ul>
          </Section>

          {/* 2. How We Use */}
          <Section id="how-we-use" title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders and send related updates.</li>
              <li>Create and manage your account.</li>
              <li>
                Communicate with you about orders, support requests, and
                promotional offers (with your consent where required).
              </li>
              <li>
                Improve our website, product offerings, and customer experience
                through analytics.
              </li>
              <li>
                Detect, prevent, and address fraud, security incidents, and
                technical issues.
              </li>
              <li>Comply with legal obligations and enforce our Terms.</li>
              <li>
                Send transactional emails such as order confirmations, shipping
                notifications, password resets, and account verification emails.
              </li>
            </ul>

            <p className="mt-2">
              <strong>Legal Bases for Processing (GDPR):</strong> We process
              your data on the basis of contract performance (order fulfillment),
              legitimate interests (fraud prevention, analytics), your consent
              (marketing emails), and legal obligations.
            </p>
          </Section>

          {/* 3. Sharing */}
          <Section id="sharing" title="3. How We Share Your Information">
            <p>
              We do not sell your personal information. We may share it only in
              the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> Trusted third-party vendors
                who assist with order fulfillment, payment processing, email
                delivery, and analytics — bound by confidentiality agreements.
              </li>
              <li>
                <strong>Delivery Partners:</strong> Your name, address, and
                phone number are shared with our logistics partners solely to
                complete your delivery.
              </li>
              <li>
                <strong>Payment Processors:</strong> Payment information is
                transmitted directly to our payment processors using
                industry-standard encryption. We do not store full payment card
                details on our servers.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information
                when required by law, subpoena, court order, or governmental
                authority.
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger,
                acquisition, or asset sale, your data may be transferred as part
                of the transaction with notice provided to you.
              </li>
              <li>
                <strong>With Your Consent:</strong> In any other circumstance,
                only with your explicit permission.
              </li>
            </ul>
          </Section>

          {/* 4. Cookies */}
          <Section
            id="cookies"
            title="4. Cookies and Tracking Technologies"
          >
            <p>We use the following types of cookies and similar technologies:</p>
            <ul>
              <li>
                <strong>Essential Cookies:</strong> Required for core
                functionality such as user authentication, shopping cart
                persistence, and checkout. These cannot be disabled.
              </li>
              <li>
                <strong>Performance / Analytics Cookies:</strong> Help us
                understand how visitors interact with our site (e.g., page
                views, bounce rate). Data is aggregated and anonymized.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings such
                as language, theme, and recently viewed products.
              </li>
            </ul>
            <p>
              We also use the following Google services which may collect data
              independently under Google's privacy policy:
            </p>
            <ul>
              <li>
                <strong>Google Search Console:</strong> Used to monitor website
                performance in Google Search. Google may collect anonymized
                search and click data.
              </li>
              <li>
                <strong>Google Merchant Center:</strong> A public product feed
                (listing product names, prices, images, and availability) is
                shared with Google to enable product listings in Google Search
                and Shopping.
              </li>
            </ul>
            <p>
              You can manage or disable non-essential cookies through your
              browser settings. Note that disabling certain cookies may affect
              website functionality.
            </p>
          </Section>

          {/* 5. Security */}
          <Section id="data-security" title="5. Data Security">
            <p>
              We implement industry-standard technical and organizational
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These include:
            </p>
            <ul>
              <li>HTTPS/TLS encryption for all data in transit.</li>
              <li>Hashed storage of passwords (bcrypt or equivalent).</li>
              <li>
                Access controls limiting who within our organization can access
                personal data.
              </li>
              <li>Regular security reviews and vulnerability assessments.</li>
            </ul>
            <p>
              Despite these measures, no method of transmission over the
              internet is 100% secure. In the event of a data breach that
              affects your rights, we will notify you as required by applicable
              law.
            </p>
          </Section>

          {/* 6. Retention */}
          <Section id="data-retention" title="6. Data Retention">
            <p>
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this policy, unless a longer
              retention period is required or permitted by law:
            </p>
            <ul>
              <li>
                <strong>Account data:</strong> Retained for the duration of your
                account and up to 2 years after account deletion, for fraud
                prevention and legal compliance.
              </li>
              <li>
                <strong>Order records:</strong> Retained for 7 years to comply
                with accounting and tax obligations.
              </li>
              <li>
                <strong>Analytics data:</strong> Aggregated and anonymized after
                26 months.
              </li>
              <li>
                <strong>Marketing preferences:</strong> Retained until you opt
                out or request deletion.
              </li>
            </ul>
          </Section>

          {/* 7. Your Rights */}
          <Section id="your-rights" title="7. Your Rights and Choices">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you.
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate
                or incomplete data.
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data
                where there is no legitimate reason for us to continue processing
                it.
              </li>
              <li>
                <strong>Restriction:</strong> Request that we limit how we
                process your data in certain circumstances.
              </li>
              <li>
                <strong>Portability:</strong> Receive a copy of your data in a
                structured, machine-readable format.
              </li>
              <li>
                <strong>Objection:</strong> Object to processing based on
                legitimate interests or for direct marketing purposes.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Where processing is based on
                consent, you may withdraw it at any time without affecting the
                lawfulness of prior processing.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days. You may also unsubscribe from
              marketing emails by clicking the &quot;Unsubscribe&quot; link in any
              marketing email.
            </p>
          </Section>

          {/* 8. Children */}
          <Section id="children" title="8. Children's Privacy">
            <p>
              Our website is not directed to children under the age of 13. We do
              not knowingly collect personal information from children. If you
              are a parent or guardian and believe your child has provided us
              with personal data, please contact us and we will promptly delete
              such information.
            </p>
          </Section>

          {/* 9. Third-Party Links */}
          <Section id="third-party" title="9. Third-Party Links">
            <p>
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices or content of those sites.
              We encourage you to review the privacy policies of any
              third-party websites you visit through links on our platform.
            </p>
          </Section>

          {/* 10. International */}
          <Section id="international" title="10. International Users">
            <p>
              {SITE_NAME} is operated from Lebanon. If you are accessing our
              website from outside Lebanon, be aware that your information may
              be transferred to, stored, and processed in Lebanon or other
              countries where our servers or service providers are located. By
              using our website, you consent to such transfers in accordance
              with this Privacy Policy.
            </p>
          </Section>

          {/* 11. Changes */}
          <Section id="changes" title="11. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. When we make
              material changes, we will update the &quot;Last updated&quot; date at the
              top of this page. We encourage you to review this policy
              periodically. Continued use of our website after changes are
              posted constitutes your acceptance of the updated policy.
            </p>
          </Section>

          {/* 12. Contact */}
          <Section id="contact" title="12. Contact Us">
            <p>
              If you have any questions, requests, or concerns about this
              Privacy Policy or our data practices, please contact us:
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
