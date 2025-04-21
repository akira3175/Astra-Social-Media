import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  onIntersect: () => void,
  isLoading: boolean,
  hasMore: boolean,
  error: any = null,  // Thêm error parameter
  options: UseInfiniteScrollOptions = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      // Chỉ trigger load more khi không có lỗi
      if (entry.isIntersecting && !isLoading && hasMore && !error) {
        onIntersect();
      }
    },
    [onIntersect, isLoading, hasMore, error]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '200px',
    });

    observerRef.current = observer;

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options.threshold, options.rootMargin]);

  return targetRef;
};