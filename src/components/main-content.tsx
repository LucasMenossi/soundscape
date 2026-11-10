import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MainContentProps = {
  children: ReactNode;
  className?: string;
};

/** Shared semantic main landmark and skip-link target for every route. */
export function MainContent({ children, className }: MainContentProps) {
  return (
    <main id="main-content" tabIndex={-1} className={cn(className)}>
      {children}
    </main>
  );
}
