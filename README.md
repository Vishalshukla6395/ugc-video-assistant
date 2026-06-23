# UGC Video Assistant

A production-minded MVP for a ChatGPT-style assistant that chats naturally and turns product URLs into short vertical UGC marketing videos.

## What It Does

- ChatGPT-like interface with message history, typing state, timestamps, auto-scroll, mobile responsive layout, dark mode, video preview, and copy video URL.
- General conversation mode for greetings and capability questions.
- URL-triggered UGC generation pipeline:
  1. Extract URL from the user message.
  2. Fetch and summarize website title, meta description, and product messaging.
  3. Ask Claude for a viral UGC strategy as structured JSON.
  4. Search Giphy and Pexels using Claude-generated search terms.
  5. Render a 1080x1920 MP4 with Remotion.
  6. Save to `public/generated` and return the video URL in chat.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- Remotion
- Giphy API
- Pexels API

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
GIPHY_API_KEY=your_giphy_key
PEXELS_API_KEY=your_pexels_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEFAULT_AUDIO_URL=https://example.com/royalty-free-track.mp3
```

`DEFAULT_AUDIO_URL` is optional. When provided, it is added as low-volume background music in the generated Remotion video.

The app includes graceful fallbacks for missing API keys so the UI and video pipeline can still be exercised in development. For production-quality output, provide Claude, Giphy, and Pexels keys.

## Useful Commands

```bash
npm run dev
npm run build
npm run render:sample
```

`npm run render:sample` renders a sample CalAI-style video without using the chat UI.

## Project Structure

```text
app/
  api/chat/route.ts       Chat and video-generation API route
  page.tsx                App entry
components/
  chat-shell.tsx          Chat UI
lib/
  assets.ts               Giphy and Pexels adapters
  claude.ts               Claude conversation and strategy generation
  types.ts                Shared TypeScript types
  url.ts                  URL extraction
  video.ts                Remotion renderer
  website.ts              Website HTML summarizer
remotion/
  index.ts                Remotion root registration
  root.tsx                Composition definition
  ugc-video.tsx           Vertical UGC video composition
scripts/
  render-sample.ts        Local sample render
```

## Notes

- Generated videos are written to `public/generated/*.mp4`.
- The API route uses the Node.js runtime because Remotion rendering needs filesystem and Chromium access.
- The endpoint has a `maxDuration` of 120 seconds for platforms that support longer serverless execution. For heavy production usage, move rendering into a background job or worker.
