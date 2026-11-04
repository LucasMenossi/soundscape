import { cn } from "@/lib/utils";
function Alert({ className, ...props }: React.ComponentProps<"div">) { return <div role="alert" data-slot="alert" className={cn("relative w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm", className)} {...props} />; }
export { Alert };
