// filepath: d:\Projects\WORK\ecommerce\frontend\src\shared\components\layout\Footer.tsx
import React from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { siFacebook, siX, siInstagram, siWhatsapp } from "simple-icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Hamdan Computers</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted source for computers and tech gadgets. Quality
              products at competitive prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
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
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="flex space-x-4 mb-4">
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
                href="https://wa.me/96103751903?text=Hi%20Hamdan%20Computers,%20I%20have%20a%20question%20about%20your%20products."
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
              <p>Email: hamdancomputers@gmail.com</p>
              <p>Phone: +961 03751903</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Hamdan Computers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
