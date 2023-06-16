import React from "react";
import { Point } from "@/lib/types";
import { BLACK } from "@/lib/constants";
import { draw, isCanvasEmpty } from "@/lib/draw";

export const useOnDraw = () => {
  const [undoHistory, setUndoHistory] = React.useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = React.useState<ImageData[]>([]);
  const [color, setColor] = React.useState<string>(BLACK);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPoint = React.useRef<Point | null>(null);
  const mouseDownRef = React.useRef<boolean>(false);

  const onMouseDown = React.useCallback(() => {
    mouseDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoHistory((prev) => [...prev, imageData]);
    // Clear redo stack on new draw action (ex: user hits undo and draws afterwards)
    setRedoHistory([]);
  }, []);

  const clear = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const validateEmptyCanvas = isCanvasEmpty(canvas);
    if (validateEmptyCanvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setUndoHistory((prevUndoHistory) => [...prevUndoHistory, currImageData]);
    setRedoHistory([]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
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

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
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

    const handler = (event: MouseEvent): void => {
      if (!mouseDownRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const currPoint = computePointOnCanvas(event);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx || !currPoint) return;

      draw({ ctx, currPoint, prevPoint: prevPoint.current, color });
      prevPoint.current = currPoint;
    };

    const computePointOnCanvas = (event: MouseEvent): Point | undefined => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      return { x, y };
    };

    const mouseUpHandler = (): void => {
      mouseDownRef.current = false;
      prevPoint.current = null;
    };

    const handleKeyPress = (event: KeyboardEvent): void => {
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
  }, [color, undo, redo]);

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
  };
};
