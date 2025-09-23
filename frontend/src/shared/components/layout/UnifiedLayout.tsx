import { ReactNode } from "react";
import { GlobalHeader, PageHeader, type PageHeaderProps } from "./";

interface UnifiedLayoutProps {
  children: ReactNode;
  pageHeaderProps?: PageHeaderProps;
  className?: string;
}

export function UnifiedLayout({
  children,
  pageHeaderProps,
  className = "",
}: UnifiedLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <GlobalHeader />
      {pageHeaderProps && <PageHeader {...pageHeaderProps} />}
      <main>{children}</main>
    </div>
  );
}
