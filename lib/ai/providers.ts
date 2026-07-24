import { createOpenAI } from "@ai-sdk/openai";
import { isTestEnvironment } from "../constants";
import { customProvider } from "ai";
import { titleModel } from "./models";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
  compatibility: "compatible",
} as any);

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return openai.chat(modelId) as any;
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  return openai.chat(titleModel.id) as any;
}
