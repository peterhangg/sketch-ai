import React from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidUrl } from "@/lib/utils";
import { Sketch, User } from "@prisma/client";
import { IconButton } from "@/components/ui/IconButton";
import {
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { useIntersection } from "@/hooks/useIntersection";
import { useDrawStore } from "@/state/drawStore";
import { SOMETHING_WENT_WRONG } from "@/lib/constants";
import { downloadImage } from "@/lib/blob";

interface GalleryPageProps {
  user: User;
  initialSketches: Sketch[];
  hasMore: boolean;
  cursor: string | null;
}

export default function GalleryPage({
  user,
  initialSketches,
  hasMore,
  cursor,
}: GalleryPageProps) {
  const [sketchList, setSketchList] = React.useState<Sketch[]>(initialSketches);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [_error, setError] = React.useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = React.useState<boolean>(hasMore);
  const [nextCursor, setNextCursor] = React.useState<string | null>(cursor);
  const { setSketch, setSrcFromGallery, reset } = useDrawStore(
    (state) => state
  );
  const intersectionRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const sketchesHandler = React.useCallback(async () => {
    if (!nextCursor || loading || !hasMoreData) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/sketches?cursor=${nextCursor}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || SOMETHING_WENT_WRONG);
        displayToast(data?.message || SOMETHING_WENT_WRONG, ToastVariant.ERROR);
        return;
      }

      setSketchList((prev) => [...prev, ...data.sketches]);
      setNextCursor(data.cursor);
      setHasMoreData(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [loading, nextCursor, hasMoreData]);

  const deleteHandler = React.useCallback(
    async (sketchUrl: string) => {
      if (!user || !sketchUrl) return;

      const validateUrl = isValidUrl(sketchUrl);
      if (!validateUrl) return;

      try {
        setError(null);
        const response = await fetch(`/api/upload?sketchUrl=${sketchUrl}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data?.message || SOMETHING_WENT_WRONG);
          displayToast(
            data?.message || SOMETHING_WENT_WRONG,
            ToastVariant.ERROR
          );
          return;
        }

        const updatedSketches = sketchList.filter(
          (sketch) => sketch.url !== sketchUrl
        );
        setSketchList(updatedSketches);

        displayToast("Sketch successfully deleted", ToastVariant.SUCCESS);
      } catch (error) {
        console.error(error);
      }
    },
    [sketchList, user]
  );

  useIntersection({ targetRef: intersectionRef, callback: sketchesHandler });

  const setSketchHandler = React.useCallback(
    (sketchUrl: string) => {
      if (!user || !sketchUrl) return;

      reset();
      setSketch(sketchUrl);
      setSrcFromGallery(true);
      router.push("/");
    },
    [user, router, setSketch, reset, setSrcFromGallery]
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="mt-4 text-2xl font-semibold tracking-tighter">
        Sketch Gallery
      </h1>
      <div className="container my-2 grid flex-1 grid-cols-1 gap-3 p-2 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {sketchList.map((sketch) => (
            <motion.div
              key={sketch.id}
              className="mt-3 flex flex-col p-2"
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
                alt="sketch image"
                src={sketch.url}
                className="max-h-[500px] w-full max-w-[500] rounded-2xl border border-slate-900 shadow-card"
                width={500}
                height={500}
                priority={true}
              />
              <div className="mt-1 flex justify-end p-1">
                <IconButton
                  icon={<PencilIcon />}
                  onClick={() => setSketchHandler(sketch.url)}
                  className="mr-2"
                />
                <IconButton
                  icon={<TrashIcon />}
                  onClick={() => deleteHandler(sketch.url)}
                  className="mr-2"
                />
                <IconButton
                  icon={<ArrowDownTrayIcon />}
                  onClick={() => downloadImage(sketch.url)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={intersectionRef}></div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);
  const userId = session?.user.id;
  const sketches = await prisma.sketch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const hasMore = sketches.length === 6;
  const cursor = hasMore
    ? sketches[sketches.length - 1].createdAt.toISOString()
    : null;
  const formattedSketches = sketches.map((sketch) => ({
    ...sketch,
    createdAt: sketch.createdAt.toISOString(),
  }));

  return {
    props: {
      user: session?.user || null,
      initialSketches: formattedSketches,
      hasMore,
      cursor,
    },
  };
}
