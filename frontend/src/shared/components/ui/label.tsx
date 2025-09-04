"use client";

import React from "react";

type LabelProps = {
  htmlFor?: string; // Made optional for flexibility
  children: React.ReactNode;
  className?: string;
};

const Label: React.FC<LabelProps> = ({ htmlFor, children, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

export default Label;
