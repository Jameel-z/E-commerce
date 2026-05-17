"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/utils";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
  className?: string;
}

const FALLBACK_MAX = 10000;

export function PriceRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  className,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(String(currentMin));
  const [localMax, setLocalMax] = useState(String(currentMax));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalMin(String(currentMin)); }, [currentMin]);
  useEffect(() => { setLocalMax(String(currentMax)); }, [currentMax]);

  const effectiveMax = max > 0 ? max : FALLBACK_MAX;

  const scheduleApply = (rawMin: string, rawMax: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const numMin = rawMin === "" || isNaN(Number(rawMin)) ? 0 : Math.max(0, Number(rawMin));
      const numMax = rawMax === "" || Number(rawMax) <= 0 || isNaN(Number(rawMax))
        ? effectiveMax
        : Number(rawMax);
      const safeMax = Math.max(numMin + 1, numMax);
      onChange(numMin, safeMax);
    }, 600);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMin(e.target.value);
    scheduleApply(e.target.value, localMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMax(e.target.value);
    scheduleApply(localMin, e.target.value);
  };

  // Restore display value on blur if field was left empty
  const handleMaxBlur = () => {
    if (localMax === "" || Number(localMax) <= 0) {
      setLocalMax(String(effectiveMax));
    }
  };

  const handleMinBlur = () => {
    if (localMin === "") {
      setLocalMin("0");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-7 flex-shrink-0">Min</span>
        <input
          type="number"
          value={localMin}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          className="flex-1 h-7 text-xs border rounded px-2 bg-background w-full focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-7 flex-shrink-0">Max</span>
        <input
          type="number"
          value={localMax}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          className="flex-1 h-7 text-xs border rounded px-2 bg-background w-full focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
