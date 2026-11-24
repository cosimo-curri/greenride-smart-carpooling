# Setup and execution

## Prerequisites

- Node.js 22 and npm (the version used for this repository's validation); three lockfiles have been preserved from the original project.
- MongoDB compatible with Mongoose 8 (local instance or your own managed cluster).
- System [FFmpeg](https://ffmpeg.org/download.html) available on `PATH` (or set `FFMPEG_PATH` in the backend configuration). Check the [license of your FFmpeg build](https://ffmpeg.org/legal.html).
- Docker to run the optional Python/Vosk microservice; it downloads the Italian model when building.
- A suitable Android/iOS emulator, compatible Expo development build, or Expo-supported environment for the mobile client.
- Own SMTP account credentials for email flows; OpenRouter key for LLM features. An active internet connection is required for provider APIs and dependency installation.

Each command block below starts from the repository root in its own terminal. If reusing one terminal, return to the root directory between sections.

## 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: replace ALL credentials and secrets with your own values.
npm ci
npm start
```

`MONGODB_URI=mongodb://127.0.0.1:27017/greenride` targets a local MongoDB instance by default; provision your own MongoDB server and create the data and accounts required by your deployment. `BASE_URL` must be accessible by all clients and be consistent with the file URLs returned by the API. The backend listens on port 3000 unless changed with `PORT`.

File uploads are capped at 50 MB per file (2 MB for company SVG logos) to limit memory pressure. Runtime uploads are not intended for Git tracking.

The backend can send signup, activation, and reset emails using Gmail SMTP. Use your own authorized account and app password. The prototype does **not** provide a bypass for account verification or an administrator seed account: set `ADMIN_GREENRIDE_EMAIL` and `ADMIN_GREENRIDE_PASSWORD` yourself and then use the documented application workflows to create/approve companies and employees.

If using a physical phone on your network, adjust both `BASE_URL` and `EXPO_PUBLIC_API_BASE_URL` to a reachable address rather than `localhost`.

## 2. Vosk transcription service

```bash
docker build -t greenride-vosk ./vosk_docker_server
docker run --rm -p 5000:5000 greenride-vosk
```

This build downloads `vosk-model-small-it-0.22` from Alphacephei. The backend's `API_TRANSCRIBE_VOSK_DOCKER_SERVER` should point to an endpoint reachable **from the Node.js process**, such as `http://localhost:5000/transcribe` for processes on the same host. The service accepts a base64-encoded mono 16-bit PCM WAV file sampled at 16 kHz and returns `{ "text": "..." }`.

## 3. Web portal

```bash
cd client_company
cp .env.example .env
npm ci
npm start
```

Suggested address: `http://localhost:3001`. The backend's `BASE_URL_CLIENT_COMPANY` must agree with this address for email verification/password-reset redirects. Create React App uses the `REACT_APP_` environment-variable prefix at build time. Set `REACT_APP_CONTACT_EMAIL` to a public contact address (the template uses a nonfunctional example address).

## 4. Mobile app

```bash
cd client
cp .env.example .env
npm ci
npm start
```

Set `EXPO_PUBLIC_API_BASE_URL` to the backend address that is reachable from the device. Set `EXPO_PUBLIC_CONTACT_EMAIL` to your public contact address (the default is only a placeholder). For some Android emulators, `10.0.2.2` refers to the development host; for a physical device, use a LAN address and check firewall/network restrictions. In development, the app uses Expo SDK 53. Do not upgrade Expo or dependencies without separately validating native functionality.

## Optional environment-dependent features

- Set `OPENROUTER_API_KEY` and verify availability of the referenced DeepSeek model IDs to enable LLM-based functions. Calls may cost money or fail because a model becomes unavailable.
- Set `EXPO_NOTIFICATION_API` to the Expo push service, configure device notification permissions, and use a supported device environment.
- Ensure the OSRM demo service is available for routing. Public demonstration endpoints may enforce usage limits.
- Promotional stories are optional. To enable them, provide your own licensed files under `server/greenride_cloud_storage/contents/` using the filenames configured in `client/utils/apiManager.js`, and set `EXPO_PUBLIC_PROMOTIONAL_STORIES_ENABLED=true` in `client/.env`. The app does not fetch missing demonstration stories by default. The `/contents/<filename>` and `/logos/<filename>` paths are public; user documents and gifts are served through protected routes.

## What this repository does not provide

This repository does not include seeded database accounts or data, SMTP credentials, service API keys, or production deployment configuration. Deployments must supply their own resources and configure each component using the provided templates.
