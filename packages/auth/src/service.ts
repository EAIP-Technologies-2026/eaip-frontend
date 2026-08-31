import { ApiError, createDefaultClient, type ApiClient, type ApiResponse } from "@eaip/api";
import { getConfig } from "@eaip/config";
import type { AuthTokens, AuthUser, LoginCredentials } from "./types";
import { clearStoredTokens, storeTokens } from "./storage";

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: AuthUser;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
}

class ApiAuthService implements AuthService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response: ApiResponse<LoginResponse> = await this.client.post("/auth/login", {
      username: credentials.email,
      password: credentials.password,
      tenant_id: credentials.tenantId ?? "",
    });

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new ApiError({
        status: 500,
        code: "EMPTY_RESPONSE",
        message: "Login response was empty",
      });
    }

    const { token, refresh_token: refreshToken, user } = response.data;
    storeTokens({ accessToken: token, refreshToken });
    return user;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout", {});
    } catch {
      void 0;
    } finally {
      clearStoredTokens();
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response: ApiResponse<AuthUser> = await this.client.get("/users/me", undefined, {
        timeoutMs: 3000,
        retries: 0,
        suppressSessionExpired: true,
      });

      if (response.error) {
        if (response.error.status === 401 || response.error.status === 403) return null;
        throw response.error;
      }

      return response.data;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return null;
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response: ApiResponse<{ token: string; refresh_token?: string }> = await this.client.post(
      "/auth/refresh",
      { refresh_token: refreshToken },
      {
        timeoutMs: 3000,
        retries: 0,
        suppressSessionExpired: true,
      },
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data?.token) {
      throw new ApiError({
        status: 500,
        code: "EMPTY_RESPONSE",
        message: "Refresh response was empty",
      });
    }

    const tokens: AuthTokens = {
      accessToken: response.data.token,
      refreshToken: response.data.refresh_token,
    };
    storeTokens(tokens);
    return tokens;
  }
}

export function createAuthService(
  tokenProvider: () => string | null,
  apiUrl?: string,
): AuthService {
  const config = getConfig();
  const baseUrl = apiUrl ?? config.apiUrl;
  const client = createDefaultClient({
    baseUrl,
    tokenProvider,
  });
  return new ApiAuthService(client);
}
