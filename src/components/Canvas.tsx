import React from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { IconButton } from "./IconButton";
import { ColorPicker } from "./ColorPicker";
import { useOnDraw } from "@/hooks/useOnDraw";
import { useDrawStore } from "@/state/drawStore";
import useColorPickerStore from "@/state/colorPickerStore";
import { createBlob, createDownload } from "@/lib/blob";
import { WHITE } from "@/lib/constants";

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

export function Canvas() {
  const {
    sketch,
    setSketch,
    setSketchBlob,
    srcFromGallary,
    setSrcFromGallary,
    setSaved,
  } = useDrawStore((state) => state);

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
  } = useOnDraw();

  const colorPickerStore = useColorPickerStore((state) => state);
  const { onClose } = colorPickerStore;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const setBlobFromSrc = async () => {
      const blob = await createBlob(canvas);
      if (!blob) return;
      setSketchBlob(blob);
    };

    if (sketch && srcFromGallary) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = sketch;

      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setBlobFromSrc();
      };
      setSrcFromGallary(false);
      setSaved(true);
    }
  }, [
    canvasRef,
    sketch,
    srcFromGallary,
    setSrcFromGallary,
    setSketchBlob,
    setSaved,
  ]);

  const handleMouseDown = React.useCallback(() => {
    onClose();
    onMouseDown();
  }, [onClose, onMouseDown]);

  const downloadHandler = React.useCallback(
    async (chartRef: React.MutableRefObject<HTMLCanvasElement | null>) => {
      if (!chartRef.current) return;

      const newCanvas = document.createElement("canvas");
      newCanvas.width = chartRef.current.width;
      newCanvas.height = chartRef.current.height;

      const ctx = newCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      // Draw the original canvas on the new canvas
      ctx.drawImage(chartRef.current, 0, 0);

      const blob = await createBlob(newCanvas);
      if (!blob) return;

      const blobUrl = URL.createObjectURL(blob);
      createDownload(blobUrl);
      URL.revokeObjectURL(blobUrl);
    },
    []
  );

  const handleCanvasChange = React.useCallback(async () => {
    if (!canvasRef.current) return;

    const blob = await createBlob(canvasRef.current);
    if (!blob) return;
    setSketchBlob(blob);

    const blobUrl = URL.createObjectURL(blob);
    setSketch(blobUrl);
    setSaved(false);
  }, [canvasRef, setSketch, setSketchBlob, setSaved]);

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
          onMouseDown={handleMouseDown}
          onMouseUp={handleCanvasChange}
        />
      </div>
      <div className="flex w-full items-center justify-between px-2 pb-2">
        <ColorPicker setColor={setColor} color={color} />
        <div>
          <IconButton
            className="mx-2"
            icon={<ArrowUturnLeftIcon />}
            onClick={undo}
            disabled={!undoHistory.length}
          />
          <IconButton
            icon={<ArrowUturnRightIcon />}
            onClick={redo}
            disabled={
              (!redoHistory.length && !undoHistory.length) ||
              !redoHistory.length
            }
          />
          <IconButton
            className="mx-2"
            icon={<TrashIcon />}
            onClick={clear}
            disabled={!undoHistory.length}
          />
          <IconButton
            icon={<ArrowDownTrayIcon />}
            onClick={() => downloadHandler(canvasRef)}
          />
        </div>
      </div>
    </div>
  );
}
