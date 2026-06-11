import type React from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk, DM_Sans, Poppins } from "next/font/google";
import { getOrganizationSchema, getWebSiteSchema } from "@/shared/utils/schema";
import { AuthProvider, CartProvider, WishlistProvider } from "@/shared/components";
import { CartSidebarProvider, WishlistSidebarProvider } from "@/features/cart/components";
import { MainContentWrapper } from "@/shared/components/layout/MainContentWrapper";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { ToastProvider } from "@/shared/components/providers/ToastProvider";
import { Toaster } from "@/shared/components/ui/Toaster";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
  title: "961shop.com | Laptops, Computers, Networking & CCTV in Lebanon",
  description: "Shop laptops, computers, gaming monitors, MikroTik routers, WiFi, CCTV cameras and accessories in Lebanon. Fast delivery across Lebanon.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.jpg", type: "image/jpeg" },
    ],
    apple: "/icon.jpg",
  },
  verification: {
    google: "b9odbP8KYnXuwfl_IRExZzP0fCZP_5eY09qNAMtgoD8",
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
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18196374318"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18196374318');
          `}}
        />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1017206711056933');
            fbq('track', 'PageView');
          `}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }}
        />
        <ThemeProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <ToastProvider>
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
            <Toaster />
          </ToastProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
