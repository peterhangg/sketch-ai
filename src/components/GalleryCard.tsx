import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { AiImage, Sketch } from "@prisma/client";
import { IconButton } from "./ui/IconButton";
import { cn } from "@/lib/utils";
import { downloadImage } from "@/lib/blob";
import { SKETCH } from "@/lib/constants";

interface GalleryCardProps {
  image: Sketch | AiImage;
  imageModel: string;
  setImageHandler: (url: string) => void;
  deleteHandler: (url: string) => void;
}

export function GalleryCard({
  image,
  setImageHandler,
  deleteHandler,
  imageModel,
}: GalleryCardProps) {
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  return (
    <motion.div
      key={image.id}
      className={cn("mt-3 flex flex-col p-2", isDeleting && "animate-fade-out")}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0, y: 0 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Image
        alt="image"
        src={image.url}
        className="max-h-[500px] w-full max-w-[500] rounded-2xl border border-slate-900 shadow-card"
        width={500}
        height={500}
        priority={true}
      />
      <div className="mt-1 flex justify-end p-1">
        {imageModel === SKETCH && (
          <IconButton
            icon={<PencilIcon />}
            onClick={() => setImageHandler(image.url)}
            className="mr-2"
          />
        )}
        <IconButton
          icon={<TrashIcon />}
          onClick={() => {
            setIsDeleting(true);
            deleteHandler(image.url);
          }}
          className="mr-2"
        />
        <IconButton
          icon={<ArrowDownTrayIcon />}
          onClick={() => downloadImage(image.url)}
        />
      </div>
    </motion.div>
  );
}

export default GalleryCard;
