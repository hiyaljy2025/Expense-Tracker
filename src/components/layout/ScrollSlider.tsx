import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const THUMB_SIZE = 40;

/** A draggable vertical scrollbar fixed to the right edge, to make scrolling long lists easier on small screens. */
export function ScrollSlider() {
  const draggingRef = useRef(false);
  const [maxScroll, setMaxScroll] = useState(0);
  /** A state (not a ref) so the measurement effect below re-runs once the track actually mounts —
   *  the track is conditionally rendered (only once maxScroll > 0), so a plain ref + `useEffect(…, [])`
   *  would fire once with a still-null ref and never get a second chance to measure it. */
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function recomputeMaxScroll() {
      setMaxScroll(Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
    }
    function onScroll() {
      if (draggingRef.current) return;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(max > 0 ? window.scrollY / max : 0);
    }
    recomputeMaxScroll();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', recomputeMaxScroll);
    const bodyObserver = new ResizeObserver(recomputeMaxScroll);
    bodyObserver.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', recomputeMaxScroll);
      bodyObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!trackEl) return;
    const observer = new ResizeObserver(() => setTrackHeight(trackEl.clientHeight));
    setTrackHeight(trackEl.clientHeight);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [trackEl]);

  function scrollToClientY(clientY: number) {
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setProgress(ratio);
    window.scrollTo({ top: ratio * maxScroll });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrollToClientY(e.clientY);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    scrollToClientY(e.clientY);
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  if (maxScroll <= 0) return null;

  const thumbTravel = Math.max(0, trackHeight - THUMB_SIZE);

  return (
    <div
      ref={setTrackEl}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="slider"
      aria-label="Scroll position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="fixed right-2 top-1/2 z-20 h-[55vh] w-5 -translate-y-1/2 touch-none rounded-full bg-gray-200/70"
    >
      <div
        className="absolute left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-expense shadow"
        style={{ top: progress * thumbTravel }}
      />
    </div>
  );
}
