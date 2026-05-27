// src/components/ui/input.tsx
import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

export default Input;
