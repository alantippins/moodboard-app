"use client"

import Image from "next/image";
import { useState } from "react"
import { Palette } from '@/data/palettes';
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Moodboard from "@/components/Moodboard"
import { palettes } from "@/data/palettes"

export function MoodCreator() {
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [generatedPalette, setGeneratedPalette] = useState<Palette | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood === selectedMood ? null : mood)
  }

  

  if (generatedPalette) {
    return <Moodboard palette={generatedPalette} onBack={() => { setGeneratedPalette(null); setInputValue(""); }} />;
  }

  if (selectedMood) {
    // Normalize mood for palette lookup (replace dashes with spaces, lowercase)
    const normalizedMood = selectedMood.replace(/-/g, ' ').toLowerCase();
    return <Moodboard mood={normalizedMood} onBack={() => setSelectedMood(null)} />;
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
          placeholder="Try 'dusty peach'"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const normalized = inputValue.trim().toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
              if (["stone", "celestial", "dusty peach"].includes(normalized)) {
                setSelectedMood(normalized.replace(/\s+/g, '-'));
              } else if (normalized) {
                setLoading(true);
                setError(null);
                try {
                  const res = await fetch('/api/generatePalette', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: normalized }),
                  });
                  const data = await res.json();
                  if (data.palette) {
                    const palette = data.palette;
                    if (!["stone", "celestial", "dusty peach"].includes((palette.name || "").toLowerCase())) {
                      const { generateGeometricSVG } = await import("@/utils/generateGeometricSVG");
                      palette.svg = (props: any) => generateGeometricSVG(palette, palette.name || inputValue);
                    }
                    setGeneratedPalette(palette);
                  } else {
                    setError('Could not generate moodboard.');
                  }
                } catch {

                  setError('Failed to contact OpenAI API.');
                } finally {
                  setLoading(false);
                }
              }
            }
          }}
          className="h-12 pl-4 pr-12 rounded-lg border-[#d5d7da] text-[#0f1219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374968] focus:border-[#080b11] transition-all duration-200"
          aria-label="Type a mood word"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717680] hover:text-[#535862] hover:bg-transparent cursor-pointer"
          disabled={inputValue.trim() === '' || loading}
          onClick={async () => {
            const normalized = inputValue.trim().toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
            if (["stone", "celestial", "dusty peach"].includes(normalized)) {
              setSelectedMood(normalized);
            } else if (normalized) {
              setLoading(true);
              setError(null);
              try {
                const res = await fetch('/api/generatePalette', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ word: normalized }),
                });
                const data = await res.json();
                if (data.palette) {
                  const palette = data.palette;
                  if (!["stone", "celestial", "dusty peach"].includes((palette.name || "").toLowerCase())) {
                    const { generateGeometricSVG } = await import("@/utils/generateGeometricSVG");
                    palette.svg = (props: any) => generateGeometricSVG(palette, palette.name || inputValue);
                  }
                  setGeneratedPalette(palette);
                } else {
                  setError('Could not generate moodboard.');
                }
              } catch {

                setError('Failed to contact OpenAI API.');
              } finally {
                setLoading(false);
              }
            }
          }}
          aria-label="Submit mood word"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7-7 7" /></svg>
        </Button>
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
            className="rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer shadow-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-2"
            style={{
              background: selectedMood === "stone" ? palettes["stone"].background : palettes["stone"].background,
              borderColor: selectedMood === "stone" ? palettes["stone"].accent : "transparent",
              color: selectedMood === "stone" ? palettes["stone"].headingColor : palettes["stone"].textColor
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
              {typeof palettes["stone"].svg === 'function'
  ? palettes["stone"].svg({ width: 20, height: 20 })
  : typeof palettes["stone"].svg === 'string' && palettes["stone"].svg
    ? <Image src={palettes["stone"].svg} width={20} height={20} alt="Stone illustration" />
    : null}
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
              background: selectedMood === "celestial" ? palettes["celestial"].background : palettes["celestial"].background,
              borderColor: selectedMood === "celestial" ? palettes["celestial"].accent : "transparent",
              color: selectedMood === "celestial" ? palettes["celestial"].headingColor : palettes["celestial"].textColor
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
            >
            </motion.span>
            <motion.span
              className="flex items-center"
              style={{ width: 20, height: 20 }}
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {typeof palettes["celestial"].svg === 'function'
  ? palettes["celestial"].svg({ width: 20, height: 20 })
  : typeof palettes["celestial"].svg === 'string' && palettes["celestial"].svg
    ? <Image src={palettes["celestial"].svg} width={20} height={20} alt="Celestial illustration" />
    : null}
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
              background: selectedMood === "dusty-peach" ? palettes["dusty peach"].background : palettes["dusty peach"].background,
              borderColor: selectedMood === "dusty-peach" ? palettes["dusty peach"].accent : "transparent",
              color: selectedMood === "dusty-peach" ? palettes["dusty peach"].headingColor : palettes["dusty peach"].textColor
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
            >
            </motion.span>
            <motion.span
              className="flex items-center"
              style={{ width: 20, height: 20 }}
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {typeof palettes["dusty peach"].svg === 'function'
  ? palettes["dusty peach"].svg({ width: 20, height: 20 })
  : typeof palettes["dusty peach"].svg === 'string' && palettes["dusty peach"].svg
    ? <Image src={palettes["dusty peach"].svg} width={20} height={20} alt="Dusty Peach illustration" />
    : null}
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
        <div className="mt-4 text-[#717680] text-sm">Generating moodboard...</div>
      )}
      {error && (
        <div className="mt-4 text-red-500 text-sm">{error}</div>
      )}
    </div>
  )
}
