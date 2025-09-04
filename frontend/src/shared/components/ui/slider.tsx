"use client";

import React from "react";

interface SliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}) => {
  const handleChange = (index: number, newValue: number) => {
    const updatedValue = [...value] as [number, number];
    updatedValue[index] = Math.min(Math.max(newValue, min), max); // Clamp the value between min and max
    if (updatedValue[0] > updatedValue[1]) {
      updatedValue[index === 0 ? 1 : 0] = updatedValue[index]; // Ensure min <= max
    }
    onValueChange(updatedValue);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => handleChange(0, Number(e.target.value))}
        className="w-full"
        aria-label="Minimum value"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        onChange={(e) => handleChange(1, Number(e.target.value))}
        className="w-full"
        aria-label="Maximum value"
      />
    </div>
  );
};

export default Slider;
