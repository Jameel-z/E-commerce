"use client";

import React from "react";
import clsx from "clsx";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  className = "",
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked);
  };

  return (
    <div className={clsx("flex items-center", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Checkbox;
