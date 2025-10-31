import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withPattern?: boolean }
>(({ className, withPattern = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shadcn-card relative overflow-hidden rounded-xl border bg-card border-card-border text-card-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5",
      className
    )}
    {...props}
  >
    {withPattern && (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M-50,80 Q150,60 350,80 T750,80" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M-50,120 Q200,100 400,120 T850,120" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M-100,40 Q100,20 300,40 T700,40" stroke="url(#lineGradient)" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M50,160 Q250,140 450,160 T900,160" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M-80,200 Q120,180 320,200 T720,200" stroke="url(#lineGradient)" strokeWidth="1.5" fill="none" opacity="0.3" />
        </svg>
      </div>
    )}
    {props.children}
  </div>
));
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10 flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-10 p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10 flex items-center p-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
