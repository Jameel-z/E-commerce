"use client";

import React from "react";
import clsx from "clsx";

interface SeparatorProps {
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ className = "" }) => {
  return <div className={clsx("border-t border-gray-300 my-4", className)} />;
};

export default Separator;
