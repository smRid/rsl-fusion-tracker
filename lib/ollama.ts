interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  response?: string;
  error?: string;
}

const DEFAULT_OLLAMA_BASE_URL = "https://ollama.com";

export async function extractCalendarJsonFromImage({
  apiKey,
  base64Image,
  prompt,
  model,
  baseUrl = DEFAULT_OLLAMA_BASE_URL
}: {
  apiKey?: string;
  base64Image: string;
  prompt: string;
  model: string;
  baseUrl?: string;
}): Promise<string> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        {
          role: "user",
          content: prompt,
          images: [base64Image]
        }
      ],
      options: {
        temperature: 0
      }
    })
  });

  const text = await response.text();
  const parsed = parseOllamaResponse(text);

  if (!response.ok) {
    throw new OllamaApiError(
      parsed.error || `Ollama request failed with status ${response.status}.`,
      response.status
    );
  }

  const content = parsed.message?.content ?? parsed.response ?? "";
  if (!content.trim()) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}

export class OllamaApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "OllamaApiError";
  }
}

function parseOllamaResponse(text: string): OllamaChatResponse {
  try {
    return JSON.parse(text) as OllamaChatResponse;
  } catch {
    return { error: text || "Ollama returned a non-JSON error response." };
  }
}
