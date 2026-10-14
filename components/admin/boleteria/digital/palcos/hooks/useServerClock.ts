"use client";

import { useEffect, useState } from "react";

// Server time, ticking every second while running. offsetMs: server time
// minus this computer's time
export function useServerClock(offsetMs: number, running: boolean): number {
  const [now, setNow] = useState(() => Date.now() + offsetMs);

  useEffect(() => {
    setNow(Date.now() + offsetMs);
    if (!running) return;
    const id = setInterval(() => setNow(Date.now() + offsetMs), 1000);
    return () => clearInterval(id);
  }, [offsetMs, running]);

  return now;
}
