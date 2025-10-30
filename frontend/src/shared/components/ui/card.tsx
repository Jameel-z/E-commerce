// src/components/ui/card.tsx
import React from "react";
import clsx from "clsx";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={clsx(
      "border rounded shadow p-4 bg-card text-card-foreground",
      className
    )}
  >
    {children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => (
  <div className={clsx("p-4 border-b bg-card text-card-foreground", className)}>
    {children}
  </div>
);

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => <div className={clsx("text-card-foreground", className)}>{children}</div>;

type CardDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = "",
}) => (
  <p className={clsx("text-sm text-muted-foreground", className)}>{children}</p>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
}) => (
  <h3 className={clsx("text-xl font-semibold text-card-foreground", className)}>
    {children}
  </h3>
);

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => (
  <div className={clsx("border-t pt-4 mt-4 text-card-foreground", className)}>
    {children}
  </div>
);
