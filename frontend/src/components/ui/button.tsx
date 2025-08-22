import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "px-4 py-2 rounded-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants: Record<string, string> = {
      default: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-purple-600 text-white hover:bg-purple-700",
      outline: "border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800",
      ghost: "hover:bg-gray-100 dark:hover:bg-neutral-800",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
