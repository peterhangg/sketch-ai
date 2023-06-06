import { BLACK, WHITE } from "@/lib/constants";
import React from "react";
import { IconButton } from "./ui/IconButton";
// import { PaintBrushIcon } from "@heroicons/react/24/solid";
import useColorPickerStore from "@/state/colorPickerStore";

interface ColorPickerProps {
  setColor: (color: string) => void;
  color: string;
}

const colorPalette = [
  "#000000",
  "#808080",
  "#964B00",
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
  "#8B00FF",
  "#aa00aa",
  "#ffffff",
];

export const ColorPicker = ({ setColor, color }: ColorPickerProps) => {
  const { isOpen, toggleOpen, onClose } = useColorPickerStore((state) => state);

  const handleColorSelected = (newColor: string) => {
    onClose();
    setColor(newColor);
  };

  return (
    <div className="relative p-2">
      <IconButton
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
            style={{
              color: color === WHITE ? BLACK : color,
              fill: color,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
            />
          </svg>
        }
      />
      {isOpen && (
        <div className="absolute z-10 my-2 flex w-32 flex-wrap rounded-md bg-slate-50 py-1 shadow-xl">
          {colorPalette.map((color, index) => (
            <div
              key={`${color}-${index}`}
              className="m-1 h-6 w-6 cursor-pointer rounded-full border shadow-md"
              style={{
                backgroundColor: color,
              }}
              onClick={() => handleColorSelected(color)}
            ></div>
          ))}
        </div>
      )}
      <button
        className="absolute left-0 top-0 h-full w-full cursor-pointer"
        onClick={toggleOpen}
      ></button>
    </div>
  );
};
