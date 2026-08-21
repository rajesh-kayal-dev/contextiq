const { BaseImageGenerator } = require("../base");

class OllamaImageGenerator extends BaseImageGenerator {
  constructor() {
    const basePath = (
      process.env.IMAGE_GEN_OLLAMA_BASE_PATH ||
      process.env.OLLAMA_BASE_PATH ||
      "http://127.0.0.1:11434"
    ).replace(/\/+$/, "");
    const model = process.env.IMAGE_GEN_MODEL_PREF || "x/flux2-klein:4b";
    const authToken =
      process.env.IMAGE_GEN_OLLAMA_AUTH_TOKEN ||
      process.env.OLLAMA_AUTH_TOKEN ||
      null;

    const { OpenAI: OpenAIApi } = require("openai");
    super({
      client: new OpenAIApi({
        baseURL: `${basePath}/v1`,
        apiKey: authToken || "ollama",
      }),
      model,
      className: "OllamaImageGenerator",
    });

    this.basePath = basePath;
    this.authToken = authToken;
  }

  _extractBuffer(dataStr) {
    if (!dataStr || typeof dataStr !== "string") return null;
    let base64 = dataStr;
    if (dataStr.includes(",")) {
      base64 = dataStr.split(",").pop();
    }
    base64 = base64.trim();
    if (!base64) return null;
    return Buffer.from(base64, "base64");
  }

  isTextOnlyModel(modelName = "") {
    const name = String(modelName || "").toLowerCase();

    // Experimental or dedicated image generation models (e.g. x/flux2-klein:4b)
    if (
      name.startsWith("x/") ||
      name.includes("flux") ||
      name.includes("image") ||
      name.includes("z-image") ||
      name.includes("sd") ||
      name.includes("stable-diffusion")
    ) {
      return false;
    }

    const textKeywords = [
      "mistral",
      "llama",
      "qwen",
      "gemma",
      "deepseek",
      "phi",
      "vicuna",
      "codellama",
      "starcoder",
    ];
    return textKeywords.some((kw) => name.includes(kw));
  }

  async generateImage({ prompt, size, signal }) {
    const cleanBasePath = this.basePath.replace(/\/+$/, "");

    // 1. Validation: Prevent text-only LLM models from being called for image generation
    if (this.isTextOnlyModel(this.model)) {
      this.log(
        `[Validation Error] Model "${this.model}" is a text LLM and cannot generate images.`
      );
      throw new Error(
        `The model "${this.model}" is a text LLM and does not support image generation. Please configure an image provider (e.g. OpenAI DALL-E 3 or OpenRouter) in Settings → Image Generation.`
      );
    }

    this.log(
      `Generating image with Ollama model "${this.model}" at ${cleanBasePath}/api/generate.`
    );

    const headers = {
      "Content-Type": "application/json",
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
    };

    let generateErr = null;

    // 2. Primary Route: POST /api/generate for Ollama image models (e.g. x/flux2-klein:4b)
    try {
      const res = await fetch(`${cleanBasePath}/api/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
        signal: signal ?? null,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.image) {
          const buf = this._extractBuffer(data.image);
          if (buf) return { buffer: buf };
        }
        if (Array.isArray(data?.images) && data.images[0]) {
          const buf = this._extractBuffer(data.images[0]);
          if (buf) return { buffer: buf };
        }
        if (data?.response) {
          const buf = this._extractBuffer(data.response);
          if (buf) return { buffer: buf };
        }
      } else {
        const errorText = await res.text().catch(() => "");
        generateErr = `Ollama /api/generate returned status ${res.status}: ${errorText || res.statusText}`;
        this.log(`[Error] ${generateErr}`);
      }
    } catch (e) {
      generateErr = `Failed to connect to Ollama server at ${cleanBasePath}: ${e.message}`;
      this.log(`[Connection Error] ${generateErr}`);
    }

    // 3. Fallback Route: Try OpenAI-compatible /v1/images/generations for Ollama image proxies
    try {
      this.log(`Trying /v1/images/generations fallback at ${cleanBasePath}...`);
      return await this.requestImage(prompt, size, signal);
    } catch (v1Err) {
      this.log(`/v1/images/generations fallback failed:`, v1Err.message);
    }

    throw new Error(
      generateErr ||
        `Ollama server at ${cleanBasePath} did not return image data for model "${this.model}". Ensure model "${this.model}" is pulled and running in Ollama ('ollama run ${this.model}').`
    );
  }

  async editImage({ prompt, images, signal }) {
    this.log(
      `Ollama does not support image editing. Dropping ${images.length} reference image(s) and generating from prompt only.`
    );
    const result = await this.generateImage({ prompt, signal });
    result.notice =
      "Ollama does not support image editing — your reference images were ignored and a new image was generated from the prompt only.";
    return result;
  }
}

module.exports = { OllamaImageGenerator };
