"use client";

import { Button } from "@/shared/components/ui/button";
import { CartIcon } from "@/features/cart/components/cart-icon";
import Link from "next/link";
import { ShoppingBag, User, Shield } from "lucide-react";
import { User as ApiUser } from "@/lib/api";
import { getDisplayName } from "@/shared/utils/utils"; // Import from utils

interface HeaderProps {
  user: ApiUser | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-secondary p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Ecom</h1>
          </div>

          <nav className="flex items-center gap-4">
            <CartIcon />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {getDisplayName(user)}
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
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
