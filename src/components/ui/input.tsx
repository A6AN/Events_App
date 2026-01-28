import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/40 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50",
        "hover:bg-black/30 hover:border-white/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
