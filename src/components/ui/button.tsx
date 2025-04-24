
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[15px] text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-premium-yellow text-black hover:shadow-premium-yellow transform hover:-translate-y-1 hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transform hover:-translate-y-1 hover:opacity-90",
        outline: "border border-brand-yellow/50 text-brand-yellow hover:bg-brand-yellow/10 transform hover:-translate-y-1 hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transform hover:-translate-y-1 hover:opacity-90",
        ghost: "hover:bg-accent hover:text-accent-foreground transform hover:-translate-y-1 hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline transform hover:-translate-y-1 hover:opacity-90",
        premium: "bg-gradient-premium-yellow text-black shadow-premium-yellow hover:shadow-premium-highlight transform hover:-translate-y-1 hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[15px] px-3",
        lg: "h-11 rounded-[15px] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
