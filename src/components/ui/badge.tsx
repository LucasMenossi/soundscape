import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide", { variants: { variant: { default: "border-primary/20 bg-primary/10 text-primary", secondary: "border-border bg-secondary text-secondary-foreground", outline: "border-border text-muted-foreground" } }, defaultVariants: { variant: "secondary" } });
function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) { return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />; }
export { Badge, badgeVariants };
