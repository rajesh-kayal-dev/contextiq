// Telemetry is permanently disabled in ContextIQ.
async function setupTelemetry() {
  console.log(
    `\x1b[31m[TELEMETRY DISABLED]\x1b[0m Telemetry is permanently disabled in ContextIQ - 0 outbound events will send.`
  );
  return true;
}

module.exports = setupTelemetry;
