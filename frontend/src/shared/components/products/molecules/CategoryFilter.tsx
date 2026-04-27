"use client";

import React, { useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Category } from "@/shared/types";

interface CategoryFilterProps {
  tree: Category[];
  selected: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

export function CategoryFilter({
  tree,
  selected,
  onChange,
  className,
}: CategoryFilterProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isSelected = (name: string) => selected.includes(name);

  const toggleParent = (cat: Category) => {
    const names = [cat.name, ...cat.children.map((c) => c.name)];
    const allSelected = names.every((n) => selected.includes(n));
    if (allSelected) {
      onChange(selected.filter((s) => !names.includes(s)));
    } else {
      const merged = Array.from(new Set([...selected, ...names]));
      onChange(merged);
    }
  };

  const toggleChild = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const parentPartiallySelected = (cat: Category) => {
    if (cat.children.length === 0) return false;
    const childNames = cat.children.map((c) => c.name);
    const anyChild = childNames.some((n) => selected.includes(n));
    const allChildren = childNames.every((n) => selected.includes(n));
    return anyChild && !allChildren;
  };

  return (
    <div className={cn("space-y-1", className)}>
      {tree.map((cat) => {
        const hasChildren = cat.children.length > 0;
        const isExpanded = expandedIds.has(cat.id);
        const parentSelected = isSelected(cat.name);
        const partial = parentPartiallySelected(cat);

        return (
          <div key={cat.id}>
            {/* Parent row */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleParent(cat)}
                className={cn(
                  "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                  parentSelected || partial
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                    parentSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : partial
                      ? "bg-primary/30 border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {parentSelected && <Check className="h-2.5 w-2.5" />}
                  {partial && !parentSelected && <span className="w-2 h-2 bg-primary rounded-sm" />}
                </span>
                {cat.name}
                {hasChildren && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {cat.children.length}
                  </span>
                )}
              </button>

              {hasChildren && (
                <button
                  onClick={() => toggle(cat.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  aria-label="Expand subcategories"
                >
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-150",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>
              )}
            </div>

            {/* Children */}
            {isExpanded && hasChildren && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                {cat.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => toggleChild(child.name)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                      isSelected(child.name)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                        isSelected(child.name)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected(child.name) && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
