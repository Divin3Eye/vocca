"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface VoccaBarProps {
  recording: boolean;
  onToggleMic: () => void;
  onCopy: () => void;
}

export default function VoccaBar({ recording, onToggleMic, onCopy }: VoccaBarProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) return;
      setDragging(true);
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    },
    [pos]
  );

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const onMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={dragRef}
      onMouseDown={onMouseDown}
      className="fixed z-50 flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-xl border border-gray-200 select-none"
      style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab" }}
    >
      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase mr-1">
        Vocca
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMic();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label={recording ? "Stop dictation" : "Start dictation"}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer ${
          recording ? "bg-red-500 text-white" : "bg-lime-500 text-white hover:bg-lime-400"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Copy transcript"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}
