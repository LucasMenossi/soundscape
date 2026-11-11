import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MainContentProps = Omit<ComponentProps<"main">, "id" | "tabIndex"> & {
  children: ReactNode;
};

/** Shared semantic main landmark and skip-link target for every route. */
export function MainContent({
  children,
  className,
  ...props
}: MainContentProps) {
  return (
    <main id="main-content" tabIndex={-1} className={cn(className)} {...props}>
      {children}
    </main>
  );
}
