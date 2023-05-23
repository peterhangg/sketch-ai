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

  const intersectionHandler = React.useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        callback();

        if (!intersected.current && observer.current && executeOnce) {
          observer.current.disconnect();
          observer.current = null;
          intersected.current = true;
        }
      }
    },
    [callback, observer, intersected, executeOnce]
  );

  React.useEffect(() => {
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
  }, [intersectionHandler, targetRef, options]);
};
