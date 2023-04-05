import React from "react";

interface ColorPickerProps {
  setColor: (color: string) => void;
  color: string;
}
const colorPlatte = [
  "#000000",
  "#808080",
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
  "#4B0082",
  "#8B00FF",
  "#FFFFFF",
];

const ColorPicker = ({ setColor, color }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleColorSelected = (newColor: string) => {
    setIsOpen(false);
    setColor(newColor);
  };

  return (
    <div className="relative">
      <div
        className="h-8 w-8 cursor-pointer rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      {isOpen && (
        <div className="absolute z-10 my-2 flex w-32 flex-wrap rounded-md bg-slate-100 py-1 shadow-xl">
          {colorPlatte.map((color, i) => (
            <div
              key={i}
              className="m-1 h-6 w-6 cursor-pointer rounded-full"
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

export default ColorPicker;
