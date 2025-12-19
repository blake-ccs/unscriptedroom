import { useEffect, useRef, useState } from "react";

/** Keeps popovers open when moving from trigger -> panel (no flicker) */
export function useHoverIntent(delayIn = 80, delayOut = 120) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delayIn);
  };
  const onLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), delayOut);
  };

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);
  return { open, onEnter, onLeave, setOpen };
}
