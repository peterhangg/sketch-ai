import React from "react";
import { Point, DrawFunction } from "@/lib/types";

const ROUND = "round";
const BLACK = "#000000";

export const useOnDraw = () => {
  const [undoHistory, setUndoHistory] = React.useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = React.useState<ImageData[]>([]);
  const [color, setColor] = React.useState<string>(BLACK);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const mouseDownRef = React.useRef<boolean>(false);

  const drawLine: DrawFunction = React.useCallback(
    ({ ctx, currPoint, prevPoint, color, width = 5 }) => {
      if (!ctx) return;
      const { x: currX, y: currY } = currPoint;
      let startingPoint = prevPoint ?? currPoint;

      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.strokeStyle = color ?? BLACK;
      ctx.lineCap = ROUND;
      ctx.lineJoin = ROUND;
      ctx.moveTo(startingPoint.x, startingPoint.y);
      ctx.lineTo(currX, currY);
      ctx.stroke();

      // Fill pixelated line
      ctx.fillStyle = color ?? BLACK;
      ctx.beginPath();
      ctx.arc(startingPoint.x, startingPoint.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    },
    []
  );

  const onMouseDown = React.useCallback(() => {
    mouseDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoHistory((prev) => [...prev, imageData]);
    // Clear redo stack on new draw action (user hits undo and draws afterwards)
    setRedoHistory([]);
  }, []);

  const isCanvasEmpty = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    const context = canvas.getContext("2d");
    if (!context) return true;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i++) {
      // Check if pixel completely transparency
      if (imageData.data[i] !== 0) return false;
    }
    return true;
  }, []);

  const clear = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setUndoHistory((prevUndoHistory) => [...prevUndoHistory, currImageData]);
    setRedoHistory([]);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (undoHistory.length === 0) return;

    const currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoHistory((prevRedoHistory) => [...prevRedoHistory, currImageData]);

    const undoHistoryCopy = [...undoHistory];
    const prevImageData = undoHistoryCopy.pop();
    setUndoHistory(undoHistoryCopy);

    if (!prevImageData) return;

    ctx.putImageData(prevImageData, 0, 0);
  }, [undoHistory]);

  const redo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (redoHistory.length === 0) return;

    const currentImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setUndoHistory((prevUndoHistory) => [...prevUndoHistory, currentImageData]);

    const redoHistoryCopy = [...redoHistory];
    const prevImageData = redoHistoryCopy.pop();

    if (!prevImageData) return;

    setRedoHistory(redoHistoryCopy);
    ctx.putImageData(prevImageData, 0, 0);
  }, [redoHistory]);

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

      const drawObj = {
        ctx,
        currPoint,
        prevPoint: prevPoint.current,
        color,
      };
      drawLine(drawObj);
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
  }, [color, drawLine, undo, redo]);

  return {
    canvasRef,
    onMouseDown,
    setColor,
    undo,
    redo,
    clear,
    color,
    undoHistory,
    redoHistory,
    isCanvasEmpty,
  };
};
