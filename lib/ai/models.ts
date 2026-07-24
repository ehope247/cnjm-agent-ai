import { openai } from "./providers";

export const customModel = (modelId?: string) => {
  return openai(modelId || "meta/llama-3.1-70b-instruct") as any;
};

export const DEFAULT_CHAT_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

export const titleModel = {
  id: "meta/llama-3.1-8b-instruct",
  name: "Llama 3.1 8B",
  provider: "meta",
  description: "Ultra-fast lightweight model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: ModelCapabilities;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Nemotron 70B",
    provider: "nvidia",
    description: "NVIDIA's native model — strong reasoning and tool calling",
    capabilities: {
      tools: true,
      vision: false,
      reasoning: true,
    },
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    provider: "meta",
    description: "Lightweight and extremely fast with tool calling",
    capabilities: {
      tools: true,
      vision: false,
      reasoning: false,
    },
  },
  {
    id: "nvidia/nemotron-4-15b-chat",
    name: "Nemotron 4 15B",
    provider: "nvidia",
    description: "NVIDIA Nemotron chat model",
    capabilities: {
      tools: true,
      vision: false,
      reasoning: false,
    },
  },
];

/** Returns static capabilities for a model by ID. */
export function getCapabilityByModelId(modelId: string): ModelCapabilities {
  const model = chatModels.find((m) => m.id === modelId);
  return (
    model?.capabilities ?? { tools: false, vision: false, reasoning: false }
  );
}

/** Returns capabilities for all chat models as a record. */
export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((m) => [m.id, m.capabilities])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export function getAllGatewayModels(): GatewayModelWithCapabilities[] {
  return chatModels;
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
