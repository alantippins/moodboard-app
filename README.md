# Verbal

**Verbal** is a creative inspiration tool that transforms a single word into a generative micro moodboard—combining color, typography, shape, and sound suggestions to spark creativity and set the mood for your next project.

## Concept

Enter any word, and Verbal will instantly generate:

- A harmonious color palette that captures the essence of your word  
- Typography pairings that complement the mood  
- A generative shape/pattern that evokes the feeling of your word  
- A sound/music mood suggestion to complete the sensory experience  

## 👇 What It Does

You speak or type a word like `"euphoric"`, `"dusty peach"`, or `"brutalist"`.  
Verbal returns a tightly curated aesthetic response:

- 🎨 Color palette  
- 🧠 Font pairing  
- 🔊 Ambient sound  
- 🌀 Shape or visual motif  
- ✍️ Optional mood label or tagline  

## Why Verbal?

As creators, we often begin with a single word or concept. Verbal helps bridge the gap between that initial spark and a full creative direction by providing instant visual and sensory inspiration.

## 🎯 Why It Exists

Designers, writers, and musicians often start with a **feeling**—Verbal lets you *interface with feeling*.  
It's a creative toy with professional applications:

- Moodboard starter  
- Naming exercise  
- Brand tone exploration  
- Visual tone-of-voice prototype  

## Features

- **Word-based Generation**: Type any word to generate a complete micro moodboard  
- **Color Palette**: Receive a harmonious set of colors that capture the word's essence  
- **Typography**: Get font pairing suggestions that match the mood  
- **Shape Generation**: See a unique generative pattern based on the word  
- **Sound Suggestions**: Receive audio mood suggestions that complement the visual elements  

## 🗺️ Phases of Build

### Phase 1 — MVP (Weekend Build)

- Input (text)  
- Output:  
  - Color (static mapping JSON)  
  - Fonts (Google Fonts API, handpicked pairings)  
  - Sound (preloaded clips via Howler.js or HTML5 audio)  
  - Simple UI with transitions  
- Export as poster/image

### Phase 2 — Delight Layer

- Voice input via Web Speech API (`SpeechRecognition`)  
<!-- - Light/dark themes   -->
<!-- - Shuffle button for re-generating from same input   -->

### Phase 3 — Semantic Intelligence

- Use OpenAI or embedding API to semantically map unknown words to known moods  
- Add custom word bank with synonyms and modifiers  
- Allow chaining words or phrases ("dark optimism", "techno pastoral")  

### Phase 4 — Designer Tools

- Save/share moodboards  
- Drag to tweak palette or fonts  
- Export as design tokens (CSS/JSON/Sketch variables)  
- Figma plugin?  

## 🧠 Tone Mapping Logic (v1 Static Set)

| Word        | Color Tags           | Font Pairing           | Sound Mood     | Shape     |
|-------------|----------------------|-------------------------|----------------|-----------|
| Minimal     | #ffffff, #f0f0f0     | Inter + IBM Plex Mono   | Soft static    | Line grid |
| Brutalist   | #111111, #dbdbdb     | Bebas Neue + Lora       | Industrial hum | Blocky    |
| Euphoric    | #ff00ff, #ffd700     | Sora + Poppins          | Shimmer pad    | Spiral    |
| Dusty Peach | #f5c6aa, #d8a48f     | Playfair + Work Sans    | Lo-fi loop     | Blob      |

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS  
- **Fonts:** Google Fonts API  
- **Color:** Static JSON palette  
- **Audio:** Howler.js or `<audio>` with local `.mp3`/`.ogg`  
- **Voice Input:** Web Speech API (Chrome/Edge)  
- **Deployment:** Netlify or Vercel  

🧱 Project Structure
Start Screen: Handles mood prompt input and quick-select presets. 
npx shadcn@2.3.0 add "https://v0.dev/chat/b/b_uttH3XMwsC4?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..YLcSkCl0ivo0Fs6J.GuDEZKnufmOuHKr_7sIKMMKSoRzJ8MZ5E01Js9oWlecYbHWsC8BwPzqXQMg.fmMveyIcV3r3_fCucUo5xA"


Moodboard Screen: Displays the generated mood (colors, fonts, motif, sound). npx shadcn@2.3.0 add "https://v0.dev/chat/b/b_VYs0JX2LyEE?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..LKtYvIGyaFFfel7U.ZeiDexDthAbCVItOSh0_yWGXqBlQ1sBis1kkJt9IU4b0gjjaWeY1UZbhMPw.abEx71TmsVZ0g1vjJLRdcw"


lib/moods.ts: Static map of word → mood payload (colors, fonts, sounds, shapes)

Routing: Simple page-based routing (/ → /mood?mood=dusty-peach)

Framework: Uses Windsurf for full Tailwind + Shadcn UI fidelity with production-ready layout

lib/moods.ts: Static mapping of mood keyword → aesthetic payload. Includes:

colors: string[]

fonts: { heading: string, body: string }

sound: { label: string, file: string }

shape: string


Routing:

/: Start screen for word input or selection

/mood?mood=dusty-peach: Output screen → aesthetic results

Layout: Responsive layout system via Tailwind. Uses large padding, generous white space, and dark mode as default.


Testing Instructions
Try words like dusty peach, brutalist, euphoric, minimal

Check /lib/moods.ts to see predefined results

Submit a word → check dynamic routing → review generated output

Planned Enhancements
Add framer-motion transitions for tile entrance and sound play feedback

Improve sound player UX with waveform or visual pulse

Refactor moods.ts to support semantic fallbacks (Phase 3)

Allow saving/sharing generated moodboards

Explore Figma plugin export path

Design Constraints
No fixed primary color; all accents adapt to mood palette

Typography and color must maintain WCAG contrast

Motifs must be style-mapped (grid, block, blob, spiral, etc)

System must function as a standalone creative tool—no login, no account


