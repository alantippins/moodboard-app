"use client"

import { useState } from "react"
import { Mic } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Moodboard from "@/components/Moodboard"

export function MoodCreator() {
  const [inputValue, setInputValue] = useState("")
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

  if (selectedMood === "dusty-peach") {
    return <Moodboard />;
  }

  return (
    <div className="w-full max-w-md px-4 py-8 text-center">
      <motion.h1
        className="mb-8 text-3xl font-medium text-[#4e2e20]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Say a word,
        <br />
        create a mood.
      </motion.h1>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Try &quot;dusty peach&quot;"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-12 pl-4 pr-12 rounded-full border-[#d5d7da] text-[#717680] focus:border-[#64748b] focus:ring-0"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717680] hover:text-[#535862] hover:bg-transparent"
        >
          <Mic className="h-5 w-5" />
          <span className="sr-only">Use voice input</span>
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
          animate={selectedMood === "brutalist" ? "selected" : "initial"}
        >
          <Button
            variant="outline"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
              selectedMood === "brutalist"
                ? "bg-[#f7f7f7] border-[#535862]"
                : "bg-white border-[#d5d7da] text-[#717680] hover:bg-[#f7f7f7]"
            }`}
            onClick={() => handleMoodSelect("brutalist")}
          >
            Brutalist
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
            className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 ${
              selectedMood === "celestial"
                ? "bg-[#eef4fd] border-[#d7c7ff] text-[#5f5086]"
                : "bg-[#eef4fd] border-[#d7c7ff] text-[#5f5086] hover:bg-[#d7c7ff]/20"
            }`}
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
              ✧
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
            className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300 ${
              selectedMood === "dusty-peach"
                ? "bg-[#ffeee6] border-[#d8a48f] text-[#8d543d]"
                : "bg-[#ffeee6] border-[#d8a48f] text-[#8d543d] hover:bg-[#ffeee6]/70"
            }`}
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
              🍑
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
