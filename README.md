# Workplace Translator

Workplace Translator is a mobile-first workplace communication assistant. It helps users decode workplace messages, understand possible subtext, choose a response intensity, and generate a reply that can be copied and sent.

Live site:

```text
https://wt.liderrr.cc/
```

## What It Does

- Decodes workplace messages into implied intent and risk.
- Generates concrete next-step suggestions.
- Generates a copy-ready Chinese reply.
- Supports three target personas: boss, colleague, and client.
- Supports three response intensity levels.
- Supports either text input or image input.
- Compresses image input in the browser before sending it to the backend.
- Keeps AI credentials on the server side.
- Includes a Capacitor iOS project.

## Current Architecture

```text
Browser UI
  |
  +-- src/pages/Home.jsx
  |     Collects persona, text/image input, and response intensity.
  |
  +-- src/pages/Result.jsx
        Calls /api/translate and renders the structured AI result.

Serverless API
  |
  +-- api/translate.js
        Vercel function entrypoint.
  |
  +-- server/glm-service.js
        Validates input, builds GLM messages, calls GLM, parses JSON output.

GLM API
  |
  +-- Text model: glm-5.1
  +-- Vision model: glm-4.6v
```

## Tech Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- Capacitor 8
- Vercel Serverless Functions
- GLM Chat Completions API

## Project Structure

```text
.
+-- api/
|   +-- translate.js
+-- server/
|   +-- glm-service.js
+-- src/
|   +-- lib/
|   |   +-- glm.js
|   |   +-- utils.js
|   +-- pages/
|   |   +-- Home.jsx
|   |   +-- Result.jsx
|   +-- App.jsx
|   +-- main.jsx
+-- ios/
+-- public/
+-- .env.example
+-- capacitor.config.ts
+-- vercel.json
+-- vite.config.js
+-- package.json
```

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Required:

```text
GLM_API_KEY=your-glm-api-key
```

Optional defaults:

```text
GLM_API_BASE=https://open.bigmodel.cn/api/paas/v4
GLM_TEXT_MODEL=glm-5.1
GLM_VISION_MODEL=glm-4.6v
```

Do not commit `.env`, `.env.local`, or real API keys.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Contract

The frontend calls:

```text
POST /api/translate
```

Request body:

```json
{
  "inputText": "Boss says this proposal needs more thought.",
  "persona": "boss",
  "fireLevel": 2,
  "imageDataUrl": null
}
```

Response body:

```json
{
  "subtext": "Analysis of the likely intent and risk.",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "response": "A copy-ready reply."
}
```

Rules enforced by the backend:

- Text input is trimmed and capped at 6000 characters.
- Image input must be a PNG, JPG, JPEG, or WEBP data URL.
- Image input is capped at 8 MB.
- Requests must include text or an image.
- API keys are read only from server environment variables.

## GLM Integration

Text-only requests use:

```text
glm-5.1
```

Image requests use:

```text
glm-4.6v
```

The browser sends image data as a data URL. The server validates it, strips the `data:image/...;base64,` prefix, and sends the raw base64 image to GLM.

## Deployment

This project is configured for Vercel.

Before deploying, configure these environment variables in the Vercel project:

```text
GLM_API_KEY
GLM_API_BASE
GLM_TEXT_MODEL
GLM_VISION_MODEL
```

At minimum, `GLM_API_KEY` is required. Without it, the page can load but AI requests to `/api/translate` will return a service error.

## iOS Build

Capacitor config:

```text
appId: com.workplace.translator
appName: Workplace Translator
webDir: dist
```

Build and sync:

```bash
npm run build
npx cap sync ios
```

Open in Xcode:

```bash
npx cap open ios
```

## Verification

Verified locally:

- `npm run build` passes.
- Local Vite server responds at `http://localhost:5173/`.
- Production domain responds at `https://wt.liderrr.cc/`.
- Tracked files do not contain the GLM API key.
- Text GLM request works with `glm-5.1`.
- Image GLM request works with `glm-4.6v`.

Known dependency audit state:

- `npm audit` currently reports 8 issues: 1 moderate and 7 high.
- They are dependency-level advisories and should be reviewed before running `npm audit fix`, because automatic fixes may change lockfile and dependency behavior.

## Security Notes

- Never expose GLM credentials in frontend code.
- Keep API credentials in local `.env.local` or Vercel environment variables.
- Do not commit local browser test artifacts such as `.playwright-mcp/`.
- The old Dify workflow has been replaced by the GLM API. `src/lib/dify.js` remains only as a compatibility guard and throws if called.
