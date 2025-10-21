"use client";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted/30 to-secondary/10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Shop <span className="text-secondary">Smart</span>,
            <br />
            Live <span className="text-secondary">Better</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover amazing products at unbeatable prices. Your perfect
            shopping experience starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/products">
                <Package className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
