import { useRef, useState } from "react";

export function usePanZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0); // translateX
  const [ty, setTy] = useState(0); // translateY
  const isPanning = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = Math.exp(delta * 0.001); // smooth zoom
    const newScale = Math.min(4, Math.max(0.5, scale * factor));

    // zoom to cursor
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = e.clientX - (rect?.left ?? 0);
    const cy = e.clientY - (rect?.top ?? 0);
    const dx = cx - tx;
    const dy = cy - ty;
    const ratio = newScale / scale;

    setTx(cx - dx * ratio);
    setTy(cy - dy * ratio);
    setScale(newScale);
  }

  function onPointerDown(e: React.PointerEvent) {
    isPanning.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isPanning.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    setTx((v) => v + dx);
    setTy((v) => v + dy);
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    isPanning.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  const transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  return { containerRef, transform, onWheel, onPointerDown, onPointerMove, onPointerUp, scale };
}
