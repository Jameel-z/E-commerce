/**
 * Skeleton Component
 * Loading placeholder component
 */

import React from "react";
import { cn } from "@/shared/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export default Skeleton;
