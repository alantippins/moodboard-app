"use client"

import Link from "next/link"
import { ArrowLeft, Play, Shuffle, Share, Upload } from "lucide-react"
import { useEffect, useState } from "react"

export default function Moodboard() {
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

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 max-w-5xl mx-auto font-sans">
      {/* Header with subtle animation */}
      <header className="flex justify-between items-center mb-8">
        <Link href="#" className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform duration-300" />
          <span className="text-sm tracking-wide">Try a new word</span>
        </Link>
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
        Dusty Peach
      </h1>

      {/* Grid Layout matching the mockup */}
      <div className="grid grid-cols-12 gap-4">
        {/* Font Card 1 */}
        <div className="col-span-4 bg-[#f9e0d3] rounded-lg p-6 flex flex-col hover:shadow-subtle transition-all duration-500 group">
          <span className="text-sm text-[#8d543d] mb-4 font-serif">Playfair Display</span>
          <span className="text-8xl text-[#8d543d] font-serif mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700">
            Aa
          </span>
        </div>

        {/* Font Card 2 */}
        <div className="col-span-4 bg-[#8d543d] rounded-lg p-6 flex flex-col hover:shadow-subtle transition-all duration-500 group">
          <span className="text-sm text-[#f9e0d3] mb-4">Inter</span>
          <span className="text-8xl text-[#f9e0d3] font-sans mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700">
            Aa
          </span>
        </div>

        {/* Shape Card */}
        <div className="col-span-4 row-span-2 bg-[#f9e0d3] rounded-lg p-6 flex items-center justify-center hover:shadow-subtle transition-all duration-500">
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-700">
            <div className="w-64 h-32 bg-[#8d543d] rounded-b-full mb-4 hover:shadow-md transition-all duration-500"></div>
            <div className="w-64 h-32 bg-[#d8a48f] rounded-b-full hover:shadow-md transition-all duration-500"></div>
          </div>
        </div>

        {/* Description Card */}
        <div className="col-span-8 bg-[#f9e0d3] rounded-lg p-6 hover:shadow-subtle transition-all duration-500">
          <h2 className="text-3xl font-serif text-[#4e2e20] mb-3 tracking-tight leading-relaxed">
            Soft tones, quiet intent, a balance of form and feeling.
          </h2>
          <p className="text-[#4e2e20] leading-relaxed">
            Dusty peach evokes calm restraint. It&apos;s not trying to be loud or sharp. Instead, it sits comfortably between
            eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.
          </p>
        </div>

        {/* Audio Card */}
        <div className="col-span-8 bg-[#d8a48f] rounded-lg p-6 flex items-center justify-center hover:shadow-subtle transition-all duration-500 group">
          <button className="flex flex-col items-center text-[#4e2e20] transition-all duration-300 hover:scale-110">
            <Play className="h-12 w-12 mb-2" fill="#4e2e20" />
            <span>lofi loop</span>
          </button>
        </div>

        {/* Color Swatches */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-[#f3ded3] rounded-lg p-4 flex items-end justify-center hover:shadow-subtle transition-all duration-500 hover:scale-105">
            <span className="text-sm text-[#8d543d]">#8D543D</span>
          </div>
          <div className="bg-[#d8a48f] rounded-lg p-4 flex items-end justify-center hover:shadow-subtle transition-all duration-500 hover:scale-105">
            <span className="text-sm text-[#8d543d]">#F9E0D3</span>
          </div>
          <div className="bg-[#8d543d] rounded-lg p-4 flex items-end justify-center hover:shadow-subtle transition-all duration-500 hover:scale-105">
            <span className="text-sm text-[#f9e0d3]">#F9E0D3</span>
          </div>
          <div className="bg-[#4e2e20] rounded-lg p-4 flex items-end justify-center hover:shadow-subtle transition-all duration-500 hover:scale-105">
            <span className="text-sm text-[#f9e0d3]">#F9E0D3</span>
          </div>
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
