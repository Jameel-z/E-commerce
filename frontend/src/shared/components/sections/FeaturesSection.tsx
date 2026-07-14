"use client";

import { Star, Truck, CreditCard } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cash on Delivery</h3>
            <p className="text-muted-foreground">
              Pay when you receive your order
            </p>
          </div>
          <div className="text-center">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Payment</h3>
            <p className="text-muted-foreground">
              Simple cash payment on delivery
            </p>
          </div>
          <div className="text-center">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Top Quality</h3>
            <p className="text-muted-foreground">
              Premium products, guaranteed quality
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
