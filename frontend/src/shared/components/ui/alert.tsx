"use client";

import React from "react";
import clsx from "clsx";

interface AlertProps {
  variant?: "default" | "destructive"; // Add more variants as needed
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  className = "",
  children,
}) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border-gray-300",
    destructive: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div
      className={clsx(
        "border rounded-md p-4 flex items-start space-x-3",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  className = "",
  children,
}) => {
  return <p className={clsx("text-sm", className)}>{children}</p>;
};

export default Alert;
