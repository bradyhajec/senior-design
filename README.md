# 🌿 Verdant — AI Plant Care Tool

An intelligent plant identification, health assessment, and care guidance app built with Next.js and Claude AI. Built for COMP 4710 Senior Design at Auburn University.

## Features

- **📸 Plant Image Analysis** — Upload a photo and get instant AI-powered plant identification
- **🏥 Health Assessment** — Receive a 0–100 health score with detailed issue detection
- **🌱 Care Recommendations** — Personalized care instructions tailored to your plant and environment
- **📅 Care Reminders** — AI-generated watering and fertilizing schedules
- **🌍 Environmental Context** — Factor in light, humidity, indoor/outdoor placement
- **💬 Feedback System** — Rate recommendations to improve future guidance
- **📖 Assessment History** — Track your plant's health over time
- **✏️ Plant Profiles** — Nickname your plants and manage your collection

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Plant API model https://ai-plant-care-production.up.railway.app
- **Styling**: Tailwind CSS with custom botanical design system
- **Typography**: Cormorant Garamond + DM Sans (Google Fonts)
- **Storage**: Browser localStorage (no database required)
- **Deployment**: Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd ai-plant-care
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Plant api url:

```
PLANT_API_URL=https://ai-plant-care-production.up.railway.app
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add your environment variable:

```bash
vercel env add ANTHROPIC_API_KEY
```

Then redeploy:

```bash
vercel --prod
```

### Option B: Vercel Dashboard (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. In **Environment Variables**, add:
   - PLANT_API_URL=https://ai-plant-care-production.up.railway.app
5. Click **Deploy**

Vercel auto-detects Next.js and handles the build.

## Project Structure

```
ai-plant-care/
├── app/
│   ├── api/analyze/route.ts    # Anthropic API route
│   ├── analyze/page.tsx         # Upload & analysis flow
│   ├── plants/[id]/page.tsx     # Plant detail & management
│   ├── page.tsx                 # Dashboard / plant collection
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   └── PlantCard.tsx
├── lib/
│   └── store.ts                 # Types + localStorage helpers
├── .env.example
├── vercel.json
└── tailwind.config.ts
```

## Domain Model

From the architectural spike, this app implements:

| Entity         | Implementation                                    |
| -------------- | ------------------------------------------------- |
| User           | Browser session (localStorage)                    |
| Plant          | `Plant` interface with plantId, nickname, species |
| Assessment     | Nested in Plant, stores AI analysis results       |
| Photo          | base64 encoded, stored in assessment              |
| SymptomReport  | Text field in Assessment                          |
| Prediction     | species label + confidence score                  |
| Recommendation | actionText + category                             |
| Reminder       | reminderType, schedule, enabled toggle            |
| Feedback       | helpful/correct booleans + comment                |

## Team

- Shelby Hampton
- Brady Hajec
- Grayson Ryoo
- Colin Moore
- Kaden Range
- Cooper Niebuhr

COMP 4710 Senior Design — Samuel Ginn College of Engineering, Auburn University
