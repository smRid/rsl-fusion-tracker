import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { extractCalendarJsonFromImage, OllamaApiError } from "@/lib/ollama";
import { normalizeExtractedFusion } from "@/lib/fusion-schema";
import { createFusionExtractionPrompt } from "@/lib/fusion-prompt";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const DEFAULT_OLLAMA_MODEL = "qwen3-vl:235b-cloud";

export async function POST(request: Request) {
  const apiKey = process.env.OLLAMA_API_KEY;
  const model = process.env.OLLAMA_MODEL || process.env.Model || DEFAULT_OLLAMA_MODEL;
  const baseUrl = process.env.OLLAMA_BASE_URL || "https://ollama.com";

  if (!apiKey) {
    return jsonError("OLLAMA_API_KEY is missing on the server.", 500);
  }

  let image: FormDataEntryValue | null = null;
  try {
    const formData = await request.formData();
    image = formData.get("image");
  } catch {
    return jsonError("Could not read the uploaded image.", 400);
  }

  if (!(image instanceof File)) {
    return jsonError("No image was uploaded.", 400);
  }

  if (!image.type.startsWith("image/")) {
    return jsonError("Please upload a valid image file.", 400);
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return jsonError("Image must be under 20MB.", 400);
  }

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const currentYear = new Date().getFullYear();
    const rawText = await extractCalendarJsonFromImage({
      apiKey,
      base64Image: buffer.toString("base64"),
      prompt: createFusionExtractionPrompt(currentYear),
      model,
      baseUrl
    });
    const parsed = parseJsonOnly(rawText);
    const tracker = normalizeExtractedFusion(parsed, currentYear);

    if (tracker.events.length === 0) {
      return jsonError("AI could not detect events from this calendar. Try a clearer image.", 422);
    }

    const datedEvents = tracker.events.filter((event) => event.startDate && event.endDate).length;
    if (tracker.events.length > 0 && datedEvents === 0) {
      return jsonError(
        "AI detected events but could not read their timeline positions. Try a higher-resolution calendar image or crop closer to the grid.",
        422
      );
    }

    return NextResponse.json(tracker);
  } catch (error) {
    console.error("Calendar extraction failed", error);

    if (error instanceof SyntaxError) {
      return jsonError("AI returned invalid JSON. Try a clearer official calendar image.", 500);
    }

    if (error instanceof ZodError) {
      return jsonError("Ollama returned JSON, but it did not match the expected calendar format.", 500);
    }

    if (error instanceof OllamaApiError) {
      return jsonError(toOllamaErrorMessage(error.message), error.status);
    }

    if (error instanceof Error) {
      return jsonError(toOllamaErrorMessage(error.message), 500);
    }

    return jsonError("Ollama could not process this calendar image.", 500);
  }
}

function parseJsonOnly(text: string): unknown {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  return JSON.parse(trimmed);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function toOllamaErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("forbidden") || lowerMessage.includes("permission")) {
    return "Ollama rejected the API key or project permissions. Check OLLAMA_API_KEY and OLLAMA_BASE_URL.";
  }

  if (lowerMessage.includes("quota") || lowerMessage.includes("rate")) {
    return "Ollama quota or rate limit was reached. Try again later or check your provider account.";
  }

  if (lowerMessage.includes("model") || lowerMessage.includes("not found")) {
    return "Ollama model access failed for qwen3-vl:235b-cloud. Make sure your API key has access to this cloud vision model.";
  }

  if (lowerMessage.includes("fetch") || lowerMessage.includes("network") || lowerMessage.includes("econnrefused")) {
    return "The server could not reach Ollama Cloud. Check OLLAMA_BASE_URL, internet access, or your provider status.";
  }

  return "Ollama could not process this calendar image. Check the server console for the detailed error.";
}
