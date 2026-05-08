"use client";
import { useRef, useState, useEffect, useCallback } from "react";

const DEFAULT_WIDTH = 256; // w-64
const MIN_WIDTH = 180;
const MAX_WIDTH = 440;

export function useResizablePanel(storageKey = "suarec_admin_panel_w") {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  // Cargar de localStorage después de montar (evita SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) setWidth(parsed);
    }
  }, [storageKey]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startW.current + delta),
      );
      setWidth(next);
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setWidth((prev) => {
        localStorage.setItem(storageKey, String(prev));
        return prev;
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [storageKey]);

  return { width, onMouseDown };
}
