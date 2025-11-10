import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon"; // ← Added "icon"
  asChild?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  asChild,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClasses = {
    sm: "h-9 rounded-md px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-11 rounded-md px-8",
    icon: "h-9 w-9 p-0", // ← Added icon size (square button)
  };

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<any>;
    return React.cloneElement(child, {
      className: clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
        child.props.className // preserve child's existing className
      ),
      ...props,
    });
  }

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button }; // Named export
export default Button; // Default export
