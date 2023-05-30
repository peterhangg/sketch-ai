import React from "react";

type TailWindSize = "" | "sm" | "md" | "lg" | "xl" | "2xl";

interface WindowSize {
  width: number;
  height: number;
  tailwindSize?: TailWindSize;
}

function getTailwindSize(width: number): TailWindSize {
  if (width < 640) return "sm";
  if (width < 768) return "md";
  if (width < 1024) return "lg";
  if (width < 1280) return "xl";
  return "2xl";
}

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState<WindowSize>({
    width: 0,
    height: 0,
    tailwindSize: "",
  });

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        tailwindSize: getTailwindSize(window.innerWidth),
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};
