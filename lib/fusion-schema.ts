import { z } from "zod";
import { normalizeTracker } from "./tracker-utils";

const flexibleValueSchema = z.union([z.string(), z.number(), z.null()]).optional();

export const extractedFusionSchema = z.object({
  fusionName: z.string().nullable().optional(),
  dateRange: z
    .object({
      start: flexibleValueSchema,
      end: flexibleValueSchema
    })
    .optional(),
  events: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["Tournament", "Event"]),
      startDate: flexibleValueSchema,
      endDate: flexibleValueSchema,
      fragments: flexibleValueSchema,
      leaderboardFragments: flexibleValueSchema,
      needsReview: z.boolean().optional()
    })
  ),
  totalFragments: flexibleValueSchema
});

export function normalizeExtractedFusion(raw: unknown, currentYear = new Date().getFullYear()) {
  const parsed = extractedFusionSchema.parse(raw);
  const normalizedEvents = parsed.events.map((event) => ({
    ...event,
    startDate: normalizeExtractedDate(event.startDate, currentYear),
    endDate: normalizeExtractedDate(event.endDate, currentYear),
    fragments: normalizeExtractedNumber(event.fragments),
    leaderboardFragments: normalizeExtractedNumber(event.leaderboardFragments),
    needsReview:
      Boolean(event.needsReview) ||
      !normalizeExtractedDate(event.startDate, currentYear) ||
      !normalizeExtractedDate(event.endDate, currentYear)
  }));

  return normalizeTracker({
    ...parsed,
    dateRange: {
      start: normalizeExtractedDate(parsed.dateRange?.start, currentYear),
      end: normalizeExtractedDate(parsed.dateRange?.end, currentYear)
    },
    events: normalizedEvents,
    totalFragments: normalizeExtractedNumber(parsed.totalFragments) ?? undefined,
    requiredFragments: 100,
    source: "ai"
  });
}

function normalizeExtractedDate(value: string | number | null | undefined, currentYear: number): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const monthNameMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\.?\s+(\d{1,2})/i);
  if (monthNameMatch) {
    return toIsoDate(currentYear, monthNameToNumber(monthNameMatch[1]), Number(monthNameMatch[2]));
  }

  const numericMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numericMatch) {
    const year = numericMatch[3] ? normalizeYear(Number(numericMatch[3])) : currentYear;
    return toIsoDate(year, Number(numericMatch[1]), Number(numericMatch[2]));
  }

  return null;
}

function normalizeExtractedNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value !== "string") {
    return null;
  }

  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (!numbers.length) {
    return null;
  }

  return numbers.reduce((sum, number) => sum + number, 0);
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function normalizeYear(year: number): number {
  return year < 100 ? 2000 + year : year;
}

function monthNameToNumber(monthName: string): number {
  const normalized = monthName.toLowerCase().slice(0, 3);
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(normalized) + 1;
}
