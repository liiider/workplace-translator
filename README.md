# Workplace Translator

Workplace Translator is a mobile-first React app for decoding workplace messages and generating practical reply suggestions. It supports text input, image input, role selection, and response intensity control, then sends the request to a GLM API proxy endpoint for analysis.

## Features

- Decode workplace messages into implied intent and subtext.
- Generate suggested next actions and reply copy.
- Choose the target persona: boss, colleague, or client.
- Adjust response intensity with a three-level slider.
- Upload an image when text input is not used.
- Copy the generated reply from the result page.
- Mobile-focused UI with safe-area handling for app-like screens.
- Capacitor iOS project included.

## Tech Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- Capacitor 8
- GLM API
- Vercel serverless functions

## Project Structure

```text
.
+-- src/
|   +-- pages/
|   |   +-- Home.jsx
|   |   +-- Result.jsx
|   +-- lib/
|   |   +-- glm.js
|   |   +-- utils.js
|   +-- App.jsx
|   +-- main.jsx
+-- api/
|   +-- translate.js
+-- server/
|   +-- glm-service.js
+-- ios/
+-- public/
+-- capacitor.config.ts
+-- vercel.json
+-- vite.config.js
+-- package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then set your GLM API key:

```text
GLM_API_KEY=your-glm-api-key
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## GLM Integration

The app calls the project-local endpoint:

```text
/api/translate
```

That endpoint reads `GLM_API_KEY` from the server environment and calls the GLM Chat Completions API. API keys are not exposed to the browser.

Default models:

```text
GLM_TEXT_MODEL=glm-5.1
GLM_VISION_MODEL=glm-4.6v
```

`glm-5.1` is used for text-only requests. `glm-4.6v` is used when an image is included.

## iOS Build

The Capacitor app configuration is defined in `capacitor.config.ts`:

```text
appId: com.workplace.translator
appName: Workplace Translator
webDir: dist
```

After building the web app, sync the native project:

```bash
npm run build
npx cap sync ios
```

Then open the iOS project in Xcode:

```bash
npx cap open ios
```

## Deployment

This repository is ready for Vercel deployment. Configure `GLM_API_KEY` in the Vercel project environment variables before deploying.

## Notes

- GLM credentials must stay in environment variables and should never be committed to the repository.
- The UI is designed primarily for mobile-sized screens.
