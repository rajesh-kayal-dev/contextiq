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

// Add collector's node_modules to Node's module resolution path so that
// collector dependencies (mime, pdf-parse, etc.) can be found when running
// in the server process (in-process mode on Render).
if (
  fs.existsSync(COLLECTOR_NODE_MODULES) &&
  !Module.globalPaths.includes(COLLECTOR_NODE_MODULES)
) {
  Module.globalPaths.push(COLLECTOR_NODE_MODULES);
  console.info("[InProcessCollector] Added collector node_modules to module resolution path.");
}

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
