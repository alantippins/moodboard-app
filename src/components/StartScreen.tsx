"use client"

import { useState } from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Moodboard from "@/components/Moodboard"
import { palettes } from "@/data/palettes"

export function MoodCreator() {
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

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

  if (selectedMood) {
    // Normalize mood for palette lookup (replace dashes with spaces, lowercase)
    const normalizedMood = selectedMood.replace(/-/g, ' ').toLowerCase();
    return <Moodboard mood={normalizedMood} onBack={() => setSelectedMood(null)} />;
  }

  return (
    <div className="w-full max-w-md px-4 py-8 text-center">
      <motion.h1
        className="mb-8 text-3xl font-medium text-[#4e2e20]"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const normalized = inputValue.trim().toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
              if (["stone", "celestial", "dusty peach"].includes(normalized)) {
                setSelectedMood(normalized.replace(/\s+/g, '-'));
              }
            }
          }}
          className="h-12 pl-4 pr-12 rounded-lg border-[#d5d7da] text-[#717680] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5b4fc] focus:border-[#64748b] transition-all duration-200"
          aria-label="Type a mood word"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717680] hover:text-[#535862] hover:bg-transparent cursor-pointer"
          disabled={inputValue.trim() === ''}
          onClick={() => {
            const normalized = inputValue.trim().toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
            if (["stone", "celestial", "dusty peach"].includes(normalized)) {
              setSelectedMood(normalized.replace(/\s+/g, '-'));
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
              {palettes["stone"].svg({ width: 20, height: 20 })}
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
              {palettes["celestial"].svg({ width: 20, height: 20 })}
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
              {palettes["dusty peach"].svg({ width: 20, height: 20 })}
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
    </div>
  )
}
