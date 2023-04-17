import React from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { CanvasButton } from "./CanvasButton";
import { ColorPicker } from "./ColorPicker";
import { useOnDraw } from "@/hooks/useOnDraw";
import { useDrawStore } from "@/state/store";

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

export function Canvas() {
  const store = useDrawStore((state) => state);
  const { setSketch } = store;

  const {
    canvasRef,
    onMouseDown,
    undo,
    redo,
    clear,
    color,
    setColor,
    undoHistory,
    redoHistory,
    isCanvasEmpty,
  } = useOnDraw();

  const downloadHandler = (
    chartRef: React.MutableRefObject<HTMLCanvasElement | null>
  ) => {
    if (!chartRef.current) return;

    const newCanvas = document.createElement("canvas");
    newCanvas.width = chartRef.current.width;
    newCanvas.height = chartRef.current.height;

    const ctx = newCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    // Draw the original canvas on the new canvas
    ctx.drawImage(chartRef.current, 0, 0);

    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("download", "sketch.png");

    const imageUrl = newCanvas.toDataURL("image/png");
    setSketch(imageUrl);
    downloadLink.setAttribute("href", imageUrl);
    downloadLink.click();
  };

  const handleCanvasChange = async () => {
    if (!canvasRef.current) return;
    const imageUrl = await canvasRef.current.toDataURL("image/png");
    setSketch(imageUrl);
  };

  const [canvasSize, setCanvasSize] = React.useState({
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasParent = canvas.parentElement;

        if (canvasParent) {
          const { width, height } = canvasParent.getBoundingClientRect();
          const resizeHeight = height > MAX_HEIGHT ? MAX_HEIGHT : height;
          const resizeWidth = width > MAX_WIDTH ? MAX_WIDTH : width;

          canvas.width = resizeWidth;
          canvas.height = resizeHeight;
          setCanvasSize({
            width: resizeWidth,
            height: resizeHeight,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef]);

  return (
    <div className="flex max-w-[700px] flex-col items-center">
      <div className="flex w-full items-center justify-center p-2">
        <canvas
          className="rounded-md border border-black"
          width={canvasSize.width}
          height={canvasSize.height}
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseUp={handleCanvasChange}
        />
      </div>
      <div className="flex w-full items-center justify-between px-2 pb-2">
        <ColorPicker setColor={setColor} color={color} />
        <div>
          <CanvasButton
            className="mx-2"
            icon={<ArrowUturnLeftIcon />}
            onClick={undo}
            disabled={!undoHistory.length}
          />
          <CanvasButton
            icon={<ArrowUturnRightIcon />}
            onClick={redo}
            disabled={
              (!redoHistory.length && !undoHistory.length) ||
              !redoHistory.length
            }
          />
          <CanvasButton
            className="mx-2"
            icon={<TrashIcon />}
            onClick={clear}
            disabled={isCanvasEmpty() || !undoHistory.length}
          />
          <CanvasButton
            icon={<ArrowDownTrayIcon />}
            onClick={() => downloadHandler(canvasRef)}
          />
        </div>
      </div>
    </div>
  );
}
