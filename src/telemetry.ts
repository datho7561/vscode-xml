import { getRedHatUUID, getTelemetryService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";

/**
 * Singleton wrapping the telemetry service for vscode-xml
 */
export namespace Telemetry {

  let _telemetryManager: TelemetryService = null;

  /**
   * Starts the telemetry service
   *
   * @returns when the telemetry service has been started
   * @throws Error if the telemetry service has already been started
   */
  export async function startTelemetry(): Promise<void> {
    if (!!_telemetryManager) {
      throw new Error("The telemetry service for vscode-xml has already been started")
    }
    _telemetryManager = await getTelemetryService("redhat.vscode-xml");
  }

  /**
   * Returns the telemetry service
   *
   * @returns the telemetry service
   * @throws Error if the telemetry service has not been started
   */
  export async function getTelemetryManager(): Promise<TelemetryService> {
    if (!_telemetryManager) {
      throw new Error("The telemetry service for vscode-xml has not been started yet");
    }
    return _telemetryManager;
  }

  export async function getUUID(): Promise<string> {
    return getRedHatUUID();
  }

}
