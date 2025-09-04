// src/components/ui/card.tsx
import React from "react";
import clsx from "clsx";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`border rounded shadow p-4 ${className}`}>{children}</div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => <div className={`p-4 border-b ${className}`}>{children}</div>;

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <div className="text-gray-700">{children}</div>
);

type CardDescriptionProps = {
  children: React.ReactNode;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
}) => <p className="text-sm text-gray-500">{children}</p>;

interface CardTitleProps {
  children: React.ReactNode;
  className?: string; // Add className as an optional prop
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
}) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => <div className={clsx("border-t pt-4 mt-4", className)}>{children}</div>;
