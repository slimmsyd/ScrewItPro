import OpenAI from "openai";
import { serverEnv } from "@/lib/env";

let deepseek: OpenAI | null = null;

/**
 * DeepSeek client (OpenAI-compatible SDK).
 * Server-only - keep the API key off the client.
 */
export function getDeepSeek(): OpenAI {
 if (!deepseek) {
 deepseek = new OpenAI({
 apiKey: serverEnv.deepseekApiKey,
 baseURL: serverEnv.deepseekBaseUrl,
 });
 }
 return deepseek;
}

export const DEEPSEEK_MODEL = () => serverEnv.deepseekModel;

export type ChatMessage = {
 role: "system" | "user" | "assistant";
 content: string;
};

/**
 * Simple chat completion helper for the mascot support bot.
 */
export async function chatCompletion(
 messages: ChatMessage[],
 options?: { temperature?: number; maxTokens?: number }
) {
 const client = getDeepSeek();
 const response = await client.chat.completions.create({
 model: serverEnv.deepseekModel,
 messages,
 temperature: options?.temperature ?? 0.7,
 max_tokens: options?.maxTokens ?? 1024,
 });

 return response.choices[0]?.message?.content ?? "";
}
