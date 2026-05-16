import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { AuthProvider, CartProvider, WishlistProvider } from "@/shared/components";
import { CartSidebarProvider } from "@/features/cart/components";
import { MainContentWrapper } from "@/shared/components/layout/MainContentWrapper";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import "./globals.css";
import { CartSidebarRenderer } from "@/shared/components/layout";
import { WhatsAppButton } from "@/shared/components/ui/WhatsAppButton";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Ecom - Modern E-Commerce Platform",
  description:
    "A sophisticated e-commerce platform with role-based access control",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased light`}
    >
      <body className="font-sans overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            <CartSidebarProvider>
              <CartProvider>
                <WishlistProvider>
                  <MainContentWrapper>{children}</MainContentWrapper>
                  <CartSidebarRenderer />
                  <WhatsAppButton />
                </WishlistProvider>
              </CartProvider>
            </CartSidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
