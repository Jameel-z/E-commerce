import type React from "react";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, Poppins } from "next/font/google";
import { AuthProvider, CartProvider, WishlistProvider } from "@/shared/components";
import { CartSidebarProvider, WishlistSidebarProvider } from "@/features/cart/components";
import { MainContentWrapper } from "@/shared/components/layout/MainContentWrapper";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import "./globals.css";
import { CartSidebarRenderer, WishlistSidebarRenderer } from "@/shared/components/layout";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "961shop.com",
  description: "961shop.com - Your online shopping destination",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.jpg", type: "image/jpeg" },
    ],
    apple: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${poppins.variable} antialiased light`}
    >
      <body className="font-sans overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            <WishlistSidebarProvider>
              <CartSidebarProvider>
                <CartProvider>
                  <WishlistProvider>
                    <MainContentWrapper>{children}</MainContentWrapper>
                    <CartSidebarRenderer />
                    <WishlistSidebarRenderer />
                    <WhatsAppButton />
                  </WishlistProvider>
                </CartProvider>
              </CartSidebarProvider>
            </WishlistSidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
