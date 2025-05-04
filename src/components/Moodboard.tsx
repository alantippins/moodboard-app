"use client"

import Link from "next/link"
import { ArrowLeft, Play, Shuffle, Share, Upload } from "lucide-react"
import { useEffect, useState } from "react"

import { palettes } from "@/data/palettes"

type MoodboardProps = {
  mood: string;
  onBack?: () => void;
}

export default function Moodboard({ mood, onBack }: MoodboardProps) {
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
        <div className="col-span-4" style={{ background: palette.colors[0] }}>
          <div className="rounded-lg p-6 flex flex-col hover:shadow-subtle transition-all duration-500 group">
            <span className="text-sm mb-4 font-serif" style={{ color: palette.colors[3] }}>{palette.fontPrimary}</span>
            <span className="text-8xl font-serif mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700" style={{ color: palette.colors[3] }}>
              Aa
            </span>
          </div>
        </div>

        {/* Font Card 2 */}
        <div className="col-span-4" style={{ background: palette.colors[3] }}>
          <div className="rounded-lg p-6 flex flex-col hover:shadow-subtle transition-all duration-500 group">
            <span className="text-sm mb-4" style={{ color: palette.colors[0] }}>{palette.fontSecondary}</span>
            <span className="text-8xl font-sans mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700" style={{ color: palette.colors[0] }}>
              Aa
            </span>
          </div>
        </div>

        {/* Shape Card */}
        <div className="col-span-4 row-span-2" style={{ background: palette.colors[0] }}>
          <div className="rounded-lg p-6 flex items-center justify-center hover:shadow-subtle transition-all duration-500">
            {palette.svg()}
          </div>
        </div>

        {/* Description Card */}
        <div className="col-span-8 rounded-lg" style={{ background: palette.colors[0] }}>
          <div className="rounded-lg p-6 hover:shadow-subtle transition-all duration-500">
            <h2 className="text-3xl font-serif mb-3 tracking-tight leading-relaxed" style={{ color: palette.colors[3] }}>
              Soft tones, quiet intent, a balance of form and feeling.
            </h2>
            <p className="leading-relaxed" style={{ color: palette.colors[3] }}>
              {palette.name} evokes calm restraint. It&apos;s not trying to be loud or sharp. Instead, it sits comfortably between
              eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.
            </p>
          </div>
        </div>

        {/* Audio Card */}
        <div className="col-span-8 roun" style={{ background: palette.colors[2] }}>
          <div className="rounded-lg p-6 flex items-center justify-center hover:shadow-subtle transition-all duration-500 group">
            <button className="flex flex-col items-center transition-all duration-300 hover:scale-110" style={{ color: palette.colors[3] }}>
              <Play className="h-12 w-12 mb-2" fill={palette.colors[3]} />
              <span>{palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}</span>
            </button>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          {palette.colors.map((color, i) => (
            <div
              key={color}
              className="rounded-lg p-4 flex items-end justify-center hover:shadow-subtle transition-all duration-500 hover:scale-105"
              style={{ background: color }}
            >
              <span className="text-sm" style={{ color: i === 3 ? palette.colors[0] : palette.colors[3] }}>{color.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with animation */}
      <footer className="mt-12 text-right">
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
  )
}
