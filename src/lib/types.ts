export type Point = { x: number; y: number };

export type Draw = {
  ctx: CanvasRenderingContext2D;
  currPoint: Point;
  prevPoint: Point | null;
  color?: string;
  width?: number;
};
