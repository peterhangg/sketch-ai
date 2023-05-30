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

export function Canvas() {
  const {
    sketch,
    setSketch,
    setSketchBlob,
    srcFromGallery,
    setSrcFromGallery,
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

    if (sketch && srcFromGallery) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = sketch;

      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setBlobFromSrc();
      };
      setSrcFromGallery(false);
      setSaved(true);
    }
  }, [
    canvasRef,
    sketch,
    srcFromGallery,
    setSrcFromGallery,
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

  return (
    <div>
      <canvas
        className="h-full w-full rounded-md border border-black"
        width={700}
        height={800}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleCanvasChange}
      />
      <div className="flex flex-1 items-center justify-between pb-2">
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
