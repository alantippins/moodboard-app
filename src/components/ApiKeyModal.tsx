"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      setError(
        "Invalid API key format. OpenAI keys typically start with 'sk-'"
      );
      return;
    }

    onSubmit(apiKey);
    setApiKey("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: "-40%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%" }}
          >
            <h2 className="text-xl font-medium mb-4">Enter OpenAI API Key</h2>
            <p className="text-sm text-gray-600 mb-4">
              To generate custom moodboards, please enter your OpenAI API key.
              Your key will be stored locally in your browser and never sent to
              our servers.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <h3 className="text-sm font-medium text-amber-800">Security Recommendation</h3>
              <p className="text-xs text-amber-700 mt-1">
                For security, we recommend setting up usage limits for your API key. 
                Go to your <a href="https://platform.openai.com/account/billing/limits" target="_blank" rel="noopener noreferrer" className="underline">OpenAI account settings</a> and set a monthly spending cap to avoid unexpected charges.
              </p>
            </div>

            <div className="mb-4">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error) setError("");
                }}
                className="w-full mb-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save API Key</Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                You can get an API key from your{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  OpenAI account
                </a>
                . Your key will only be used for generating moodboards in this
                app.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
