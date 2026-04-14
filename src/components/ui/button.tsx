import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-bold uppercase tracking-wider transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bauhaus-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-bauhaus-black",
  {
    variants: {
      variant: {
        default: "bg-bauhaus-red text-white shadow-bauhaus hover:bg-bauhaus-red/90",
        secondary: "bg-bauhaus-blue text-white shadow-bauhaus hover:bg-bauhaus-blue/90",
        accent: "bg-bauhaus-yellow text-bauhaus-black shadow-bauhaus hover:bg-bauhaus-yellow/90",
        outline: "bg-white text-bauhaus-black shadow-bauhaus hover:bg-muted",
        ghost: "border-none shadow-none hover:bg-muted",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
      shape: {
        square: "rounded-none",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "square" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
