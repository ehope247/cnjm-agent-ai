import { NextResponse } from "next/server";
import {
  chatModels,
  getCapabilities,
  type ChatModel,
  type ModelCapabilities,
} from "@/lib/ai/models";

/** Shape returned by NVIDIA's /v1/models endpoint */
type NvidiaModel = {
  id: string;
  object?: string;
};

const FALLBACK_MODELS: ChatModel[] = chatModels;

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  };

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NVIDIA API responded with ${res.status}`);
    }

    const data = await res.json();
    const nvidiaModels: NvidiaModel[] = data.data ?? [];

    // Build the static capability map for models we know about
    const staticCapabilities = await getCapabilities();

    // Merge NVIDIA live models with static capability annotations
    const models: (ChatModel & { capabilities: ModelCapabilities })[] =
      nvidiaModels.map((m) => ({
        id: m.id,
        name: m.id.split("/").pop() ?? m.id,
        provider: m.id.split("/")[0] ?? "nvidia",
        description: "",
        capabilities: staticCapabilities[m.id] ?? {
          tools: false,
          vision: false,
          reasoning: false,
        },
      }));

    return NextResponse.json({ models, capabilities: staticCapabilities }, { headers });
  } catch (error) {
    console.error("Failed to fetch NVIDIA models, using fallback:", error);

    // Fall back to statically defined models
    const capabilities = await getCapabilities();
    const models = FALLBACK_MODELS.map((m) => ({
      ...m,
      capabilities: capabilities[m.id] ?? m.capabilities,
    }));

    return NextResponse.json({ models, capabilities }, { headers });
  }
}
