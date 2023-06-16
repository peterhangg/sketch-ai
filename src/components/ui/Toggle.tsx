import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  showAiModel: boolean;
  setShowAiModel: React.ChangeEventHandler<HTMLInputElement>;
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export function Toggle({
  showAiModel,
  setShowAiModel,
  className,
}: ToggleProps) {
  return (
    <div className={cn("mt-1 flex items-center p-2", className)}>
      <span
        className={cn(
          "ml-3 mr-2 text-sm font-semibold",
          showAiModel ? "text-gray-400" : "text-gray-900"
        )}
      >
        Sketches
      </span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          id="toggle"
          type="checkbox"
          className="peer sr-only"
          checked={showAiModel}
          onChange={setShowAiModel}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-gray-200"></div>
      </label>
      <span
        className={cn(
          "ml-3 mr-2 text-sm font-semibold",
          showAiModel ? "text-gray-900" : "text-gray-400"
        )}
      >
        AI Images
      </span>
    </div>
  );
}
