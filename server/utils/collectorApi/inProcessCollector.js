/**
 * InProcessCollector - A direct in-process implementation of the collector API
 * that bypasses all HTTP networking. Used as the primary method for processing
 * documents when the server and collector run in the same process (e.g. Render).
 */

const path = require("path");
const fs = require("fs");
const Module = require("module");

const COLLECTOR_DIR = path.resolve(__dirname, "../../../collector");
const COLLECTOR_NODE_MODULES = path.join(COLLECTOR_DIR, "node_modules");

// Add both collector's node_modules and server's node_modules to Node module resolution so collector
// dependencies (mime, pdf-parse, etc.) are found when executing in-process.
// We patch both NODE_PATH and call _initPaths for broad Node.js version compatibility.
function ensureCollectorModulesResolvable() {
  const SERVER_NODE_MODULES = path.resolve(__dirname, "../../node_modules");
  const pathsToAdd = [COLLECTOR_NODE_MODULES, SERVER_NODE_MODULES];

  const currentNodePath = process.env.NODE_PATH || "";
  let newPath = currentNodePath;

  for (const dir of pathsToAdd) {
    if (fs.existsSync(dir) && !newPath.includes(dir)) {
      newPath = newPath ? `${dir}:${newPath}` : dir;
    }
  }

  if (newPath !== currentNodePath) {
    process.env.NODE_PATH = newPath;
    // Reinitialize the module paths so Node.js picks up the new NODE_PATH entry
    try {
      Module._initPaths();
      console.info("[InProcessCollector] Node resolution paths updated with:", newPath);
    } catch (e) {
      console.warn("[InProcessCollector] Could not call Module._initPaths:", e.message);
    }
  }

  // Also push directly into globalPaths as a secondary fallback
  for (const dir of pathsToAdd) {
    if (fs.existsSync(dir) && !Module.globalPaths.includes(dir)) {
      Module.globalPaths.unshift(dir);
    }
  }
}

ensureCollectorModulesResolvable();

/**
 * Check if the collector module is available for in-process execution
 */
function isCollectorAvailable() {
  return fs.existsSync(path.join(COLLECTOR_DIR, "processSingleFile", "index.js"));
}

/**
 * Process a document file directly in-process (no HTTP)
 * @param {string} filename - The filename in hotdir to process
 * @param {Object} options - Processing options
 * @param {Object} metadata - Metadata to attach
 */
async function processDocument(filename, options = {}, metadata = {}) {
  if (!filename) return { success: false, reason: "No filename provided.", documents: [] };
  try {
    const { processSingleFile } = require(path.join(COLLECTOR_DIR, "processSingleFile"));
    return await processSingleFile(filename, options, metadata);
  } catch (e) {
    console.error("[InProcessCollector] processDocument error:", e.message, e);
    return { success: false, reason: e.message, documents: [] };
  }
}

/**
 * Parse a document file directly in-process (no HTTP)
 * @param {string} filename - The filename in hotdir to parse
 * @param {Object} parseOptions - Parse options including optional absolutePath
 */
async function parseDocument(filename, parseOptions = {}) {
  if (!filename) return { success: false, reason: "No filename provided.", documents: [] };
  try {
    const { processSingleFile } = require(path.join(COLLECTOR_DIR, "processSingleFile"));
    return await processSingleFile(filename, {
      ...parseOptions,
      parseOnly: true,
    });
  } catch (e) {
    console.error("[InProcessCollector] parseDocument error:", e.message, e);
    return { success: false, reason: e.message, documents: [] };
  }
}

/**
 * Get the hotdir path where files should be uploaded to
 */
function getHotdir() {
  return path.join(COLLECTOR_DIR, "hotdir");
}

module.exports = { isCollectorAvailable, processDocument, parseDocument, getHotdir };
