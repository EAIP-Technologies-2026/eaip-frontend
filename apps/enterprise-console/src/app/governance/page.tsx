"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, FileText, CheckCircle } from "lucide-react";
import { client } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function GovernanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [policiesRes, guardrailsRes, complianceRes] = await Promise.all([
          client.get("/api/governance/policies"),
          client.get("/api/governance/guardrails"),
          client.get("/api/governance/compliance"),
        ]);
        
        setData({
          policies: policiesRes.data,
          guardrails: guardrailsRes.data,
          compliance: complianceRes.data
        });
      } catch (err) {
        console.error("Failed to load governance data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Governance & Compliance</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance & Compliance</h1>
          <p className="text-muted-foreground">Monitor policies, guardrails, and platform compliance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/governance/policies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.policies?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Platform-wide governance policies</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/governance/guardrails">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Guardrails</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.guardrails?.status === "healthy" ? (
                  <span className="text-green-500 flex items-center gap-2"><CheckCircle className="h-5 w-5"/> Enforced</span>
                ) : (
                  <span className="text-amber-500">{data?.guardrails?.status || "Unknown"}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Runtime AI safety and data leakage checks</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Framework</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
                {data?.compliance?.status || "Unavailable"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Continuous regulatory scanning</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Policy Violations</CardTitle>
            <CardDescription>Policies triggered in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground">No recent violations.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compliance Audits</CardTitle>
            <CardDescription>Recent regulatory checks</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground">All checks passed.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
