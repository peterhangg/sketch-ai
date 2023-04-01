import React from "react";
import { Point, DrawFunction } from "@/lib/types";

export const useOnDraw = (onDraw: DrawFunction) => {
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
  const [drawingHistory, setDrawingHistory] = React.useState<Point[][]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const handlerRef = React.useRef<((event: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = React.useRef<(() => void) | null>(null);

  const onMouseDown = React.useCallback(() => {
    setMouseDown(true);
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
      const copyDrawingHistory = [...history];

      copyDrawingHistory.pop();

      const canvas = canvasRef.current;
      if (!canvas) return copyDrawingHistory;

      const ctx = canvas.getContext("2d");
      if (!ctx) return copyDrawingHistory;

      // Clear the canvas and redraw the remaining lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      copyDrawingHistory.forEach((line) => {
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

      return copyDrawingHistory;
    });
  }, [drawingHistory]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = (event: MouseEvent) => {
      if (!mouseDown) return;
      const currPoint = computePointInCanvas(event);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !currPoint) return;

      const currentLine = drawingHistory[drawingHistory.length - 1];
      currentLine.push(currPoint);

      const draw = { ctx, currPoint, prevPoint: prevPoint.current };

      onDraw(draw);
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
      setMouseDown(false);
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
  }, [mouseDown, onDraw, drawingHistory]);

  return { canvasRef, onMouseDown, clear, undo };
};
