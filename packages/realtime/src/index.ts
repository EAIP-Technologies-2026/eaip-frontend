"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type RealtimeEventHandler = (data: unknown) => void;

export interface RealtimeMessage {
  type?: string;
  channel?: string;
  data?: unknown;
}

export interface RealtimeClient {
  connect(): void;
  disconnect(): void;
  subscribe(channel: string, handler: RealtimeEventHandler): () => void;
  unsubscribe(channel: string, handler: RealtimeEventHandler): void;
  emit(channel: string, data: unknown): void;
}

export interface WebSocketRealtimeClientOptions {
  url: string;
  tokenProvider?: () => string | null | Promise<string | null>;
  reconnect?: boolean;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  fallbackPollUrl?: string | null;
}

export class WebSocketRealtimeClient implements RealtimeClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<RealtimeEventHandler>>();
  private url: string;
  private tokenProvider?: () => string | null | Promise<string | null>;
  private reconnectEnabled: boolean;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatIntervalMs: number;
  private heartbeatTimeoutMs: number;
  private maxReconnectDelayMs: number;
  private maxReconnectAttempts: number;
  private reconnectAttempt = 0;
  private reconnectConfigured: boolean;
  private manuallyDisconnected = false;
  private fallbackPollUrl: string | null;
  private fallbackTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: WebSocketRealtimeClientOptions) {
    this.url = options.url;
    this.tokenProvider = options.tokenProvider;
    this.reconnectEnabled = options.reconnect ?? true;
    this.reconnectConfigured = this.reconnectEnabled;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 30_000;
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 10_000;
    this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? 30_000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.fallbackPollUrl = options.fallbackPollUrl ?? null;
  }

  private async resolveUrl(): Promise<string> {
    const token = await this.tokenProvider?.();
    if (!token) return this.url;
    const separator = this.url.includes("?") ? "&" : "?";
    return `${this.url}${separator}token=${encodeURIComponent(token)}`;
  }

  connect(): void {
    this.manuallyDisconnected = false;
    this.reconnectEnabled = this.reconnectConfigured;
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING)
      return;
    void this._connect();
  }

  private async _connect(): Promise<void> {
    try {
      const resolvedUrl = await this.resolveUrl();
      if (this.manuallyDisconnected) return;
      this.ws = new WebSocket(resolvedUrl);
      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
        this.startHeartbeat();
        this.stopFallbackPolling();
        this.resubscribe();
      };
      this.ws.onmessage = (event) => {
        this.handleMessage(String(event.data));
      };
      this.ws.onclose = () => {
        this.cleanupSocket();
        if (this.manuallyDisconnected) return;
        if (this.reconnectEnabled) {
          this.scheduleReconnect();
        } else if (this.fallbackPollUrl) {
          this.startFallbackPolling();
        }
      };
      this.ws.onerror = () => {
        // Let onclose handle reconnection.
      };
    } catch {
      if (this.reconnectEnabled) this.scheduleReconnect();
      else if (this.fallbackPollUrl) this.startFallbackPolling();
    }
  }

  private cleanupSocket(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      if (this.fallbackPollUrl) this.startFallbackPolling();
      return;
    }
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, this.maxReconnectDelayMs);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this._connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
        this.heartbeatTimeout = setTimeout(() => {
          // No pong received; force reconnect.
          this.ws?.close();
        }, this.heartbeatTimeoutMs);
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private startFallbackPolling(): void {
    if (this.fallbackTimer || !this.fallbackPollUrl) return;
    const url = this.fallbackPollUrl;
    this.fallbackTimer = setInterval(() => {
      void (async () => {
        try {
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) return;
          const data = (await res.json()) as unknown[];
          for (const event of data) {
            this.dispatch("all", event);
          }
        } catch {
          // ignore
        }
      })();
    }, 10_000);
  }

  private stopFallbackPolling(): void {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  private handleMessage(raw: string): void {
    try {
      const msg = JSON.parse(raw) as RealtimeMessage;
      if (msg.type === "pong") {
        if (this.heartbeatTimeout) {
          clearTimeout(this.heartbeatTimeout);
          this.heartbeatTimeout = null;
        }
        return;
      }
      const channel = msg.channel ?? "all";
      this.dispatch(channel, msg.data ?? msg);
    } catch {
      void 0;
    }
  }

  private dispatch(channel: string, data: unknown): void {
    const channelHandlers = this.handlers.get(channel);
    if (channelHandlers) {
      for (const handler of channelHandlers) {
        try {
          handler(data);
        } catch {
          void 0;
        }
      }
    }
    if (channel !== "all") {
      const allHandlers = this.handlers.get("all");
      if (allHandlers) {
        for (const handler of allHandlers) {
          try {
            handler(data);
          } catch {
            void 0;
          }
        }
      }
    }
  }

  private resubscribe(): void {
    for (const channel of this.handlers.keys()) {
      this.ws?.send(JSON.stringify({ type: "subscribe", channel }));
    }
  }

  disconnect(): void {
    this.manuallyDisconnected = true;
    this.reconnectEnabled = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopFallbackPolling();
    const socket = this.ws;
    this.cleanupSocket();
    socket?.close();
  }

  subscribe(channel: string, handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.add(handler);
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", channel }));
    }
    return () => {
      this.unsubscribe(channel, handler);
    };
  }

  unsubscribe(channel: string, handler: RealtimeEventHandler): void {
    this.handlers.get(channel)?.delete(handler);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", channel }));
    }
  }

  emit(channel: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "emit", channel, data }));
    }
  }
}

