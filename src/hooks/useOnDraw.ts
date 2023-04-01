import React from "react";
import { DrawFunction, Point } from "@/lib/types";

export const useOnDraw = (onDraw: DrawFunction) => {
  const mouseDown = React.useRef<boolean>(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const handlerRef = React.useRef<((event: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = React.useRef<(() => void) | null>(null);

  const onMouseDown = () => {
    mouseDown.current = true;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = (event: MouseEvent) => {
      if (!mouseDown.current) return;
      const currPoint = computePointInCanvas(event);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !currPoint) return;

      onDraw({ ctx, currPoint, prevPoint: prevPoint.current });
      prevPoint.current = currPoint;
    };

    const computePointInCanvas = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      return { x, y };
    };

    const mouseUpHandler = () => {
      mouseDown.current = false;
      prevPoint.current = null;
    };

    handlerRef.current = handler;
    mouseUpHandlerRef.current = mouseUpHandler;

    canvas.addEventListener("mousemove", handlerRef.current);
    window.addEventListener("mouseup", mouseUpHandlerRef.current);

    return () => {
      canvas.removeEventListener(
        "mousemove",
        handlerRef.current as EventListener
      );
      window.removeEventListener(
        "mouseup",
        mouseUpHandlerRef.current as EventListener
      );
    };
  }, [onDraw]);

  return { canvasRef, onMouseDown, clear };
};
