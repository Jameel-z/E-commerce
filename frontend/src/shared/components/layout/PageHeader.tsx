"use client";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export interface PageHeaderProps {
  title?: string;
  backButton?: {
    label: string;
    href: string;
  };
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backButton,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`border-b bg-card/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backButton && (
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
                <Link href={backButton.href}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  {backButton.label}
                </Link>
              </Button>
            )}
            {title && (
              <h1 className="text-base font-semibold text-foreground">{title}</h1>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
