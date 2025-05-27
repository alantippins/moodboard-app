"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Palette } from "@/data/palettes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Moodboard from "@/components/Moodboard";
import { palettes } from "@/data/palettes";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { ApiKeyPopover } from "@/components/ApiKeyPopover";
import { generateGeometricSVG } from "@/utils/generateGeometricSVG";
import { generatePaletteClient } from "@/utils/openaiClient";

// Local storage key for the API key
const API_KEY_STORAGE_KEY = "moodboard_openai_api_key";

export function MoodCreator() {
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [generatedPalette, setGeneratedPalette] = useState<Palette | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API key state
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "set" | "not-set" | "loading"
  >("loading");
  const [pendingGeneration, setPendingGeneration] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setApiKeyStatus("set");
    } else {
      setApiKeyStatus("not-set");
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = async (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setApiKeyStatus("set");
    if (pendingGeneration) {
      setPendingGeneration(false);
      await handleMoodboard();
    }
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
    setApiKeyStatus("not-set");
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
    selected: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 1],
      },
    },
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood === selectedMood ? null : mood);
  };

  // Handle moodboard generation on Enter
  const handleMoodboard = async () => {
    // Keep original casing for display
    const originalInput = inputValue.trim();
    // Normalize for comparison and API
    const normalized = originalInput
      .toLowerCase()
      .replace(/[-_]/g, "")
      .replace(/\s+/g, " ");
    if (["stone", "celestial", "dusty peach"].includes(normalized)) {
      setSelectedMood(originalInput.replace(/\s+/g, "-"));
    } else if (normalized) {
      setLoading(true);
      setError(null);
      // Check if API key is set
      if (apiKeyStatus !== "set") {
        setShowApiKeyModal(true);
        setPendingGeneration(true);
        setLoading(false);
        return;
      }
      try {
        // Check if we're on GitHub Pages (static deployment) or if we should use direct API calls
        const isStaticDeployment =
          window.location.hostname.includes("github.io") ||
          process.env.NODE_ENV === "production";

        console.log("Environment:", process.env.NODE_ENV);
        console.log("Is static deployment:", isStaticDeployment);
        console.log("API key status:", apiKeyStatus);

        let result;

        if (isStaticDeployment) {
          // Use direct OpenAI API call from the browser for GitHub Pages
          console.log("Using client-side OpenAI API for:", originalInput);
          result = await generatePaletteClient(
            normalized,
            originalInput,
            apiKey
          );
        } else {
          // Use server API for local development
          const res = await fetch("/api/generatePalette", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              word: normalized,
              originalWord: originalInput,
              apiKey: apiKey,
            }),
          });
          result = await res.json();
        }

        // Check if response is a palette (has swatches) or an error object
        if ("swatches" in result) {
          // We have a valid palette
          const palette = result as Palette;

          // Assign SVG generator for custom palettes if not present
          if (!palette.svg) {
            palette.svg = () =>
              generateGeometricSVG(palette, palette.name || originalInput, 240);
          }

          setGeneratedPalette(palette);
        } else if ("error" in result) {
          // We have an error
          setError(result.error || "Failed to generate palette");
        } else {
          setError("Received invalid response format");
        }
      } catch (error: unknown) {
        console.error("Error generating palette:", error);
        setError("Error generating palette");
      } finally {
        setLoading(false);
      }
    }
  };

  if (generatedPalette) {
    return (
      <Moodboard
        palette={generatedPalette}
        onBack={() => {
          setGeneratedPalette(null);
          setInputValue("");
        }}
      />
    );
  }

  if (selectedMood) {
    // Normalize mood for palette lookup (replace dashes with spaces, lowercase)
    const normalizedMood = selectedMood.replace(/-/g, " ").toLowerCase();
    return (
      <Moodboard mood={normalizedMood} onBack={() => setSelectedMood(null)} />
    );
  }

  return (
    <div className="w-full max-w-md px-4 py-8 text-center">
      <motion.h1
        className="mb-8 text-3xl font-medium text-[#222]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Type a word,
        <br />
        create a mood.
      </motion.h1>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder={
            loading
              ? "Generating moodboard..."
              : "Enter a mood word (e.g. cozy, vibrant)"
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pr-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleMoodboard();
          }}
          disabled={loading}
        />

        {/* Submit button or loading spinner */}
        {loading ? (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                stroke="#717680"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 6"
              />
            </svg>
          </motion.div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717680] hover:text-[#535862] hover:bg-transparent cursor-pointer"
            disabled={inputValue.trim() === ""}
            aria-label="Submit mood word"
            onClick={handleMoodboard}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          </Button>
        )}
      </div>

      <motion.div
        className="flex justify-center gap-2 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          animate={selectedMood === "stone" ? "selected" : "initial"}
        >
          <Button
            variant="outline"
            className="rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-2"
            style={{
              background:
                selectedMood === "stone"
                  ? palettes["stone"].background
                  : palettes["stone"].background,
              borderColor:
                selectedMood === "stone"
                  ? palettes["stone"].accent
                  : "transparent",
              color:
                selectedMood === "stone"
                  ? palettes["stone"].headingColor
                  : palettes["stone"].textColor,
            }}
            onClick={() => handleMoodSelect("stone")}
          >
            <motion.span
              className="flex items-center"
              style={{ width: 20, height: 20 }}
              whileHover={{ scale: 1.15, rotate: -8 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {typeof palettes["stone"].svg === "function" ? (
                palettes["stone"].svg({ width: 20, height: 20 })
              ) : typeof palettes["stone"].svg === "string" &&
                palettes["stone"].svg ? (
                <Image
                  src={palettes["stone"].svg}
                  width={20}
                  height={20}
                  alt="Stone illustration"
                />
              ) : null}
            </motion.span>
            Stone
          </Button>
        </motion.div>

        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          animate={selectedMood === "celestial" ? "selected" : "initial"}
        >
          <Button
            variant="outline"
            className="rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-2"
            style={{
              background:
                selectedMood === "celestial"
                  ? palettes["celestial"].background
                  : palettes["celestial"].background,
              borderColor:
                selectedMood === "celestial"
                  ? palettes["celestial"].accent
                  : "transparent",
              color:
                selectedMood === "celestial"
                  ? palettes["celestial"].headingColor
                  : palettes["celestial"].textColor,
            }}
            onClick={() => handleMoodSelect("celestial")}
          >
            <motion.span
              className="text-[#5f5086]"
              animate={
                selectedMood === "celestial"
                  ? {
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1.2, 1],
                      transition: { duration: 0.6, ease: "easeInOut" },
                    }
                  : {}
              }
            ></motion.span>
            <motion.span
              className="flex items-center"
              style={{ width: 20, height: 20 }}
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {typeof palettes["celestial"].svg === "function" ? (
                palettes["celestial"].svg({ width: 20, height: 20 })
              ) : typeof palettes["celestial"].svg === "string" &&
                palettes["celestial"].svg ? (
                <Image
                  src={palettes["celestial"].svg}
                  width={20}
                  height={20}
                  alt="Celestial illustration"
                />
              ) : null}
            </motion.span>
            Celestial
          </Button>
        </motion.div>

        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          animate={selectedMood === "dusty-peach" ? "selected" : "initial"}
        >
          <Button
            variant="outline"
            className="rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-2"
            style={{
              background:
                selectedMood === "dusty-peach"
                  ? palettes["dusty peach"].background
                  : palettes["dusty peach"].background,
              borderColor:
                selectedMood === "dusty-peach"
                  ? palettes["dusty peach"].accent
                  : "transparent",
              color:
                selectedMood === "dusty-peach"
                  ? palettes["dusty peach"].headingColor
                  : palettes["dusty peach"].textColor,
            }}
            onClick={() => handleMoodSelect("dusty-peach")}
          >
            <motion.span
              className="text-[#8d543d]"
              animate={
                selectedMood === "dusty-peach"
                  ? {
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1],
                      transition: { duration: 0.5, ease: "easeInOut" },
                    }
                  : {}
              }
            ></motion.span>
            <motion.span
              className="flex items-center"
              style={{ width: 20, height: 20 }}
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {typeof palettes["dusty peach"].svg === "function" ? (
                palettes["dusty peach"].svg({ width: 20, height: 20 })
              ) : typeof palettes["dusty peach"].svg === "string" &&
                palettes["dusty peach"].svg ? (
                <Image
                  src={palettes["dusty peach"].svg}
                  width={20}
                  height={20}
                  alt="Dusty Peach illustration"
                />
              ) : null}
            </motion.span>
            Dusty Peach
          </Button>
        </motion.div>
      </motion.div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-sm text-[#717680]"
        >
          <p>
            Selected mood: <span className="font-medium">{selectedMood}</span>
          </p>
        </motion.div>
      )}
      {loading && (
        <motion.div
          className="mt-3 text-center text-sm text-[#717680]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            Creating your {inputValue} palette...
          </motion.span>
        </motion.div>
      )}
      {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmit={saveApiKey}
      />

      {/* Floating API Key Popover Icon */}
      {(apiKeyStatus === "set" || apiKeyStatus === "not-set") && (
        <ApiKeyPopover
          apiKeyStatus={apiKeyStatus}
          onSetKey={() => setShowApiKeyModal(true)}
          onClearKey={clearApiKey}
        />
      )}
    </div>
  );
}
