export type RealtimeEventHandler = (data: unknown) => void;

export interface RealtimeClient {
  connect(): void;
  disconnect(): void;
  subscribe(channel: string, handler: RealtimeEventHandler): () => void;
  emit(channel: string, data: unknown): void;
}

export class WebSocketRealtimeClient implements RealtimeClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<RealtimeEventHandler>>();
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as { channel: string; data: unknown };
        const channelHandlers = this.handlers.get(msg.channel);
        if (channelHandlers) {
          for (const handler of channelHandlers) {
            handler(msg.data);
          }
        }
      } catch {
        void 0;
      }
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  subscribe(channel: string, handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.add(handler);
    }
    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  emit(channel: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ channel, data }));
    }
  }
}
