const { v4 } = require("uuid");
const { SystemSettings } = require("./systemSettings");

// Map of events and last sent time to check if the event is on cooldown
// This will be cleared on server restart - but that is fine since it is mostly to just
// prevent spamming the logs.
const _TelemetryCooldown = new Map();

const Telemetry = {
  // Write-only key. It can't read events or any of your other data, so it's safe to use in public apps.
  pubkey: "phc_9qu7QLpV8L84P3vFmEiZxL020t2EqIubP7HHHxrSsqS",
  stubDevelopmentEvents: true, // [DO NOT TOUCH] Core team only.
  label: "telemetry_id",
  /*
  Key value pairs of events that should be debounced to prevent spamming the logs.
  This should be used for events that could be triggered in rapid succession that are not useful to atomically log.
  The value is the number of seconds to debounce the event
  */
  debounced: {
    sent_chat: 1800,
    agent_chat_sent: 1800,
    agent_chat_started: 1800,
    agent_tool_call: 1800,

    // Document mgmt events
    document_uploaded: 30,
    documents_embedded_in_workspace: 30,
    link_uploaded: 30,
    raw_document_uploaded: 30,
    document_parsed: 30,
    agent_generated_file_downloaded: 30,
  },

  id: async function () {
    const result = await SystemSettings.get({ label: this.label });
    return result?.value || null;
  },

  connect: async function () {
    const client = this.client();
    const distinctId = await this.findOrCreateId();
    return { client, distinctId };
  },

  isDev: function () {
    return process.env.NODE_ENV === "development" && this.stubDevelopmentEvents;
  },

  client: function () {
    return null;
  },

  runtime: function () {
    if (process.env.NODE_ENV === "production") return "production";
    return "other";
  },

  isOnCooldown: function (_event) {
    return false;
  },

  markOnCooldown: function (_event) {
    return;
  },

  sendTelemetry: async function () {
    return;
  },

  flush: async function () {
    const client = this.client();
    if (!client) return;
    await client.shutdownAsync();
  },

  setUid: async function () {
    const newId = v4();
    await SystemSettings._updateSettings({ [this.label]: newId });
    return newId;
  },

  findOrCreateId: async function () {
    let currentId = await this.id();
    if (currentId) return currentId;

    currentId = await this.setUid();
    return currentId;
  },
};

module.exports = { Telemetry };
