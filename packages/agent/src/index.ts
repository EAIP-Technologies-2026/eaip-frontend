export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentSession {
  id: string;
  messages: AgentMessage[];
  createdAt: string;
}

export interface AgentClient {
  createSession(): Promise<AgentSession>;
  sendMessage(sessionId: string, message: string): Promise<string>;
  getSession(sessionId: string): Promise<AgentSession | null>;
}

export class ApiAgentClient implements AgentClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createSession(): Promise<AgentSession> {
    const res = await fetch(`${this.baseUrl}/agent/sessions`, { method: "POST" });
    return res.json() as Promise<AgentSession>;
  }

  async sendMessage(sessionId: string, message: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/agent/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: message }),
    });
    const data = (await res.json()) as { content: string };
    return data.content;
  }

  async getSession(sessionId: string): Promise<AgentSession | null> {
    try {
      const res = await fetch(`${this.baseUrl}/agent/sessions/${sessionId}`);
      if (!res.ok) return null;
      return res.json() as Promise<AgentSession>;
    } catch {
      return null;
    }
  }
}
