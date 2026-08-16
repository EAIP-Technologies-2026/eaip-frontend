import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { getDefaultClient } from "@eaip/api";
import {
  createMarketplaceClient,
  type MarketplacePackage,
  type PackageCategory,
  type Installation,
} from "@eaip/marketplace";

export async function fetchMarketplacePackages(options?: { search?: string; category?: string; page?: number; pageSize?: number }): Promise<ServiceResult<{ packages: MarketplacePackage[]; total: number }>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.listPackages(options);
    return liveResult({ packages: data.packages, total: data.total });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ packages: [], total: 0 }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchFeaturedPackages(): Promise<ServiceResult<MarketplacePackage[]>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.getFeaturedPackages();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCategories(): Promise<ServiceResult<PackageCategory[]>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.listCategories();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchInstallations(): Promise<ServiceResult<Installation[]>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.listInstallations();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function installMarketplacePackage(packageId: string): Promise<ServiceResult<{ status: string; id: string }>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.installPackage(packageId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ status: "failed", id: "" }, "Backend unavailable");
    }
    throw err;
  }
}

export async function uninstallMarketplacePackage(packageId: string): Promise<ServiceResult<{ status: string }>> {
  try {
    const client = createMarketplaceClient(getDefaultClient());
    const data = await client.uninstallPackage(packageId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ status: "failed" }, "Backend unavailable");
    }
    throw err;
  }
}
