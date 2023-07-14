import { Skeleton } from "./ui/Skeleton";

export const GalleryLoader = () => {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="container grid flex-1 grid-cols-1 gap-3 p-2 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
      </div>
    </div>
  );
};
