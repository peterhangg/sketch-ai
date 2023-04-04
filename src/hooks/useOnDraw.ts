import React from "react";
import { Point, DrawFunction } from "@/lib/types";

const ROUND = "round";

const drawLine: DrawFunction = ({
  ctx,
  currPoint,
  prevPoint,
  color = "#000000",
  width = 5,
}) => {
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
};

export const useOnDraw = () => {
  const [drawingHistory, setDrawingHistory] = React.useState<Point[][]>([]);
  const [undoHistory, setUndoHistory] = React.useState<Point[][]>([]);
  const [redoHistory, setRedoHistory] = React.useState<Point[][]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const mouseDownRef = React.useRef<boolean>(false);

  const onMouseDown = React.useCallback(() => {
    mouseDownRef.current = true;
    // Add empty array on mousedown when drawing, the empty array is the new 'line' used on handler
    setDrawingHistory([...drawingHistory, []]);
  }, [drawingHistory]);

  const clear = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDrawingHistory([]);
    setUndoHistory([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (drawingHistory.length === 0) return;

    const drawingHistoryCopy = [...drawingHistory];
    const lastLine = drawingHistoryCopy.pop();

    if (!lastLine) return;
    setRedoHistory((history) => [...history, lastLine]);

    // Clear the canvas and redraw the remaining lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistoryCopy.forEach((line) => {
      line.forEach((point, i) => {
        const prevPoint = i > 0 ? line[i - 1] : null;
        drawLine({ ctx, currPoint: point, prevPoint });
      });
    });

    setDrawingHistory(drawingHistoryCopy);
  }, [drawingHistory]);

  const redo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    if (drawingHistory.length === 0 && redoHistory.length === 0) return;
    if (redoHistory.length === 0) return;

    const redoHistoryCopy = [...redoHistory];
    const lastLine = redoHistoryCopy.pop();

    if (!lastLine) return;

    setRedoHistory(redoHistoryCopy);
    setUndoHistory((history) => [...history, lastLine]);
    setDrawingHistory((history) => [...history, lastLine]);

    lastLine.forEach((point, i) => {
      const prevPoint = i > 0 ? lastLine[i - 1] : null;
      drawLine({ ctx, currPoint: point, prevPoint });
    });
  }, [drawingHistory, redoHistory]);

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

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "z" && event.ctrlKey) {
        undo();
      }
      if (event.key === "y" && event.ctrlKey) {
        redo();
      }
    };

    canvas.addEventListener("mousemove", handler);
    window.addEventListener("mouseup", mouseUpHandler);
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      canvas.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [drawingHistory, undo, redo]);

  return {
    canvasRef,
    onMouseDown,
    clear,
    undo,
    redo,
    drawingHistory,
    undoHistory,
    redoHistory,
  };
};