export interface UseRealtimeOptions {
  url?: string;
  channels?: string[];
  onMessage?: (channel: string, data: unknown) => void;
  enabled?: boolean;
  tokenProvider?: () => string | null | Promise<string | null>;
}

export function useRealtime({
  url,
  channels = [],
  onMessage,
  enabled = true,
  tokenProvider,
}: UseRealtimeOptions): { connected: boolean; error: Error | null } {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<RealtimeClient | null>(null);
  const onMessageRef = useRef(onMessage);
  const tokenProviderRef = useRef(tokenProvider);
  const channelsRef = useRef(channels);
  onMessageRef.current = onMessage;
  tokenProviderRef.current = tokenProvider;
  channelsRef.current = channels;
  const channelsKey = channels.join("\u0000");

  const resolveUrl = useCallback(() => {
    if (url) return url;
    if (typeof window === "undefined") return "";
    if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, [url]);

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = resolveUrl();
    if (!wsUrl) return;

    const fallbackPollUrl = wsUrl.replace(/^ws/, "http").replace("/ws", "/events/activity");
    const client = new WebSocketRealtimeClient({
      url: wsUrl,
      tokenProvider: () => tokenProviderRef.current?.() ?? null,
      reconnect: true,
      fallbackPollUrl,
    });
    clientRef.current = client;
    setError(null);
    setConnected(false);

    const cleanupFns: (() => void)[] = [];

    const checkInterval = window.setInterval(() => {
      const ws = (client as unknown as { ws?: WebSocket }).ws;
      if (ws?.readyState === WebSocket.OPEN) {
        setConnected(true);
        setError(null);
      } else if (ws?.readyState === WebSocket.CLOSED) {
        setConnected(false);
      }
    }, 1000);

    client.connect();

    for (const channel of channelsRef.current) {
      cleanupFns.push(
        client.subscribe(channel, (data) => {
          onMessageRef.current?.(channel, data);
        }),
      );
    }

    return () => {
      window.clearInterval(checkInterval);
      for (const cleanup of cleanupFns) {
        cleanup();
      }
      client.disconnect();
      clientRef.current = null;
      setConnected(false);
    };
  }, [enabled, resolveUrl, channelsKey]);

  return { connected, error };
}

export function createRealtimeClient(
  url: string,
  tokenProvider?: () => string | null,
): RealtimeClient {
  return new WebSocketRealtimeClient({ url, tokenProvider });
}
