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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backButton.href}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backButton.label}
                </Link>
              </Button>
            )}
            {title && (
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
