import { RefObject, useEffect, useRef } from "react";

export function useProgressScroll<T extends HTMLElement>(
  progress: number,
  enabled: boolean
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (enabled) {
      ref.current?.scrollTo({
        behavior: "smooth",
        top: ((ref.current?.clientHeight ?? 0) * progress) / 100,
      });
    }
  }, [progress, enabled]);

  return ref;
}
