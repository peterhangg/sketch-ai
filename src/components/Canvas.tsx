import React from "react";
import ColorPicker from "./ColorPicker";
import { useOnDraw } from "@/hooks/useOnDraw";

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = ({ width, height }: CanvasProps) => {
  const {
    canvasRef,
    onMouseDown,
    clear,
    undo,
    redo,
    color,
    setColor,
    undoHistory,
    redoHistory,
    isCanvasEmpty,
  } = useOnDraw();

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        className="rounded-md border border-black"
        width={width}
        height={height}
        ref={canvasRef}
        onMouseDown={onMouseDown}
      />
      <div className="flex items-center bg-slate-100 p-6">
        <ColorPicker setColor={setColor} color={color} />
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={clear}
          disabled={isCanvasEmpty() || !undoHistory.length}
        >
          Clear
        </button>
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={undo}
          disabled={!undoHistory.length}
        >
          Undo
        </button>
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={redo}
          disabled={
            (!redoHistory.length && !undoHistory.length) || !redoHistory.length
          }
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default Canvas;
