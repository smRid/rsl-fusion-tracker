# AI Fusion Tracker for Raid: Shadow Legends

Production-quality MVP web app for generating an interactive Raid: Shadow Legends fusion tracker from an uploaded official fusion calendar image.

## File Structure

```text
app/
  api/extract-calendar/route.ts
  tracker/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  tracker/
    EventEditorModal.tsx
    ImportExportPanel.tsx
    ManualEventForm.tsx
    ProgressPanel.tsx
    TimelineEventBar.tsx
    TimelineGrid.tsx
    TrackerDashboard.tsx
  upload/UploadCalendar.tsx
lib/
  date-utils.ts
  fusion-prompt.ts
  fusion-schema.ts
  gemini.ts
  local-storage.ts
  tracker-utils.ts
types/
  fusion.ts
assets/
  Fusion_schedule_EN.png
  sample event tracker.png
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` and set your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Do not use a `NEXT_PUBLIC_` API key. The app only calls Gemini from the secure Next.js API route.

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Test Upload

1. Open the homepage.
2. Upload an official Raid fusion calendar image, such as `assets/Fusion_schedule_EN.png`.
3. Click `Generate Timeline`.
4. After Gemini returns data, the app saves the tracker to `localStorage` and opens `/tracker`.
5. Mark events as pending, earned, or skipped.
6. Refresh the page to confirm the tracker persists.
7. Use export/import JSON to verify tracker backup and restore.
8. Use reset to clear `localStorage` and return to the upload flow.

## Built Features

- Drag-and-drop image upload with preview.
- Client-side image type and 20MB size validation.
- Secure `/api/extract-calendar` route using `@google/genai`.
- Server-side Gemini API key usage only.
- Strict TypeScript tracker/event model.
- Zod validation and normalization for AI output.
- Timeline dashboard with tournament and event lanes.
- Editable event modal with validation.
- Manual add, edit, delete, and needs-review support.
- Status tracking for pending, earned, and skipped events.
- Progress calculator for earned, skipped, pending, remaining, and risk status.
- `localStorage` persistence using key `rsl-ai-fusion-tracker`.
- JSON export/import with validation.
- Reset flow.
- Fan-made disclaimer.

## Known Limitations

- Gemini extraction quality depends on calendar image clarity and visible text.
- The app does not persist uploaded image previews after refresh.
- No database, authentication, or cloud storage by design.
- Manual timeline overlap avoidance is simple stacked rows for MVP.

## Recommended Improvements

- Add automated unit tests for normalization, dates, and progress calculations.
- Add optional manual tracker creation when no API key is configured.
- Add confidence scores if the AI extraction prompt/model starts returning them.
- Add richer mobile event list filtering by status and category.
