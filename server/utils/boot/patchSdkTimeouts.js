const LOG_PREFIX = "\x1b[36m[SDK Timeout Patch]\x1b[0m";
const DEFAULT_TIMEOUT_MS = 600_000; // 10 minutes default
const DEFAULT_MAX_RETRIES = 0;

/**
 * Raises undici's global dispatcher timeouts from the 5-minute default to
 * at least 10 minutes for the 80% use case so
 * the transport layer doesn't kill connections before the SDK does.
 *
 * When `ContextIQ_FETCH_TIMEOUT` is set (milliseconds), both the undici
 * dispatcher and the SDK-level AbortController deadline are raised to that
 * value instead — for users with slow local models that need even longer.
 *
 * Must be called before any provider module is required.
 */
function patchSdkTimeouts() {
  const envDefinedTimeout = process.env.CONTEXTIQ_FETCH_TIMEOUT || process.env.ContextIQ_FETCH_TIMEOUT;
  const envDefinedMaxRetries = process.env.CONTEXTIQ_MAX_RETRIES || process.env.ContextIQ_MAX_RETRIES;
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let maxRetries = DEFAULT_MAX_RETRIES;

  if (envDefinedTimeout) {
    const parsed = parseInt(envDefinedTimeout, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      console.warn(
        `${LOG_PREFIX} CONTEXTIQ_FETCH_TIMEOUT="${envDefinedTimeout}" is not a valid positive integer — using default ${DEFAULT_TIMEOUT_MS}ms.`
      );
    } else {
      timeoutMs = parsed;
    }
  }

  if (envDefinedMaxRetries) {
    const parsed = parseInt(envDefinedMaxRetries, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      console.warn(
        `${LOG_PREFIX} CONTEXTIQ_MAX_RETRIES="${envDefinedMaxRetries}" is not a valid non-negative integer — using default ${DEFAULT_MAX_RETRIES}.`
      );
    } else {
      maxRetries = parsed;
    }
  }

  const humanSecs = `${(timeoutMs / 1000).toFixed(0)}s`;
  try {
    const { Agent, setGlobalDispatcher } = require("undici");
    setGlobalDispatcher(
      new Agent({ headersTimeout: timeoutMs, bodyTimeout: timeoutMs })
    );
    console.log(
      `${LOG_PREFIX} undici global dispatcher — headersTimeout & bodyTimeout ${humanSecs}`
    );
  } catch {
    console.warn(
      `${LOG_PREFIX} undici not available — transport-level timeout not patched.`
    );
  }

  const patchedPackages = new Set();
  function patchTargetSdk(SDK, label) {
    if (!SDK || patchedPackages.has(label)) return;
    patchedPackages.add(label);
    const ClientClass = SDK.default ?? SDK[label] ?? SDK;
    let proto = ClientClass?.prototype;
    while (proto && typeof proto.buildRequest !== "function") {
      proto = Object.getPrototypeOf(proto);
    }
    if (!proto) return;

    const origBuild = proto.buildRequest;
    proto.buildRequest = function patchedBuildRequest(options, ...rest) {
      if (!options.timeout) options.timeout = timeoutMs;
      return origBuild.call(this, options, ...rest);
    };

    if (typeof proto.makeRequest === "function") {
      const origMakeRequest = proto.makeRequest;
      proto.makeRequest = function patchedMakeRequest(
        optionsInput,
        _retriesRemaining
      ) {
        return origMakeRequest.call(this, optionsInput, maxRetries);
      };
    }
  }

  // Hook Module.prototype.require to lazily patch SDKs when first imported by any route/provider
  const Module = require("module");
  const originalRequire = Module.prototype.require;
  const targetPkgs = {
    openai: "OpenAI",
    "@anthropic-ai/sdk": "Anthropic",
  };

  Module.prototype.require = function (id) {
    const exports = originalRequire.apply(this, arguments);
    if (targetPkgs[id]) {
      patchTargetSdk(exports, targetPkgs[id]);
      if (patchedPackages.size >= Object.keys(targetPkgs).length) {
        Module.prototype.require = originalRequire;
      }
    }
    return exports;
  };
}

module.exports = patchSdkTimeouts;
