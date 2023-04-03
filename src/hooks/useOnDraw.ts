import React from "react";
import { Point, DrawFunction } from "@/lib/types";

const ROUND = "round";

export const useOnDraw = () => {
  const [drawingHistory, setDrawingHistory] = React.useState<Point[][]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const mouseDownRef = React.useRef<boolean>(false);
  const handlerRef = React.useRef<((event: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = React.useRef<(() => void) | null>(null);

  const onMouseDown = React.useCallback(() => {
    mouseDownRef.current = true;
    // Add empty array on mousedown when drawing, the empty array is the new 'line' used on handler
    setDrawingHistory([...drawingHistory, []]);
  }, [drawingHistory]);

  const drawLine: DrawFunction = React.useCallback(
    ({ ctx, currPoint, prevPoint, color = "#000000", width = 5 }) => {
      if (!ctx) return;

      const { x: currX, y: currY } = currPoint;
      let startingPoint = prevPoint ?? currPoint;

      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineCap = ROUND;
      ctx.lineJoin = ROUND;
      ctx.moveTo(startingPoint.x, startingPoint.y);
      ctx.lineTo(currX, currY);
      ctx.stroke();

      // Fill pixelated line
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(startingPoint.x, startingPoint.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    },
    []
  );

  const clear = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDrawingHistory([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (drawingHistory.length === 0) return;

    const drawingHistoryCopy = [...drawingHistory];
    drawingHistoryCopy.pop();

    // Clear the canvas and redraw the remaining lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistoryCopy.forEach((line) => {
      line.forEach((point, i) => {
        const prevPoint = i > 0 ? line[i - 1] : null;
        drawLine({ ctx, currPoint: point, prevPoint });
      });
    });

    setDrawingHistory(drawingHistoryCopy);
  }, [drawingHistory, drawLine]);

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

      drawLine(draw);
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
  }, [drawLine, drawingHistory]);

  return { canvasRef, onMouseDown, clear, undo };
};
