// filepath: d:\Projects\WORK\ecommerce\frontend\src\shared\components\layout\Footer.tsx
import React from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { siFacebook, siX, siInstagram, siWhatsapp } from "simple-icons";
import { CONTACT } from "@/shared/constants/config";

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-base font-bold tracking-tight">
                <span style={{ color: "#4285F4" }}>9</span>
                <span style={{ color: "#EA4335" }}>6</span>
                <span style={{ color: "#FBBC05" }}>1</span>
                <span className="text-foreground">shop</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted source for computers and tech gadgets. Quality
              products at competitive prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold mb-2">Contact Us</h4>
            <div className="flex space-x-4 mb-2">
              <a
                href="https://www.instagram.com/hamdancomputers/"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  dangerouslySetInnerHTML={{ __html: siInstagram.svg }}
                />
              </a>
              <a
                href={`https://wa.me/${CONTACT.phone.tel.replace("+", "")}?text=Hi%20961shop,%20I%20have%20a%20question%20about%20your%20products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  dangerouslySetInnerHTML={{ __html: siWhatsapp.svg }}
                />
              </a>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Email: {CONTACT.email}</p>
              <p>Phone: {CONTACT.phone.display}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-5 pt-3 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#4285F4" }}>9</span>
            <span style={{ color: "#EA4335" }}>6</span>
            <span style={{ color: "#FBBC05" }}>1</span>
            <span>shop</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
