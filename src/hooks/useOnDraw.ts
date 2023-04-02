import React from "react";
import { Point, DrawFunction } from "@/lib/types";

export const useOnDraw = (onDraw: DrawFunction) => {
  const [drawingHistory, setDrawingHistory] = React.useState<Point[][]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const mouseDownRef = React.useRef<boolean>(false);
  const handlerRef = React.useRef<((event: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = React.useRef<(() => void) | null>(null);

  const onMouseDown = React.useCallback(() => {
    mouseDownRef.current = true;
    setDrawingHistory([...drawingHistory, []]);
  }, [drawingHistory]);

  const clear = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDrawingHistory([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = React.useCallback(() => {
    if (!drawingHistory.length) return;

    setDrawingHistory((history) => {
      const drawingHistoryCopy = [...history];

      drawingHistoryCopy.pop();

      const canvas = canvasRef.current;
      if (!canvas) return drawingHistoryCopy;

      const ctx = canvas.getContext("2d");
      if (!ctx) return drawingHistoryCopy;

      // Clear the canvas and redraw the remaining lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingHistoryCopy.forEach((line) => {
        ctx.beginPath();
        line.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      });

      return drawingHistoryCopy;
    });
  }, [drawingHistory]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = (event: MouseEvent) => {
      if (!mouseDownRef.current) return;
      const currPoint = computePointInCanvas(event);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx || !currPoint) return;

      const currentLine = [...drawingHistory[drawingHistory.length - 1]];
      currentLine.push(currPoint);

      const draw = { ctx, currPoint, prevPoint: prevPoint.current };

      onDraw(draw);
      prevPoint.current = currPoint;

      setDrawingHistory((history) => [
        ...history.slice(0, history.length - 1),
        currentLine,
      ]);
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
      mouseDownRef.current = false;
      prevPoint.current = null;
    };

    handlerRef.current = handler;
    mouseUpHandlerRef.current = mouseUpHandler;

    canvas.addEventListener("mousemove", handlerRef.current);
    window.addEventListener("mouseup", mouseUpHandlerRef.current);

    // Remove event listeners
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
  }, [onDraw, drawingHistory]);

  return { canvasRef, onMouseDown, clear, undo };
};
