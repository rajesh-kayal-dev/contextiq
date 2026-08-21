import GroqLogo from "@/media/llmprovider/groq.png";
import GeminiLogo from "@/media/llmprovider/gemini.png";
import OpenAiLogo from "@/media/llmprovider/openai.png";
import AnthropicLogo from "@/media/llmprovider/anthropic.png";
import OpenRouterLogo from "@/media/llmprovider/openrouter.jpeg";
import OllamaLogo from "@/media/llmprovider/ollama.png";
import DeepSeekLogo from "@/media/llmprovider/deepseek.png";
import PerplexityLogo from "@/media/llmprovider/perplexity.png";
import MistralLogo from "@/media/llmprovider/mistral.jpeg";
import MinimaxLogo from "@/media/llmprovider/minimax.png";
import XAILogo from "@/media/llmprovider/xai.png";
import ZAiLogo from "@/media/llmprovider/zai.png";

export const DEFAULT_LLM_PROVIDER = "groq";

export const CONTEXTIQ_LLM_PROVIDERS = [
  // POPULAR PROVIDERS
  {
    value: "groq",
    name: "Groq",
    label: "Fast inference",
    isRecommended: true,
    category: "popular",
    logo: GroqLogo,
    keywords: ["groq", "fast", "inference", "recommended"],
  },
  {
    value: "gemini",
    name: "Google Gemini",
    label: "General-purpose AI",
    category: "popular",
    logo: GeminiLogo,
    keywords: ["google", "gemini", "general-purpose", "ai"],
  },
  {
    value: "openai",
    name: "OpenAI",
    label: "GPT models",
    category: "popular",
    logo: OpenAiLogo,
    keywords: ["openai", "gpt", "gpt-4", "gpt-4o", "gpt-3.5"],
  },
  {
    value: "anthropic",
    name: "Anthropic",
    label: "High-quality reasoning",
    category: "popular",
    logo: AnthropicLogo,
    keywords: ["anthropic", "claude", "reasoning"],
  },
  {
    value: "openrouter",
    name: "OpenRouter",
    label: "Access multiple models",
    category: "popular",
    logo: OpenRouterLogo,
    keywords: ["openrouter", "multi-model", "gateway"],
  },
  {
    value: "ollama",
    name: "Ollama",
    label: "Run models locally",
    category: "popular",
    logo: OllamaLogo,
    keywords: ["ollama", "local", "run models locally"],
  },
  {
    value: "deepseek",
    name: "DeepSeek",
    label: "Reasoning & coding",
    category: "popular",
    logo: DeepSeekLogo,
    keywords: ["deepseek", "reasoning", "coding"],
  },

  // MORE PROVIDERS
  {
    value: "perplexity",
    name: "Perplexity AI",
    label: "Web-connected AI",
    category: "more",
    logo: PerplexityLogo,
    keywords: ["perplexity", "web-connected", "search", "internet"],
  },
  {
    value: "mistral",
    name: "Mistral",
    label: "Open and enterprise models",
    category: "more",
    logo: MistralLogo,
    keywords: ["mistral", "open", "enterprise"],
  },
  {
    value: "minimax",
    name: "MiniMax",
    label: "General-purpose AI",
    category: "more",
    logo: MinimaxLogo,
    keywords: ["minimax", "m2", "general-purpose"],
  },
  {
    value: "xai",
    name: "xAI Grok",
    label: "Grok models",
    category: "more",
    logo: XAILogo,
    keywords: ["xai", "grok", "grok-2"],
  },
  {
    value: "zai",
    name: "Z.AI",
    label: "GLM models",
    category: "more",
    logo: ZAiLogo,
    keywords: ["zai", "glm", "glm-4"],
  },
];

export function getProviderMeta(value) {
  return (
    CONTEXTIQ_LLM_PROVIDERS.find((p) => p.value === value) || {
      value,
      name: value,
      label: "AI Provider",
      category: "more",
      logo: null,
      keywords: [],
    }
  );
}
