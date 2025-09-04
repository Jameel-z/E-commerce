// src/components/ui/input.tsx
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

export default Input;
