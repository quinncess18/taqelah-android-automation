/**
 * Diagnostic logger for the Taqelah Android Automation framework.
 * Logs messages with the [Diagnostic] prefix only when process.env.DEBUG is 'true'.
 *
 * @param {string} message - The diagnostic message to log.
 */
function debugLog(message) {
  if (process.env.DEBUG === 'true') {
    console.log(`[Diagnostic] ${message}`);
  }
}

module.exports = { debugLog };
