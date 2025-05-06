"use client"

import Link from "next/link"
import { ArrowLeft, Play, Shuffle, Upload } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Howl } from "howler"
import html2canvas from "html2canvas"
import { Toast } from "@/components/ui/toast"

import { palettes } from "@/data/palettes"

// Helper: Get luminance for a hex color
function luminance(hex: string): number {
  const c = hex.replace('#', '').toUpperCase();
  const num = c.length === 3
    ? parseInt(c[0]+c[0]+c[1]+c[1]+c[2]+c[2], 16)
    : parseInt(c, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const a = [r, g, b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}

// Helper: Get swatch text color according to luminance
function getSwatchTextColor(color: string, palette: any): string {
  // Use headingColor for all but truly dark backgrounds
  return luminance(color) < 0.35
    ? palette.swatches[0]
    : palette.headingColor;
}

import { Cormorant_Garamond, Montserrat, Playfair_Display, Inter, Space_Grotesk, Courier_Prime } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '700'] });
const courierPrime = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'] });

const fontMap: Record<string, { className: string }> = {
  'Cormorant Garamond': cormorant,
  'Montserrat': montserrat,
  'Playfair Display': playfair,
  'Inter': inter,
  'Space Grotesk': spaceGrotesk,
  'Courier Prime': courierPrime,
};

type MoodboardProps = {
  mood: string;
  onBack?: () => void;
}

export default function Moodboard({ mood, onBack }: MoodboardProps) {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false)
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleExport = async () => {
    if (exportRef.current) {
      const canvas = await html2canvas(exportRef.current, { backgroundColor: null });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `moodboard-${mood}.png`;
      link.click();
    }
  };

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
    <motion.div
      className="min-h-screen bg-white p-6 md:p-12 max-w-5xl mx-auto font-sans"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header with subtle animation */}
      <div ref={exportRef}>

      <header className="flex md:flex-row md:justify-between md:items-center mb-8 items-center">
        <div className="flex items-center md:items-center md:flex-row mb-4 md:mb-0 mr-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group bg-transparent border-0 m-0 cursor-pointer"
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
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <Shuffle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm tracking-wide">Shuffle</span>
          </button>
          {/* <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group">
            <Share className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Share</span>
          </button> */}
          <button className="flex items-center text-[#4e2e20] hover:opacity-80 transition-all duration-300 group" onClick={handleExport}>
            <Upload className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span className="text-sm tracking-wide">Export</span>
          </button>
        </div>
      </header>

      {/* Title with animation */}
      <h1 className="text-7xl text-black mb-10 tracking-tight">
        {palette.name}
      </h1>

      {/* Grid Layout matching the mockup */}
      <div className="grid grid-cols-12 gap-4">
        {/* Font Card 1 */}
        <div className="md:col-span-3 col-span-6 rounded-lg" style={{ background: palette.background }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="mb-4 font-serif" style={{ color: palette.headingColor, fontSize: 18 }}>{palette.fontPrimary}</span>
            <span
  className={`text-8xl mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${fontMap[palette.fontPrimary]?.className ?? ''}`}
  style={{ color: palette.headingColor }}
>
  Aa
</span>
          </div>
        </div>

        {/* Font Card 2 */}
        <div className="md:col-span-3 col-span-6 rounded-lg" style={{ background: palette.textColor }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="mb-4" style={{ color: palette.background, fontSize: 18 }}>{palette.fontSecondary}</span>
            <span
  className={`text-8xl mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${fontMap[palette.fontSecondary]?.className ?? ''}`}
  style={{ color: palette.background }}
>
  Aa
</span>
          </div>
        </div>

        {/* Shape Card */}
        <div className="md:col-span-6 col-span-12 row-span-2 rounded-lg" style={{ background: palette.background }}>
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
        <div className="md:col-span-6 col-span-12 rounded-lg" style={{ background: palette.background }}>
          <div className="p-6  transition-all duration-500">
            <h2
  className={`text-3xl mb-3 tracking-tight ${fontMap[palette.fontPrimary]?.className ?? ''}`}
  style={{ color: palette.headingColor, fontWeight: 600 }}
>
  Soft tones, quiet intent, a balance of form and feeling.
</h2>
            <p
  className={`leading-relaxed ${fontMap[palette.fontSecondary]?.className ?? ''}`}
  style={{ color: palette.headingColor }}
>
  {palette.name} evokes calm restraint. It&apos;s not trying to be loud or sharp. Instead, it sits comfortably between eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.
</p>
          </div>
        </div>

        {/* Audio Card */}
        <div className="md:col-span-6 col-span-12 rounded-lg" style={{ background: palette.accent }}>
           <div className="p-6 flex flex-col items-center justify-center h-full w-full transition-all duration-500 group">
             <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: 220 }}>
                <div className="flex flex-col items-center justify-center" style={{ height: 64 }}>
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
                      <Play className="h-16 w-16 mb-0" fill={palette.headingColor} />
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
                      <svg className="h-16 w-16 mb-0" viewBox="0 0 24 24" fill={palette.headingColor} stroke={palette.headingColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ borderRadius: 8 }}>
                        <rect x="6" y="6" width="12" height="12" rx="3" />
                      </svg>
                    </motion.button>
                  )}
                </div>
                <div
  className={`text-center ${fontMap[palette.fontSecondary]?.className ?? ''}`}
  style={{ color: palette.headingColor, fontSize: 18, fontWeight: 400, marginTop: 0 }}
>
  {isPlaying
    ? <>Now playing &quot;{palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}&quot;</>
    : <>{palette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}</>
  }
</div>
              </div>
            </div>
          </div>

        {/* Color Swatches */}
        <motion.div
          className="md:col-span-6 col-span-12 grid grid-cols-2 gap-4"
        >
          {palette.swatches.map((color: string, i: number) => (
            <motion.div
  key={color}
  className={`rounded-lg flex items-start justify-start text-lg border border-transparent transition-all duration-300 select-text cursor-pointer ${fontMap[palette.fontSecondary]?.className ?? ''}`}
  style={{
    background: color,
    color: getSwatchTextColor(color, palette),
    padding: 24,
    fontSize: 18
  }}
  aria-label={color}
  variants={{
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.37, ease: 'easeOut' } }
  }}
  whileHover={{ scale: 1.045 }}
  onClick={async () => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      setCopiedIndex(i);
      setShowToast(true);
      setToastMsg(`Copied ${color.toUpperCase()} to clipboard`);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (e) {
      setToastMsg('Failed to copy');
      setShowToast(true);
    }
  }}
>
              {copiedIndex === i ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9.5 17L4 11.5" /></svg>
              ) : (
                color.toUpperCase()
              )}
            </motion.div>
          ))}
        </motion.div>
        <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
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
    </motion.div>
  );
}
