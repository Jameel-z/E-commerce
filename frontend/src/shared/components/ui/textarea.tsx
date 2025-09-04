"use client";

import React from "react";
import clsx from "clsx";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = "",
  ...props
}) => {
  return (
    <textarea
      className={clsx(
        "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;
