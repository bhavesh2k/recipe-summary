# 🍳 cook.ai — AI Video Recipe Extractor & Kitchen Companion

> Convert Instagram Reels, TikToks, YouTube Shorts, and Pinterest cooking videos into structured, step-by-step recipes with nutrition macros, ingredient scaling, inline timers, and a hands-free Cook Mode.

**Live Application:** [https://cookai-web.vercel.app](https://cookai-web.vercel.app)

---

## ✨ Features

- **Multi-Format & Platform Extraction:**
  - **Instagram:** Reels and multi-photo carousels.
  - **TikTok:** Cooking videos and voiceovers.
  - **YouTube Shorts & Videos:** Direct video comprehension via Google Gemini.
  - **Facebook Reels & Pinterest Pins.**
  - **Direct Upload:** Drag & drop MP4/MOV clips or photos (up to 25MB).
  - **Silent Video Parsing:** Uses Gemini's visual frame recognition to detect ingredients and techniques even when the video has only background music.

- **Intelligent Recipe Structuring:**
  - **Nutritional Estimation & Macros:** Automatically calculates estimated Calories, Protein (g), Carbohydrates (g), and Fat (g) per serving.
  - **Dynamic Serving Scaler:** Real-time multipliers ($0.5\times, 1\times, 2\times, 3\times$) or custom stepper.
  - **Unit Converter:** Toggle between Metric (g, ml) and Imperial (cups, oz, tbsp) on the fly.
  - **Interactive Step Timers:** Automatic countdown timers with pleasant kitchen chimes powered by the Web Audio API.

- **Kitchen Experience:**
  - **Hands-Free "Cook Mode":** Fullscreen distraction-free UI with high contrast, large fonts, and the **Screen Wake Lock API** so your phone/tablet screen stays awake on your kitchen stand.
  - **Smart Shopping List:** Ingredients automatically organized by supermarket aisle (*Produce*, *Dairy*, *Meat*, *Pantry*, *Spices*) with one-click clipboard copy.
  - **Print & PDF Export:** Clean print stylesheet designed for physical kitchen binders (`@media print`).
  - **My Cookbook:** Save recipes locally in your browser with search and tag filters.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (Tested on Node 22)
- A Google Gemini API Key ([Get one free from Google AI Studio](https://aistudio.google.com/app/apikey))

### 2. Setup
```bash
# Clone the repository
git clone <repo-url>
cd recipe-summary

# Install dependencies
npm install

# Configure your API key
cp .env.example .env.local
# Add your GEMINI_API_KEY in .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial release of cook.ai"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add the environment variable:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
5. Click **Deploy**. Vercel will host both your frontend and backend serverless API routes automatically for free!

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4, Lucide Icons
- **AI Model:** Google Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) via the official `@google/genai` SDK with strict JSON schema enforcement
