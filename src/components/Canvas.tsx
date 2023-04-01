import React from "react";
import { useOnDraw } from "@/hooks/useOnDraw";
import { DrawFunction } from "@/lib/types";

const ROUND = "round";

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = ({ width, height }: CanvasProps) => {
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

  const { canvasRef, onMouseDown, clear, undo } = useOnDraw(drawLine);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        className="rounded-md border border-black"
        width={width}
        height={height}
        ref={canvasRef}
        onMouseDown={onMouseDown}
      />
      <button
        className="w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
        onClick={clear}
      >
        Clear
      </button>
      <button
        className="w-[200px] rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
        onClick={undo}
      >
        Undo
      </button>
    </div>
  );
};

export default Canvas;
