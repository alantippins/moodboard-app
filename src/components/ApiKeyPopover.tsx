import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

interface ApiKeyPopoverProps {
  apiKeyStatus: "set" | "not-set";
  onSetKey: () => void;
  onClearKey: () => void;
}

export function ApiKeyPopover({
  apiKeyStatus,
  onSetKey,
  onClearKey,
}: ApiKeyPopoverProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-20">
      <button
        ref={buttonRef}
        aria-label="API Key Settings"
        className="bg-white border border-gray-200 rounded-full p-2 hover:opacity-75 hover:scale-[1.045] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent relative"
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 20, lineHeight: 1 }}
      >
        <span className="relative inline-block cursor-pointer">
          <Settings size={24} strokeWidth={2.2} className="text-gray-500" />
          <span
            className={`absolute -top-3 -right-3 w-4 h-4 rounded-full border-4 border-white ${
              apiKeyStatus === "set" ? "bg-green-500" : "bg-red-500"
            }`}
            title={apiKeyStatus === "set" ? "Connected" : "Not connected"}
          />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mb-2 bottom-full w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs text-gray-700"
            style={{ minWidth: 180 }}
          >
            <div className="mb-3 flex items-center gap-2">
              {apiKeyStatus === "set" ? (
                <>
                  <span
                    className="inline-block w-2 h-2 bg-green-500 rounded-full"
                    title="API key is set"
                  />
                  <span className="text-green-700">API key is set</span>
                </>
              ) : (
                <>
                  <span
                    className="inline-block w-2 h-2 bg-red-500 rounded-full"
                    title="API key not set"
                  />
                  <span className="text-red-600">No API key</span>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {apiKeyStatus === "set" ? (
                <button
                  onClick={() => {
                    onClearKey();
                    setOpen(false);
                  }}
                  className="text-xs text-gray-600 hover:opacity-75 transition-colors duration-200 text-left"
                >
                  Clear Key
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSetKey();
                    setOpen(false);
                  }}
                  className="text-xs text-gray-600 hover:opacity-75 transition-colors duration-200 text-left"
                >
                  Set Key
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
