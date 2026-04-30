"use client";

import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  icon,
  children,
  className = "",
}: AuthCardProps) {
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-3 pt-4">
          {icon && (
            <div className="bg-primary/10 w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-2 [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </div>
          )}
          <CardTitle className="text-lg">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}