import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend marketplace_routes.py
// ---------------------------------------------------------------------------

export interface MarketplacePackage {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PackageCategory {
  id: string;
  name: string;
  count: number;
}

export interface Installation {
  id: string;
  packageId: string;
  installedAt: string;
  status: string;
}

export interface PackageListResponse {
  packages: MarketplacePackage[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceClient {
  listPackages(options?: { search?: string; category?: string; page?: number; pageSize?: number }): Promise<PackageListResponse>;
  getFeaturedPackages(): Promise<MarketplacePackage[]>;
  getPackage(packageId: string): Promise<MarketplacePackage>;
  createPackage(name: string, description?: string): Promise<{ id: string; name: string; status: string }>;
  listInstallations(): Promise<Installation[]>;
  installPackage(packageId: string): Promise<{ status: string; id: string }>;
  uninstallPackage(packageId: string): Promise<{ status: string }>;
  listCategories(): Promise<PackageCategory[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiMarketplaceClient implements MarketplaceClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listPackages(options?: { search?: string; category?: string; page?: number; pageSize?: number }): Promise<PackageListResponse> {
    const params: Record<string, string> = {};
    if (options?.search) params.search = options.search;
    if (options?.category) params.category = options.category;
    if (options?.page !== undefined) params.page = String(options.page);
    if (options?.pageSize !== undefined) params.pageSize = String(options.pageSize);

    const response = await this.client.get<{ packages: MarketplacePackage[]; total: number; page: number; pageSize: number }>(
      "/marketplace/packages",
      params
    );
    if (response.error) throw response.error;
    return response.data ?? { packages: [], total: 0, page: 1, pageSize: 20 };
  }

  async getFeaturedPackages(): Promise<MarketplacePackage[]> {
    const response = await this.client.get<{ packages: MarketplacePackage[] }>("/marketplace/packages/featured");
    if (response.error) throw response.error;
    return response.data?.packages ?? [];
  }

  async getPackage(packageId: string): Promise<MarketplacePackage> {
    const response = await this.client.get<MarketplacePackage>(`/marketplace/packages/${packageId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Package ${packageId} not found`);
    return response.data;
  }

  async createPackage(name: string, description?: string): Promise<{ id: string; name: string; status: string }> {
    const response = await this.client.post<{ id: string; name: string; status: string }>("/marketplace/packages", {
      name,
      description,
    });
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on package creation");
    return response.data;
  }

  async listInstallations(): Promise<Installation[]> {
    const response = await this.client.get<Installation[]>("/marketplace/installations");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async installPackage(packageId: string): Promise<{ status: string; id: string }> {
    const response = await this.client.post<{ status: string; id: string }>(`/marketplace/packages/${packageId}/install`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on package install");
    return response.data;
  }

  async uninstallPackage(packageId: string): Promise<{ status: string }> {
    const response = await this.client.post<{ status: string }>(`/marketplace/packages/${packageId}/uninstall`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on package uninstall");
    return response.data;
  }

  async listCategories(): Promise<PackageCategory[]> {
    const response = await this.client.get<{ categories: PackageCategory[] }>("/marketplace/categories");
    if (response.error) throw response.error;
    return response.data?.categories ?? [];
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMarketplaceClient(client?: ApiClient): MarketplaceClient {
  return new ApiMarketplaceClient(client);
}
