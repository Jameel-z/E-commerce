"use client";

import { Button } from "@/shared/components/ui/button";
import { CartIcon } from "@/features/cart/components/cart-icon";
import { useCartSidebar, useWishlistSidebar } from "@/features/cart/components";
import { useAuth } from "@/shared/hooks/use-auth";
import Link from "next/link";
import {
  ShoppingBag,
  User,
  Shield,
  X,
  Package,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { SecondaryNav } from "./SecondaryNav";
import { useWishlist } from "@/shared/hooks/use-wishlist";

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = "" }: GlobalHeaderProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openSidebar } = useCartSidebar();
  const { openSidebar: openWishlistSidebar } = useWishlistSidebar();
  const { count: wishlistCount } = useWishlist();

  return (
    <header
      className={`border-b bg-background sticky top-0 z-50 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Brand Section - Left */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-card p-2 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span style={{ color: "#4285F4" }}>9</span>
                <span style={{ color: "#EA4335" }}>6</span>
                <span style={{ color: "#FBBC05" }}>1</span>
                <span className="text-foreground">shop</span>
              </h1>
            </Link>
          </div>

          {/* Navigation Section - Right */}
          <nav className="flex items-center gap-4">
            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden lg:flex items-center gap-4">
              {/* <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {!mounted ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button> */}
              <button onClick={openWishlistSidebar} className="relative p-2 hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <CartIcon onClick={openSidebar} />
              {user ? (
                <>
                  {!user.is_admin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/orders">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Welcome, {user.name || user.email}
                  </span>
                  {user.is_admin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile Navigation - Visible on Mobile Only */}
            <div className="lg:hidden flex items-center gap-2">
              {/* <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {!mounted ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button> */}
              <CartIcon onClick={openSidebar} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <SecondaryNav />

      {/* Mobile Menu Panel - Slides in from right */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-12 right-0 w-64 bg-card border-l border-b shadow-xl z-50 lg:hidden rounded-bl-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="divide-y">
              {user ? (
                <>
                  <div className="px-4 py-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  </div>
                  {user.is_admin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Admin Panel
                    </Link>
                  )}
                  {!user.is_admin && (
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      My Orders
                    </Link>
                  )}
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
