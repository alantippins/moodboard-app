# FYI: Moodboard App – Decisions & Progress Log

_Last updated: 2025-05-04_

## Phase 1: UI & System Foundation

### 🎨 Palette System
- **Palette Structure:**
  - Refactored to use a structured object for each palette, with the following keys:
    - `background`, `backgroundAlt`, `accent`, `headingColor`, `textColor`, `swatches`, `fontPrimary`, `fontSecondary`, `audio`, `svg`.
  - Example:
    ```ts
    {
      name: "Dusty Peach",
      background: "#F3DED3",
      backgroundAlt: "#8D543D",
      accent: "#D8A48F",
      headingColor: "#4E2E20",
      textColor: "#8D543D",
      swatches: ["#F3DED3", "#D8A48F", "#8D543D", "#4E2E20"],
      ...
    }
    ```
- **backgroundAlt** added to all palettes for secondary backgrounds.
- All palette usages in components now reference semantic keys (no more index-based color picking).
- Ready for future AI-driven palette generation (OpenAI prompt will ask for these keys).

### 🖼️ Moodboard Component
- **Grid Layout:**
  - Responsive, modern grid matching design mockup.
- **Shape Card:**
  - Large, centered SVG shape (240x260px), perfectly centered with flex utilities.
- **Font Cards:**
  - Use `fontPrimary` and `fontSecondary` from palette, with colors from palette roles.
  - Font Card 2 now uses `textColor` as background for better contrast.
- **Description Card:**
  - Uses `background` and `headingColor` for accessible contrast.
- **Audio Card:**
  - Uses `accent` as background, `headingColor` for Play icon and text.
  - Play button has microinteraction (scale on hover/tap).
- **Color Swatches:**
  - Rendered from `palette.swatches`, with text color chosen for contrast.
- **Accessibility:**
  - All interactive elements have `aria-label` and clear focus states.
- **No Shadows or Outlines:**
  - All cards and buttons are flat, with only rounded corners.
- **Microinteractions:**
  - Subtle, playful (SVG and Play button) using Framer Motion.

### 🧑‍💻 Code & Design Decisions
- **Ultra-modern, minimal, playful aesthetic.**
- **No shadows, gradients, or unnecessary animations.**
- **All color, font, and icon usage is semantic and accessible.**
- **Palette system is now extensible and AI-ready.**

### ✅ Next Steps
- Finalize palette roles for all moods.
- Start experimenting with AI palette generation using the new schema.
- Continue to test for accessibility and responsive polish.

---

_This log is maintained to provide context and rationale for all major updates. Use it as a reference for future development and onboarding._
