import React from "react";
import { useOnDraw } from "@/hooks/useOnDraw";
import { DrawFunction } from "@/lib/types";

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = ({ width, height }: CanvasProps) => {
  const drawLine: DrawFunction = React.useCallback(
    ({ ctx, currPoint, prevPoint }) => {
      const { x: currX, y: currY } = currPoint;
      const lineColor = "#000000";
      const lineWidth = 5;

      let startingPoint = prevPoint ?? currPoint;
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = lineColor;
      ctx.moveTo(startingPoint.x, startingPoint.y);
      ctx.lineTo(currX, currY);
      ctx.stroke();

      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(startingPoint.x, startingPoint.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    },
    []
  );

  const { canvasRef, onMouseDown, clear } = useOnDraw(drawLine);

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
    </div>
  );
};

export default Canvas;
