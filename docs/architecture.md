# Architecture and data flow

GreenRide comprises independent clients sharing a single REST API. `client/` contains the Expo mobile app, while `client_company/` contains the React company portal. The API lives in `server/`, and the independent Vosk service is packaged in `vosk_docker_server/`.

## Mobile ride creation and search

1. The authenticated mobile app sends an audio base64 payload to `/tokenApiEmployees/transcribeAudio` or a text instruction to `/tokenApiEmployees/manageLLM/send`.
2. Audio is converted from M4A to mono 16-kHz WAV with FFmpeg, then submitted to Vosk's `/transcribe` endpoint. Temporary input/output filenames are unique to each request and cleaned up.
3. The backend prompts an external LLM to classify the intent and extract ride fields. Depending on intent, the backend persists an offer or searches and ranks matching offers.
4. Ride requests, acceptance/rejection, and completion are represented by the `Offer` model and its embedded pending-request records. Green Points and approximate CO2 savings are updated at completion.

## Company management

Company accounts confirm an email address and are subsequently approved by the administrator. Approved employees can use the mobile application. Company routes are scoped to the company authenticated by its JWT and stored session token; untrusted `companyid` headers must not select the tenant. Review of self-certifications requires a matching company and document association.

## Persistence

Mongoose models: `Company`, `Employee`, `Offer`, `Selfcertification`, and `GreenInfo`. The original archive did not include a database export or migration system; users must provide MongoDB and initialize real or demonstration accounts.

## External dependencies

The backend uses OpenRouter for LLM calls, SMTP for email, Expo for push notifications, and the Dockerized Vosk service for transcription. The mobile application uses OSRM for directions, and its current implementation also opens navigation applications. Connectivity and credentials are required; none of these services is embedded in the repository.

The prototype is not designed as a high-availability or multi-region platform. Production deployments would require transaction-aware handling for database operations that affect multiple documents and careful control of concurrent ride requests.
