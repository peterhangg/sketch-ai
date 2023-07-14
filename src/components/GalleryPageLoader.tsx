import { Skeleton } from "./ui/Skeleton";

export const GalleryPageLoader = () => {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="container mt-2 grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3">
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
