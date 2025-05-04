"use client"

import Link from "next/link"
import { ArrowLeft, Play, Shuffle, Share, Upload } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Howl } from "howler"

import { palettes } from "@/data/palettes"

type MoodboardProps = {
  mood: string;
  onBack?: () => void;
}

export default function Moodboard({ mood, onBack }: MoodboardProps) {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add subtle background noise texture
    const noise = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        const imgData = ctx.createImageData(canvas.width, canvas.height)
        const data = imgData.data

        for (let i = 0; i < data.length; i += 4) {
          const value = Math.floor(Math.random() * 255)
          data[i] = value
          data[i + 1] = value
          data[i + 2] = value
          data[i + 3] = Math.floor(Math.random() * 10) // Very subtle opacity
        }

        ctx.putImageData(imgData, 0, 0)
        document.body.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`
        document.body.style.backgroundRepeat = "repeat"
      }
    }

    noise()
  }, [])

  if (!mounted) return null

  if (!mood || typeof mood !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold mb-2">No mood selected</div>
        <div className="text-gray-500">Please select a mood to see its moodboard.</div>
      </div>
    )
  }

  const palette = palettes[mood.toLowerCase()]

  if (!palette) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold mb-2">Mood not found</div>
        <div className="text-gray-500">Please select a mood to see its moodboard.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 max-w-5xl mx-auto font-sans">
      {/* Header with subtle animation */}
      <header className="flex justify-between items-center mb-8">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group bg-transparent border-0 p-0 m-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Try a new word</span>
          </button>
        ) : (
          <Link href="#" className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Try a new word</span>
          </Link>
        )}
        <div className="flex items-center gap-6">
          <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <Shuffle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm tracking-wide">Shuffle</span>
          </button>
          <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <Share className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Share</span>
          </button>
          <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <Upload className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Export</span>
          </button>
        </div>
      </header>

      {/* Title with animation */}
      <h1 className="text-7xl font-serif text-[#4e2e20] mb-10 tracking-tight">
        {palette.name}
      </h1>

      {/* Grid Layout matching the mockup */}
      <div className="grid grid-cols-12 gap-4">
        {/* Font Card 1 */}
        <div className="col-span-3 rounded-lg" style={{ background: palette.background }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="text-sm mb-4 font-serif" style={{ color: palette.headingColor }}>{palette.fontPrimary}</span>
            <span className="text-8xl font-serif mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700" style={{ color: palette.headingColor }}>
              Aa
            </span>
          </div>
        </div>

        {/* Font Card 2 */}
        <div className="col-span-3 rounded-lg" style={{ background: palette.textColor }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="text-sm mb-4" style={{ color: palette.background }}>{palette.fontSecondary}</span>
            <span className="text-8xl font-sans mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700" style={{ color: palette.background }}>
              Aa
            </span>
          </div>
        </div>

        {/* Shape Card */}
        <div className="col-span-6 row-span-2 rounded-lg" style={{ background: palette.background }}>
          <div className="flex items-center justify-center h-full w-full min-h-[350px] transition-all duration-500">
            <span className="inline-block">
  <motion.div
    whileHover={{ scale: 1.08, rotate: 6 }}
    whileTap={{ scale: 0.96, rotate: 0 }}
    transition={{ type: "spring", stiffness: 250, damping: 18 }}
    className="cursor-pointer"
    aria-label={palette.name + " illustration"}
    style={{ width: 240, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    {palette.svg({ width: 240, height: 260 })}
  </motion.div>
</span>
          </div>
        </div>

        {/* Description Card */}
        <div className="col-span-6 rounded-lg" style={{ background: palette.background }}>
          <div className="p-6  transition-all duration-500">
            <h2 className="text-3xl font-serif mb-3 tracking-tight" style={{ color: palette.headingColor }}>
              Soft tones, quiet intent, a balance of form and feeling.
            </h2>
            <p className="leading-relaxed" style={{ color: palette.headingColor }}>
              {palette.name} evokes calm restraint. It&apos;s not trying to be loud or sharp. Instead, it sits comfortably between
              eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.
            </p>
          </div>
        </div>

        {/* Audio Card */}
        <div className="col-span-6 rounded-lg" style={{ background: palette.accent }}>
           <div className="p-6 flex flex-col items-center justify-center h-full w-full transition-all duration-500 group">
             <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: 220 }}>
                <div className="flex flex-col items-center justify-center" style={{ height: 120 }}>
                  {!isPlaying ? (
                    <motion.button
                      className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                      style={{ color: palette.headingColor, background: 'transparent' }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      aria-label={`Play ${palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}`}
                      onClick={() => {
                        if (!soundRef.current) {
                          const sound = new Howl({
                            src: ["/audio/" + palette.audio],
                            onend: () => setIsPlaying(false),
                            onloaderror: () => {
                              alert("Audio file could not be loaded. Please check file path.");
                              setIsPlaying(false);
                            },
                          });
                          soundRef.current = sound;
                        }
                        soundRef.current.play();
                        setIsPlaying(true);
                      }}
                    >
                      <Play className="h-16 w-16 mb-2" fill={palette.headingColor} />
                    </motion.button>
                  ) : (
                    <motion.button
                      className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                      style={{ color: palette.headingColor, background: 'transparent' }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      aria-label="Stop audio"
                      onClick={() => {
                        if (soundRef.current) {
                          soundRef.current.stop();
                          setIsPlaying(false);
                        }
                      }}
                    >
                      <svg className="h-16 w-16 mb-2" viewBox="0 0 24 24" fill={palette.headingColor} stroke={palette.headingColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ borderRadius: 8 }}>
                        <rect x="6" y="6" width="12" height="12" rx="3" />
                      </svg>
                    </motion.button>
                  )}
                </div>
                <div className="text-xl text-center mt-0" style={{ color: palette.headingColor, minHeight: 32, fontWeight: 400 }}>
                  {isPlaying
                    ? <>Now playing &quot;{palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}&quot;</>
                    : <>{palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}</>
                  }
                </div>
              </div>
            </div>
          </div>

        {/* Color Swatches */}
        <div className="col-span-6 grid grid-cols-2 gap-4">
          {palette.swatches.map((color: string, i: number) => (
            <div
              key={color}
              className="rounded-lg flex items-center justify-center text-lg font-mono border border-transparent transition-all duration-300 select-text cursor-pointer"
              style={{ background: color, color: i === 0 ? palette.headingColor : palette.background }}
              aria-label={color}
            >
              {color.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-12 text-right">
        {/* Footer with animation */}
        <p className="text-sm text-[#4e2e20]">
          Created with{" "}
          <Link
            href="#"
            className="font-medium hover:text-[#8d543d] transition-colors duration-300 relative inline-block"
          >
            Verbal
          </Link>
        </p>
      </footer>
    </div>
  );
}
