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
    <div className={`max-w-md mx-auto mt-8 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          {icon && (
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              {icon}
            </div>
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}