export interface TelemetryEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface TelemetryClient {
  track(event: TelemetryEvent): void;
  pageView(path: string): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}

class NoopTelemetryClient implements TelemetryClient {
  track(_event: TelemetryEvent): void {
    return;
  }
  pageView(_path: string): void {
    return;
  }
  identify(_userId: string, _traits?: Record<string, unknown>): void {
    return;
  }
}

let client: TelemetryClient = new NoopTelemetryClient();

export function setTelemetryClient(c: TelemetryClient): void {
  client = c;
}

export function getTelemetryClient(): TelemetryClient {
  return client;
}
