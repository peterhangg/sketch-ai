import React from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpOnSquareStackIcon,
} from "@heroicons/react/24/solid";
import { IconButton } from "./ui/IconButton";
import { ColorPicker } from "./ColorPicker";
import { useOnDraw } from "@/hooks/useOnDraw";
import { useDrawStore } from "@/store/drawStore";
import { useSaveStore } from "@/store/saveStore";
import { createBlob, createDownload } from "@/lib/blob";
import { WHITE } from "@/lib/constants";

export function Canvas() {
  const {
    sketch,
    setSketch,
    setSketchBlob,
    srcFromGallery,
    setSrcFromGallery,
  } = useDrawStore((state) => state);
  const { setSaveSketch, setSaveAiImage } = useSaveStore((state) => state);

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

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
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
      setSaveSketch(true);
      setSaveAiImage(false);
    }
  }, [
    canvasRef,
    sketch,
    srcFromGallery,
    setSrcFromGallery,
    setSketchBlob,
    setSaveSketch,
    setSaveAiImage,
  ]);

  const handleMouseDown = React.useCallback(() => {
    onMouseDown();
  }, [onMouseDown]);

  const downloadHandler = React.useCallback(async () => {
    if (!canvasRef.current) return;

    const newCanvas = document.createElement("canvas");
    newCanvas.width = canvasRef.current.width;
    newCanvas.height = canvasRef.current.height;

    const ctx = newCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvasRef.current, 0, 0);

    const blob = await createBlob(newCanvas);
    if (!blob) return;

    const blobUrl = URL.createObjectURL(blob);
    createDownload(blobUrl);
    URL.revokeObjectURL(blobUrl);
  }, [canvasRef]);

  const handleCanvasChange = React.useCallback(async () => {
    if (!canvasRef.current) return;

    const blob = await createBlob(canvasRef.current);
    if (!blob) return;
    setSketchBlob(blob);

    const blobUrl = URL.createObjectURL(blob);
    setSketch(blobUrl);
    setSaveSketch(false);
  }, [canvasRef, setSketch, setSketchBlob, setSaveSketch]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      clear();
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL(file.type);
        setSketch(dataURL);
      };
    };
  };

  return (
    <div>
      <canvas
        className="h-full w-full rounded-md border border-black"
        width={625}
        height={725}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleCanvasChange}
      />
      <div className="flex flex-1 items-center justify-between pb-2">
        <ColorPicker setColor={setColor} color={color} />
        <div>
          <IconButton
            className="mr-2"
            icon={<ArrowUturnLeftIcon />}
            onClick={undo}
            disabled={!undoHistory.length}
          />
          <IconButton
            className="mr-2"
            icon={<ArrowUturnRightIcon />}
            onClick={redo}
            disabled={
              (!redoHistory.length && !undoHistory.length) ||
              !redoHistory.length
            }
          />
          <IconButton className="mr-2" icon={<TrashIcon />} onClick={clear} />
          <IconButton
            className="mr-2"
            icon={<ArrowUpOnSquareStackIcon />}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.click();
              }
            }}
          />
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            ref={inputRef}
          />
          <IconButton icon={<ArrowDownTrayIcon />} onClick={downloadHandler} />
        </div>
      </div>
    </div>
  );
}
