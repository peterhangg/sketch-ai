import React from "react";
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
    drawingHistory,
    redoHistory,
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
      <div className="flex">
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={clear}
          disabled={!drawingHistory.length}
        >
          Clear
        </button>
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={undo}
          disabled={!drawingHistory.length}
        >
          Undo
        </button>
        <button
          className="mx-2 w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={redo}
          disabled={
            (!redoHistory.length && !drawingHistory.length) ||
            !redoHistory.length
          }
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default Canvas;
