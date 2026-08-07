"use client";

import type { DictationEntry } from "@/lib/types";

interface HistoryDrawerProps {
  history: DictationEntry[];
  onRestore: (text: string) => void;
  onCopy: (text: string) => void;
  onClose: () => void;
  onClear: () => void;
}

export default function HistoryDrawer({
  history,
  onRestore,
  onCopy,
  onClose,
  onClear,
}: HistoryDrawerProps) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" role="dialog" aria-label="Dictation history">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">History</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} aria-label="Close history" className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              No dictations yet. Press the mic to start.
            </p>
          )}
          {history.map((entry) => (
            <div key={entry.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-800 mb-2 line-clamp-3">{entry.text}</p>
              {entry.translated && (
                <p className="text-xs text-blue-600 mb-2 italic">{entry.translated}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRestore(entry.text)}
                    className="text-xs text-lime-600 hover:text-lime-700 font-medium cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onCopy(entry.text)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
