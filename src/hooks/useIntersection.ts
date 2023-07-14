import React from "react";

interface UseIntersectionProps {
  targetRef: React.RefObject<HTMLElement>;
  callback: (...args: any[]) => any;
  executeOnce?: boolean;
  options?: IntersectionObserverInit;
}

const initialOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px",
  threshold: 1,
};

export const useIntersection = ({
  targetRef,
  callback,
  executeOnce = false,
  options = initialOptions,
}: UseIntersectionProps) => {
  const observer = React.useRef<IntersectionObserver | null>(null);
  const intersected = React.useRef<boolean>(false);

  React.useEffect(() => {
    const intersectionHandler = ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        callback();

        if (!intersected.current && observer.current && executeOnce) {
          observer.current.disconnect();
          observer.current = null;
          intersected.current = true;
        }
      }
    };

    if (!intersected.current && targetRef.current) {
      observer.current = new IntersectionObserver(intersectionHandler, options);
      observer.current.observe(targetRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [targetRef, options, callback, executeOnce]);
};
