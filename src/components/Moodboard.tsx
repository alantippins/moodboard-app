"use client";

import Link from "next/link";
import { ArrowLeft, Play, Upload } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { getAudioForMood } from "./mood-audio-map";
import { Howl } from "howler";
import html2canvas from "html2canvas";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";

import { palettes } from "@/data/palettes";

// Helper: For a given background and swatch array, returns the darkest swatch if bg is light (L>0.5), or the lightest swatch if bg is dark.
function getSwatchLabelColor(bg: string, swatches: string[]): string {
  if (!swatches || swatches.length === 0) return "#000";
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

import {
  Cormorant_Garamond,
  Montserrat,
  Playfair_Display,
  Inter,
  Space_Grotesk,
  Courier_Prime,
} from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontMap: Record<string, { className: string }> = {
  "Cormorant Garamond": cormorant,
  Montserrat: montserrat,
  "Playfair Display": playfair,
  Inter: inter,
  "Space Grotesk": spaceGrotesk,
  "Courier Prime": courierPrime,
};

import { Palette } from "@/data/palettes";
type MoodboardProps = {
  mood?: string;
  palette?: Palette;
  onBack?: () => void;
};

import { converter } from "culori";

// Create a converter for hex to oklch
const hexToOklch = converter("oklch");

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

// Analyze word sentiment to determine mood category
function analyzeMoodWord(word: string): string {
  // Convert to lowercase for matching
  const lowerWord = word.toLowerCase();

  // Positive/uplifting words
  const positiveWords = [
    "joy",
    "happy",
    "bright",
    "vibrant",
    "calm",
    "peace",
    "serene",
    "tranquil",
    "gentle",
    "soft",
    "warm",
    "light",
    "fresh",
    "spring",
    "summer",
    "bloom",
    "blossom",
    "delight",
    "elegant",
    "grace",
    "harmony",
    "balance",
    "zen",
    "dream",
    "hope",
  ];

  // Negative/intense words
  const negativeWords = [
    "disaster",
    "chaos",
    "dark",
    "gloomy",
    "storm",
    "tension",
    "conflict",
    "crisis",
    "danger",
    "fear",
    "horror",
    "terror",
    "dread",
    "anxiety",
    "stress",
    "panic",
    "rage",
    "anger",
    "fury",
    "wrath",
    "destruction",
    "ruin",
    "decay",
    "death",
    "end",
    "nightmare",
    "broken",
    "shattered",
    "twisted",
    "corrupt",
    "toxic",
    "poison",
  ];

  // Neutral/ambiguous words
  const neutralWords = [
    "stone",
    "earth",
    "water",
    "fire",
    "air",
    "metal",
    "wood",
    "nature",
    "urban",
    "city",
    "street",
    "modern",
    "vintage",
    "retro",
    "classic",
    "minimal",
    "abstract",
    "organic",
    "digital",
    "tech",
    "future",
    "past",
  ];

  // Energetic/dynamic words
  const energeticWords = [
    "energy",
    "power",
    "force",
    "dynamic",
    "electric",
    "spark",
    "flash",
    "bold",
    "strong",
    "intense",
    "vivid",
    "active",
    "motion",
    "movement",
    "rhythm",
    "beat",
    "pulse",
    "flow",
    "rush",
    "speed",
    "swift",
    "quick",
  ];

  // Check for word matches in each category
  for (const positiveWord of positiveWords) {
    if (lowerWord.includes(positiveWord)) return "positive";
  }

  for (const negativeWord of negativeWords) {
    if (lowerWord.includes(negativeWord)) return "negative";
  }

  for (const energeticWord of energeticWords) {
    if (lowerWord.includes(energeticWord)) return "energetic";
  }

  for (const neutralWord of neutralWords) {
    if (lowerWord.includes(neutralWord)) return "neutral";
  }

  // Default to neutral if no match found
  return "neutral";
}

// Generate a heading based on palette characteristics and mood word
function generateHeading(palette: Palette): string {
  const headings: Record<string, Record<string, string[]>> = {
    positive: {
      bright: [
        "Joyful expressions, vivid energy, a celebration of light.",
        "Vibrant optimism, uplifting presence, an embrace of possibility.",
        "Radiant clarity, hopeful voice, a testament to brightness.",
      ],
      muted: [
        "Gentle contentment, quiet joy, a harmony of subtle tones.",
        "Soft whispers of happiness, understated delight, a thoughtful approach.",
        "Peaceful nuance, serene beauty, an exercise in quiet joy.",
      ],
      dark: [
        "Deep satisfaction, mysterious allure, a study in rich emotion.",
        "Profound contentment, contemplative warmth, an exploration of depth.",
        "Intense fulfillment, comforting presence, a statement of completeness.",
      ],
      light: [
        "Airy happiness, delicate touch, an expression of lightness.",
        "Ethereal joy, pristine simplicity, a breath of fresh delight.",
        "Luminous optimism, open possibility, an invitation to happiness.",
      ],
      warm: [
        "Radiant warmth, inviting embrace, a feeling of comfort.",
        "Glowing contentment, nurturing presence, a sense of belonging.",
        "Sunset joy, emotional resonance, a connection to happiness.",
      ],
      cool: [
        "Refreshing satisfaction, calm clarity, a moment of peace.",
        "Serene waters of joy, composed balance, a thoughtful happiness.",
        "Cool serenity, tranquil approach, a considered contentment.",
      ],
    },
    negative: {
      bright: [
        "Jarring contrast, unsettling energy, a statement of disruption.",
        "Tense vibrance, uneasy presence, an assertion of conflict.",
        "Striking discord, challenging voice, a confrontation with chaos.",
      ],
      muted: [
        "Subdued tension, quiet unease, a balance of conflict and restraint.",
        "Muffled warnings, understated distress, an approach to disorder.",
        "Subtle disquiet, restrained turmoil, an exercise in controlled chaos.",
      ],
      dark: [
        "Deep dissonance, ominous allure, a study in shadow and threat.",
        "Rich depths of tension, foreboding mood, an exploration of darkness.",
        "Intense disturbance, threatening presence, a powerful statement of unease.",
      ],
      light: [
        "Deceptive lightness, fragile facade, an expression of hidden danger.",
        "Faded warning, brittle simplicity, a breath before the storm.",
        "Spectral unease, hollow space, an invitation to uncertainty.",
      ],
      warm: [
        "Feverish heat, uncomfortable closeness, a feeling of tension.",
        "Burning discomfort, oppressive presence, a sense of approaching danger.",
        "Inflammatory hues, destructive resonance, a connection to chaos.",
      ],
      cool: [
        "Icy detachment, alienating calm, a moment of isolation.",
        "Frigid waters, unbalanced stillness, a distant perspective.",
        "Cold precision, clinical approach, a design of calculated disorder.",
      ],
    },
    energetic: {
      bright: [
        "Bold dynamism, electric energy, a statement of power.",
        "Vibrant force, kinetic presence, an assertion of movement.",
        "Striking intensity, energized voice, a celebration of action.",
      ],
      muted: [
        "Contained power, quiet strength, a balance of force and control.",
        "Potential energy, understated intensity, a thoughtful approach to power.",
        "Subtle dynamism, restrained vigor, an exercise in controlled force.",
      ],
      dark: [
        "Deep power, magnetic allure, a study in concentrated force.",
        "Rich intensity, potent mood, an exploration of primal energy.",
        "Focused strength, commanding presence, a powerful statement.",
      ],
      light: [
        "Swift lightness, nimble touch, an expression of agile energy.",
        "Ethereal force, dynamic simplicity, a breath of active air.",
        "Luminous motion, kinetic possibility, an invitation to movement.",
      ],
      warm: [
        "Radiant energy, active embrace, a feeling of vital heat.",
        "Glowing intensity, energetic presence, a sense of constant motion.",
        "Fiery hues, passionate resonance, a connection to primal force.",
      ],
      cool: [
        "Electric clarity, focused calm, a moment of directed power.",
        "Flowing currents, dynamic balance, a controlled perspective.",
        "Cool precision, calculated approach, a designed intensity.",
      ],
    },
    neutral: {
      bright: [
        "Bold expressions, vivid energy, a statement of purpose.",
        "Vibrant tones, dynamic presence, an assertion of identity.",
        "Striking clarity, confident voice, a celebration of color.",
      ],
      muted: [
        "Soft tones, quiet intent, a balance of form and feeling.",
        "Gentle whispers, understated elegance, a thoughtful approach.",
        "Subtle nuance, restrained beauty, an exercise in refinement.",
      ],
      dark: [
        "Deep resonance, mysterious allure, a study in contrast.",
        "Rich depths, contemplative mood, an exploration of shadow.",
        "Intense focus, dramatic presence, a powerful statement.",
      ],
      light: [
        "Airy lightness, delicate touch, an expression of clarity.",
        "Ethereal glow, pristine simplicity, a breath of fresh air.",
        "Luminous space, open possibility, an invitation to imagine.",
      ],
      warm: [
        "Radiant warmth, inviting embrace, a feeling of comfort.",
        "Glowing embers, nurturing presence, a sense of belonging.",
        "Sunset hues, emotional resonance, a connection to memory.",
      ],
      cool: [
        "Crisp clarity, refreshing calm, a moment of reflection.",
        "Serene waters, composed balance, a thoughtful perspective.",
        "Cool precision, intellectual approach, a considered design.",
      ],
    },
  };

  // Determine mood sentiment from palette name
  const moodSentiment = analyzeMoodWord(palette.name);

  // Determine palette color characteristics
  let colorType = "muted"; // default

  // Analyze palette to determine its primary characteristic
  const avgLightness =
    palette.swatches.reduce((sum, swatch) => {
      return sum + (hexToOklch(swatch)?.l ?? 0.5);
    }, 0) / palette.swatches.length;

  const avgChroma =
    palette.swatches.reduce((sum, swatch) => {
      return sum + (hexToOklch(swatch)?.c ?? 0.1);
    }, 0) / palette.swatches.length;

  // Determine warmth/coolness (hue)
  const hues = palette.swatches.map((swatch) => hexToOklch(swatch)?.h ?? 0);
  const warmHues = hues.filter((h) => h >= 20 && h <= 180);
  const isWarm = warmHues.length > hues.length / 2;

  if (avgChroma > 0.15) {
    colorType = "bright";
  } else if (avgLightness > 0.7) {
    colorType = "light";
  } else if (avgLightness < 0.3) {
    colorType = "dark";
  } else if (isWarm) {
    colorType = "warm";
  } else {
    colorType = "cool";
  }

  // Get random heading from the appropriate category
  const sentimentOptions = headings[moodSentiment] || headings.neutral;
  const options = sentimentOptions[colorType] || sentimentOptions.muted;
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

// Generate a description based on palette name and characteristics
function generateDescription(palette: Palette): string {
  const name = palette.name;
  const moodSentiment = analyzeMoodWord(name);

  // Analyze palette to determine its characteristics
  const avgLightness =
    palette.swatches.reduce((sum, swatch) => {
      return sum + (hexToOklch(swatch)?.l ?? 0.5);
    }, 0) / palette.swatches.length;

  const avgChroma =
    palette.swatches.reduce((sum, swatch) => {
      return sum + (hexToOklch(swatch)?.c ?? 0.1);
    }, 0) / palette.swatches.length;

  // Determine palette qualities based on color characteristics
  const colorQualities = [];

  if (avgChroma > 0.15) {
    colorQualities.push("vibrant", "expressive", "bold");
  } else {
    colorQualities.push("restrained", "subtle", "nuanced");
  }

  if (avgLightness > 0.7) {
    colorQualities.push("airy", "light", "open");
  } else if (avgLightness < 0.3) {
    colorQualities.push("deep", "rich", "intense");
  } else {
    colorQualities.push("balanced", "harmonious", "measured");
  }

  // Determine mood-specific qualities based on sentiment
  const moodQualities: Record<string, string[]> = {
    positive: [
      "uplifting",
      "joyful",
      "delightful",
      "pleasant",
      "cheerful",
      "optimistic",
      "serene",
      "tranquil",
    ],
    negative: [
      "tense",
      "chaotic",
      "unsettling",
      "disruptive",
      "turbulent",
      "challenging",
      "complex",
      "dramatic",
    ],
    energetic: [
      "dynamic",
      "powerful",
      "forceful",
      "energetic",
      "active",
      "lively",
      "vigorous",
      "spirited",
    ],
    neutral: [
      "thoughtful",
      "considered",
      "balanced",
      "deliberate",
      "composed",
      "structured",
      "defined",
      "precise",
    ],
  };

  // Combine color and mood qualities
  const qualities = [
    ...colorQualities,
    ...(moodQualities[moodSentiment] || moodQualities.neutral),
  ];

  // Pick random qualities
  const quality1 = qualities[Math.floor(Math.random() * qualities.length)];
  let quality2 = qualities[Math.floor(Math.random() * qualities.length)];
  while (quality2 === quality1) {
    quality2 = qualities[Math.floor(Math.random() * qualities.length)];
  }

  // Generate description templates based on sentiment
  const templates: Record<string, string[]> = {
    positive: [
      `${name} radiates with ${quality1} ${quality2}. It brings a sense of uplift and clarity, creating a visual language that feels both fresh and inviting. A palette that inspires optimism.`,
      `${name} captures the essence of ${quality1} joy. Each color speaks with ${quality2} harmony, creating a space where positivity and balance coexist naturally.`,
      `The spirit of ${name} lies in its ${quality1} character. It creates environments that feel ${quality2} and welcoming, inviting both celebration and peaceful reflection.`,
    ],
    negative: [
      `${name} confronts with ${quality1} ${quality2}. It doesn't shy away from tension or contrast. Instead, it explores the boundary between order and disruption. A palette that challenges perception.`,
      `${name} embodies a sense of ${quality1} intensity. Each color speaks with ${quality2} force, creating a visual language that acknowledges complexity and emotional depth.`,
      `The power of ${name} emerges from its ${quality1} nature. It creates spaces that feel ${quality2} and provocative, inviting both introspection and a reconsideration of balance.`,
    ],
    energetic: [
      `${name} pulses with ${quality1} ${quality2}. It captures movement and vitality, creating a visual rhythm that feels both dynamic and purposeful. A palette that refuses to stand still.`,
      `${name} embodies pure ${quality1} energy. Each color speaks with ${quality2} intensity, creating a visual current that propels the eye forward with deliberate momentum.`,
      `The force of ${name} comes from its ${quality1} character. It creates environments that feel ${quality2} and kinetic, inviting both action and a sense of constant possibility.`,
    ],
    neutral: [
      `${name} evokes ${quality1} ${quality2}. It's not trying to be loud or sharp. Instead, it sits comfortably between eras. Modern in shape, nostalgic in warmth. The kind of palette that breathes.`,
      `${name} captures a sense of ${quality1} purpose. Each color speaks with ${quality2} clarity, creating a visual language that feels both contemporary and timeless.`,
      `The essence of ${name} lies in its ${quality1} character. It creates spaces that feel ${quality2} and intentional, inviting both reflection and forward movement.`,
    ],
  };

  // Select template based on sentiment
  const sentimentTemplates = templates[moodSentiment] || templates.neutral;
  return sentimentTemplates[
    Math.floor(Math.random() * sentimentTemplates.length)
  ];
}

export default function Moodboard({ mood, palette, onBack }: MoodboardProps) {
  const presetMoods = useMemo(() => ["stone", "celestial", "dusty peach"], []);
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const exportContentRef = useRef<HTMLDivElement | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleExport = async () => {
    if (exportContentRef.current) {
      const canvas = await html2canvas(exportContentRef.current, {
        backgroundColor: "#fff",
        useCORS: true,
        scale: 2, // higher res export
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `moodboard-${mood}.png`;
      link.click();
    }
  };

  useEffect(() => {
    setMounted(true);

    // Add subtle background noise texture
    const noise = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const value = Math.floor(Math.random() * 255);
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
          data[i + 3] = Math.floor(Math.random() * 10); // Very subtle opacity
        }

        ctx.putImageData(imgData, 0, 0);
        document.body.style.backgroundImage = `url(${canvas.toDataURL(
          "image/png"
        )})`;
        document.body.style.backgroundRepeat = "repeat";
      }
    };

    noise();
  }, []);

  // Always use local palettes for presets, API palette for generated moods
  const resolvedPalette = useMemo(() => {
    if (!mounted) return null;

    if (mood && presetMoods.includes(mood)) {
      return palettes[mood as keyof typeof palettes];
    } else if (palette) {
      return palette;
    }
    return null;
  }, [mood, palette, presetMoods, mounted]);

  // Memoize heading and description based on resolved palette
  const heading = useMemo(
    () => (resolvedPalette ? generateHeading(resolvedPalette) : ""),
    [resolvedPalette]
  );

  const description = useMemo(
    () => (resolvedPalette ? generateDescription(resolvedPalette) : ""),
    [resolvedPalette]
  );

  // Reverse so that 0 is lightest, 3 is darkest
  const sortedSwatches = useMemo(
    () => spreadSwatchesByLightness(resolvedPalette?.swatches || []).reverse(),
    [resolvedPalette]
  );

  if (!mounted || !resolvedPalette) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold mb-2">No mood selected</div>
        <div className="text-gray-500">
          Please select a mood to see its moodboard.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-white p-6 md:p-12 max-w-5xl mx-auto font-sans"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header with subtle animation */}
      <div ref={exportRef}>
        <header className="flex md:flex-row md:justify-between md:items-center mb-8 items-center">
          <div className="flex items-center md:items-center md:flex-row mr-6">
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
                className="flex items-center text-[#222] hover:opacity-80 transition-all duration-300 group bg-transparent border-0 m-0 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform duration-300" />
                <span className="text-sm tracking-wide">Try a new word</span>
              </button>
            ) : (
              <Link
                href="#"
                className="flex items-center text-[#222] hover:opacity-75 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform duration-300" />
                <span className="text-sm tracking-wide">Try a new word</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button
              className="flex items-center text-[#222] hover:opacity-80 transition-all duration-300 group cursor-pointer"
              onClick={handleExport}
            >
              <Upload className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
              <span className="text-sm tracking-wide cursor-pointer">
                Export
              </span>
            </button>
          </div>
        </header>

        {/* Only export this area for image */}
        <div
          ref={exportContentRef}
          className="bg-white"
          style={{ maxWidth: "1000px", margin: "0 auto" }}
        >
          {/* Title with animation */}
          <h1 className="text-7xl text-black mb-10 tracking-tight">
            {resolvedPalette.name}
          </h1>

          {/* Helper to pick most contrasting swatch for text */}

          {/* Grid Layout matching the mockup */}

          {/* ...all other content (grid, cards, footer) ... */}
          <div className="grid grid-cols-12 gap-4">
            {/* Font Card 1 */}
            <div
              className="md:col-span-3 col-span-6 rounded-lg h-72"
              style={{ background: sortedSwatches[3] }}
            >
              <div className="p-6 flex flex-col justify-between items-start h-full transition-all duration-500 group">
                <span
                  className={
                    fontMap[resolvedPalette.fontPrimary]?.className ?? ""
                  }
                  style={{ color: sortedSwatches[0], fontSize: 18 }}
                >
                  {resolvedPalette.fontPrimary}
                </span>
                <span
                  className={`text-8xl group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${
                    fontMap[resolvedPalette.fontPrimary]?.className ?? ""
                  }`}
                  style={{ color: sortedSwatches[0] }}
                >
                  Aa
                </span>
              </div>
            </div>

            {/* Font Card 2 */}
            <div
              className="md:col-span-3 col-span-6 rounded-lg h-72"
              style={{ background: sortedSwatches[1] }}
            >
              <div className="p-6 flex flex-col justify-between items-start h-full transition-all duration-500 group">
                <span
                  className={
                    fontMap[resolvedPalette.fontSecondary]?.className ?? ""
                  }
                  style={{
                    color: getContrastSwatch(sortedSwatches[1], sortedSwatches),
                    fontSize: 18,
                  }}
                >
                  {resolvedPalette.fontSecondary}
                </span>
                <span
                  className={`text-8xl group-hover:scale-105 transition-transform origin-bottom-left duration-700 ${
                    fontMap[resolvedPalette.fontSecondary]?.className ?? ""
                  }`}
                  style={{
                    color: getContrastSwatch(sortedSwatches[1], sortedSwatches),
                  }}
                >
                  Aa
                </span>
              </div>
            </div>

            {/* Shape Card */}
            <div
              className="md:col-span-6 col-span-12 row-span-2 rounded-lg"
              style={{ background: resolvedPalette.background }}
            >
              <div className="flex items-center justify-center h-full w-full min-h-[350px] transition-all duration-500">
                <span className="inline-block">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 6 }}
                    whileTap={{ scale: 0.96, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    className="cursor-pointer"
                    aria-label={resolvedPalette.name + " illustration"}
                    style={{
                      width: 240,
                      height: 260,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {typeof resolvedPalette.svg === "function" ? (
                      resolvedPalette.svg({ width: 240, height: 260 })
                    ) : typeof resolvedPalette.svg === "string" &&
                      resolvedPalette.svg ? (
                      <Image
                        src={resolvedPalette.svg}
                        width={240}
                        height={260}
                        alt={resolvedPalette.name + " illustration"}
                      />
                    ) : null}
                  </motion.div>
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div
              className="md:col-span-6 col-span-12 rounded-lg"
              style={{ background: resolvedPalette.background }}
            >
              <div className="p-6  transition-all duration-500">
                <h2
                  className={`text-3xl mb-3 tracking-tight ${
                    fontMap[resolvedPalette.fontPrimary]?.className ?? ""
                  }`}
                  style={{
                    color: getContrastSwatch(
                      resolvedPalette.background,
                      resolvedPalette.swatches
                    ),
                    fontWeight: 600,
                  }}
                >
                  {heading}
                </h2>
                <p
                  className={`leading-relaxed ${
                    fontMap[resolvedPalette.fontSecondary]?.className ?? ""
                  }`}
                  style={{
                    color: getContrastSwatch(
                      resolvedPalette.background,
                      resolvedPalette.swatches
                    ),
                  }}
                >
                  {description}
                </p>
              </div>
            </div>

            {/* Audio Card */}
            <div
              className="md:col-span-6 col-span-12 rounded-lg"
              style={{ background: resolvedPalette.accent }}
            >
              <div className="p-6 flex flex-col items-center justify-center h-full w-full transition-all duration-500 group">
                <div
                  className="flex flex-col items-center justify-center w-full h-full"
                  style={{ minHeight: 220 }}
                >
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{ height: 64 }}
                  >
                    {!isPlaying ? (
                      <motion.button
                        className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                        style={{
                          color: resolvedPalette.headingColor,
                          background: "transparent",
                        }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                        aria-label={`Play ${resolvedPalette.audio
                          .replace(/[-_]/g, " ")
                          .replace(/\.mp3$/, "")}`}
                        onClick={() => {
                          if (!soundRef.current) {
                            const sound = new Howl({
                              src: [
                                "/audio/" +
                                  getAudioForMood(
                                    mood || resolvedPalette.name || ""
                                  ),
                              ],
                              onend: () => setIsPlaying(false),
                              onloaderror: () => {
                                alert(
                                  "Audio file could not be loaded. Please check file path."
                                );
                                setIsPlaying(false);
                              },
                            });
                            soundRef.current = sound;
                          }
                          soundRef.current.play();
                          setIsPlaying(true);
                        }}
                      >
                        <Play
                          className="h-16 w-16 mb-0"
                          fill={getContrastSwatch(
                            resolvedPalette.accent,
                            resolvedPalette.swatches
                          )}
                          stroke="none"
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        className="flex flex-col items-center justify-center transition-all duration-300 outline-none ring-0 focus:ring-0 focus-visible:ring-0 cursor-pointer"
                        style={{
                          color: resolvedPalette.headingColor,
                          background: "transparent",
                          border: "none",
                          boxShadow: "none",
                        }}
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
                        <svg
                          className="h-16 w-16 mb-0"
                          viewBox="0 0 24 24"
                          fill={getContrastSwatch(
                            resolvedPalette.accent,
                            resolvedPalette.swatches
                          )}
                          stroke={getContrastSwatch(
                            resolvedPalette.accent,
                            resolvedPalette.swatches
                          )}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{
                            borderRadius: 8,
                            color: getContrastSwatch(
                              resolvedPalette.accent,
                              resolvedPalette.swatches
                            ),
                          }}
                        >
                          <rect x="6" y="6" width="12" height="12" rx="3" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                  <div
                    className={`text-center ${
                      fontMap[resolvedPalette.fontSecondary]?.className ?? ""
                    }`}
                    style={{
                      color: getContrastSwatch(
                        resolvedPalette.accent,
                        resolvedPalette.swatches
                      ),
                      fontSize: 18,
                      fontWeight: 400,
                      marginTop: 0,
                    }}
                  >
                    {isPlaying ? (
                      <>Now playing: {resolvedPalette.name} soundtrack</>
                    ) : (
                      <>{resolvedPalette.name} soundtrack</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <motion.div className="md:col-span-6 col-span-12 grid grid-cols-2 gap-4">
              {sortedSwatches.map((color: string, i: number) => (
                <motion.div
                  key={color}
                  className={`rounded-xl flex items-start justify-start text-lg border border-transparent transition-all duration-200 select-text cursor-pointer hover:brightness-95 ${
                    fontMap[resolvedPalette.fontSecondary]?.className ?? ""
                  }`}
                  style={{
                    background: color,
                    color: getSwatchLabelColor(color, sortedSwatches),
                    padding: 24,
                    fontSize: 18,
                  }}
                  aria-label={color}
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.96 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.37, ease: "easeOut" },
                    },
                  }}
                  whileHover={{ scale: 1.01 }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color.toUpperCase());
                      setCopiedIndex(i);
                      setShowToast(true);
                      setToastMsg(`Copied ${color.toUpperCase()} to clipboard`);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    } catch {
                      setToastMsg("Failed to copy");
                      setShowToast(true);
                    }
                  }}
                >
                  {copiedIndex === i ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9.5 17L4 11.5" />
                    </svg>
                  ) : (
                    color.toUpperCase()
                  )}
                </motion.div>
              ))}
            </motion.div>
            <Toast
              message={toastMsg}
              show={showToast}
              onClose={() => setShowToast(false)}
            />
          </div>
        </div>
        <footer className="mt-12 text-right">
          {/* Footer with animation */}
          <p className="text-sm text-[#222]">
            <Link
              href="https://www.alantippins.com"
              className="font-medium hover:opacity-75 transition-colors duration-200 relative inline-block"
            >
              Created by alantippins.com
            </Link>
          </p>
        </footer>
      </div>{" "}
      {/* End exportContentRef div */}
    </motion.div>
  );
}
