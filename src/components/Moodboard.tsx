"use client"

import Link from "next/link"
import { ArrowLeft, Play, Shuffle, Upload } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { getAudioForMood } from './mood-audio-map';
import { Howl } from "howler"
import html2canvas from "html2canvas"
import { Toast } from "@/components/ui/toast"

import { palettes } from "@/data/palettes"



// Helper: For a given background and swatch array, returns the darkest swatch if bg is light (L>0.5), or the lightest swatch if bg is dark.
function getSwatchLabelColor(bg: string, swatches: string[]): string {
  if (!swatches || swatches.length === 0) return '#000';
  // Sort by OKLCH lightness
  const byLightness = [...swatches].sort((a, b) => {
    const lA = hexToOklch(a)?.l ?? 0;
    const lB = hexToOklch(b)?.l ?? 0;
    return lA - lB;
  });
  const lBg = hexToOklch(bg)?.l ?? 0;
  if (lBg > 0.5) {
    // Light bg, use darkest swatch
    return byLightness[0];
  } else {
    // Dark bg, use lightest swatch
    return byLightness[byLightness.length - 1];
  }
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

import { Palette } from '@/data/palettes';
type MoodboardProps = {
  mood?: string;
  palette?: Palette;
  onBack?: () => void;
}

import { converter } from 'culori';

// Create a converter for hex to oklch
const hexToOklch = converter('oklch');

// Get delta L (lightness) between two colors in OKLCH
function deltaL(hex1: string, hex2: string) {
  const c1 = hexToOklch(hex1);
  const c2 = hexToOklch(hex2);
  if (!c1 || !c2) return 0;
  return Math.abs(c1.l - c2.l);
}

// Return the palette swatch with the best accessible contrast; fallback to black/white if needed
function getContrastSwatch(bg: string, swatches: string[]) {
  let best = swatches[0];
  let bestDelta = -1;
  for (const s of swatches) {
    if (s === bg) continue;
    const dL = deltaL(bg, s);
    if (dL > bestDelta) {
      bestDelta = dL;
      best = s;
    }
  }
  return best;
}


// Utility: Sort swatches by OKLCH lightness (L), lightest first
function spreadSwatchesByLightness(swatches: string[]): string[] {
  return [...swatches].sort((a, b) => {
    const lA = hexToOklch(a)?.l ?? 0;
    const lB = hexToOklch(b)?.l ?? 0;
    return lA - lB; // ascending: lightest first
  });
}

export default function Moodboard({ mood, palette, onBack }: MoodboardProps) {
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

  // Always use local palettes for presets, API palette for generated moods
  const presetMoods = ["stone", "celestial", "dusty peach"];
  let resolvedPalette: Palette | null = null;
  if (mood && presetMoods.includes(mood)) {
    resolvedPalette = palettes[mood as keyof typeof palettes];
  } else if (palette) {
    resolvedPalette = palette;
  }

  const sortedSwatches = spreadSwatchesByLightness(resolvedPalette?.swatches || []);

  console.log('Mood:', mood, 'Resolved Palette:', resolvedPalette);
  if (!resolvedPalette) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold mb-2">No mood selected</div>
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
            onClick={() => {
              if (soundRef.current) {
                soundRef.current.stop();
                soundRef.current.unload();
              }
              onBack();
            }}
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
        {resolvedPalette.name}
      </h1>

      {/* Helper to pick most contrasting swatch for text */}


      {/* Grid Layout matching the mockup */}
      <div className="grid grid-cols-12 gap-4">
        {/* Font Card 1 */}
        <div className="md:col-span-3 col-span-6 rounded-lg" style={{ background: sortedSwatches[0] }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="mb-4 font-serif" style={{ color: getContrastSwatch(sortedSwatches[0], sortedSwatches), fontSize: 18 }}>{resolvedPalette.fontPrimary}</span>
            <span
  className={`text-8xl mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${fontMap[resolvedPalette.fontPrimary]?.className ?? ''}`}
  style={{ color: getContrastSwatch(sortedSwatches[0], sortedSwatches) }}
>
  Aa
</span>
          </div>
        </div>

        {/* Font Card 2 */}
        <div className="md:col-span-3 col-span-6 rounded-lg" style={{ background: sortedSwatches[1] }}>
          <div className="p-6 flex flex-col  transition-all duration-500 group">
            <span className="mb-4" style={{ color: getContrastSwatch(sortedSwatches[1], sortedSwatches), fontSize: 18 }}>{resolvedPalette.fontSecondary}</span>
            <span
  className={`text-8xl mt-auto group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${fontMap[resolvedPalette.fontSecondary]?.className ?? ''}`}
  style={{ color: getContrastSwatch(sortedSwatches[1], sortedSwatches) }}
>
  Aa
</span>
          </div>
        </div>

        {/* Shape Card */}
        <div className="md:col-span-6 col-span-12 row-span-2 rounded-lg" style={{ background: resolvedPalette.background }}>
          <div className="flex items-center justify-center h-full w-full min-h-[350px] transition-all duration-500">
            <span className="inline-block">
  <motion.div
    whileHover={{ scale: 1.08, rotate: 6 }}
    whileTap={{ scale: 0.96, rotate: 0 }}
    transition={{ type: "spring", stiffness: 250, damping: 18 }}
    className="cursor-pointer"
    aria-label={resolvedPalette.name + " illustration"}
    style={{ width: 240, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    {typeof resolvedPalette.svg === 'function'
  ? resolvedPalette.svg({ width: 240, height: 260 })
  : typeof resolvedPalette.svg === 'string' && resolvedPalette.svg
    ? <img src={resolvedPalette.svg} width={240} height={260} alt={resolvedPalette.name + ' illustration'} />
    : null}
  </motion.div>
</span>
          </div>
        </div>

        {/* Description Card */}
        <div className="md:col-span-6 col-span-12 rounded-lg" style={{ background: resolvedPalette.background }}>
          <div className="p-6  transition-all duration-500">
            <h2
  className={`text-3xl mb-3 tracking-tight ${fontMap[resolvedPalette.fontPrimary]?.className ?? ''}`}
  style={{ color: getContrastSwatch(resolvedPalette.background, resolvedPalette.swatches), fontWeight: 600 }}
>
  Soft tones, quiet intent, a balance of form and feeling.
</h2>
            <p
  className={`leading-relaxed ${fontMap[resolvedPalette.fontSecondary]?.className ?? ''}`}
  style={{ color: getContrastSwatch(resolvedPalette.background, resolvedPalette.swatches) }}
>
  {resolvedPalette.name} evokes calm restraint. It&apos;s not trying to be loud or sharp. Instead, it sits comfortably between eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.
</p>
          </div>
        </div>

        {/* Audio Card */}
        <div className="md:col-span-6 col-span-12 rounded-lg" style={{ background: resolvedPalette.accent }}>
           <div className="p-6 flex flex-col items-center justify-center h-full w-full transition-all duration-500 group">
             <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: 220 }}>
                <div className="flex flex-col items-center justify-center" style={{ height: 64 }}>
                  {!isPlaying ? (
                    <motion.button
                      className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                      style={{ color: resolvedPalette.headingColor, background: 'transparent' }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      aria-label={`Play ${resolvedPalette.audio.replace(/[-_]/g, ' ').replace(/\.mp3$/, '')}`}
                      onClick={() => {
                        if (!soundRef.current) {
                          const sound = new Howl({
                            src: ["/audio/" + getAudioForMood(mood || resolvedPalette.name || "")],
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
                      <Play className="h-16 w-16 mb-0" fill={getContrastSwatch(resolvedPalette.accent, resolvedPalette.swatches)} />
                    </motion.button>
                  ) : (
                    <motion.button
                      className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                      style={{ color: resolvedPalette.headingColor, background: 'transparent' }}
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
                       <svg className="h-16 w-16 mb-0" viewBox="0 0 24 24" fill={getContrastSwatch(resolvedPalette.accent, resolvedPalette.swatches)} stroke={getContrastSwatch(resolvedPalette.accent, resolvedPalette.swatches)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ borderRadius: 8, color: getContrastSwatch(resolvedPalette.accent, resolvedPalette.swatches) }}>
                         <rect x="6" y="6" width="12" height="12" rx="3" />
                       </svg>
                    </motion.button>
                  )}
                </div>
                <div
  className={`text-center ${fontMap[resolvedPalette.fontSecondary]?.className ?? ''}`}
  style={{ color: getContrastSwatch(resolvedPalette.accent, resolvedPalette.swatches), fontSize: 18, fontWeight: 400, marginTop: 0 }}
>
  {isPlaying
    ? <>Now playing: {resolvedPalette.name} soundtrack</>
    : <>{resolvedPalette.name} soundtrack</>
  }
</div>
              </div>
            </div>
          </div>

        {/* Color Swatches */}
        <motion.div
          className="md:col-span-6 col-span-12 grid grid-cols-2 gap-4"
        >
          {resolvedPalette.swatches.map((color: string, i: number) => (
            <motion.div
  key={color}
  className={`rounded-lg flex items-start justify-start text-lg border border-transparent transition-all duration-300 select-text cursor-pointer ${fontMap[resolvedPalette.fontSecondary]?.className ?? ''}`}
  style={{
    background: color,
    color: getSwatchLabelColor(color, resolvedPalette.swatches),
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
    } catch {

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
