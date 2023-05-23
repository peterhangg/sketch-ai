import { Draw } from "./types";
import { BLACK, ROUND } from "./constants";

export function isCanvasEmpty(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return true;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i++) {
    // Check if pixel completely transparency
    if (imageData.data[i] !== 0) return false;
  }
  return true;
}

export function draw({ ctx, currPoint, prevPoint, color, width = 5 }: Draw) {
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
}
