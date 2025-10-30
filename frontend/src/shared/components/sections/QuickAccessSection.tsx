"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Link from "next/link";
import { ShoppingBag, User, Package, History } from "lucide-react";
import { useCartSidebar } from "@/features/cart/components"; // Add this import
// import user type from features/auth/types;
import { type User as ApiUser } from "@/features/auth/types";

interface QuickAccessSectionProps {
  user: ApiUser | null;
}

export function QuickAccessSection({ user }: QuickAccessSectionProps) {
  const { openSidebar } = useCartSidebar(); // Add this hook

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-foreground mb-4">
          Quick Access
        </h3>
        <p className="text-muted-foreground">
          Everything you need, just a click away
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>Discover our amazing collection</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/products">Explore Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Updated Shopping Cart Card */}
        <Card className="hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>Review your selected items</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={openSidebar} // Changed from Link to onClick
            >
              View Cart
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>
              {user ? "Manage your profile" : "Join our community"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <Button
                className="w-full bg-transparent"
                variant="outline"
                asChild
              >
                <Link href="/profile">My Profile</Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
