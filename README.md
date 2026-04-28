# Workplace Translator

Workplace Translator is a mobile-first React app for decoding workplace messages and generating practical reply suggestions. It supports text input, image upload, role selection, and response intensity control, then sends the request to a Dify workflow for analysis.

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
- Dify Workflow API
- Vercel rewrites for API proxying

## Project Structure

```text
.
+-- src/
|   +-- pages/
|   |   +-- Home.jsx
|   |   +-- Result.jsx
|   +-- lib/
|   |   +-- dify.js
|   |   +-- utils.js
|   +-- App.jsx
|   +-- main.jsx
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

## API Proxy

The app calls Dify through the relative path `/dify-api`. In production, `vercel.json` rewrites those requests to:

```text
http://dify.acesohealthy.com/v1/:path*
```

The same relative path is also used in development so Vite can proxy API requests consistently.

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

This repository is ready for Vercel deployment. The single-page app fallback and Dify API rewrite are configured in `vercel.json`.

## Notes

- This project currently stores the Dify app key in the frontend API helper. For production hardening, move API credentials behind a server-side boundary or protected environment variable.
- The UI is designed primarily for mobile-sized screens.
