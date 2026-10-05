"use client";

import { useEffect, useRef, useState } from "react";

/** Travel from the current slide to the next, hold the pose, then step. */
export function useSlideTravel(active: boolean, speed: number, onStep: () => void) {
  const [travel, setTravel] = useState(0);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    if (!active) return;
    let start = performance.now();
    const pace = Math.max(0.25, speed);
    const travelMs = Math.max(480, Math.round(1100 / pace));
    const holdMs = Math.max(220, Math.round(420 / pace));
    let raf = 0;
    let stopped = false;
    const tick = (now: number) => {
      if (stopped) return;
      const elapsed = now - start;
      if (elapsed <= travelMs) setTravel(elapsed / travelMs);
      else if (elapsed <= travelMs + holdMs) setTravel(1);
      else {
        setTravel(0);
        onStepRef.current();
        start = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [active, speed]);

  return active ? travel : 0;
}
