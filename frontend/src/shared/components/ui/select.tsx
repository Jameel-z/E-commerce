import React, { useState } from "react";
import clsx from "clsx";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  children: React.ReactElement<SelectTriggerProps | SelectContentProps>[]; // Union of child types
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newValue: string) => {
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        // Narrow down the type of `child`
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
          } as SelectTriggerProps);
        }

        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            value,
            onValueChange: handleSelect,
            isOpen,
          } as SelectContentProps);
        }

        return child; // Return the child as-is if it doesn't match any known type
      })}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  isOpen,
  setIsOpen,
}) => (
  <div
    className={clsx(
      "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
      {
        "ring-2 ring-ring ring-offset-2": isOpen,
      }
    )}
    onClick={() => setIsOpen?.(!isOpen)}
  >
    {children}
  </div>
);

interface SelectContentProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen?: boolean;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 mt-1">
      {children}
    </div>
  );
};

interface SelectValueProps {
  placeholder: string;
  value?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  value,
}) => (
  <span className="text-foreground">
    {value || <span className="text-muted-foreground">{placeholder}</span>}
  </span>
);

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  onValueChange,
}) => (
  <div
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    onClick={() => onValueChange && onValueChange(value)}
  >
    {children}
  </div>
);
