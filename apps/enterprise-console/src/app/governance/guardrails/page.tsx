"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { client } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuardrailsPage() {
  const [loading, setLoading] = useState(true);
  const [guardrails, setGuardrails] = useState<any>(null);

  useEffect(() => {
    async function loadGuardrails() {
      try {
        const res = await client.get("/api/governance/guardrails");
        setGuardrails(res.data);
      } catch (err) {
        console.error("Failed to load guardrails", err);
      } finally {
        setLoading(false);
      }
    }
    loadGuardrails();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/governance">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Guardrails</h1>
          <p className="text-muted-foreground">Monitor the status and enforcement of platform AI guardrails.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engine Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="flex items-center gap-4">
              {guardrails?.status === "healthy" ? (
                <>
                  <ShieldCheck className="h-12 w-12 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-500">Active and Enforcing</div>
                    <div className="text-muted-foreground">All runtime safety checks are operational.</div>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-12 w-12 text-amber-500" />
                  <div>
                    <div className="text-2xl font-bold text-amber-500 capitalize">{guardrails?.status || "Unknown"}</div>
                    <div className="text-muted-foreground">Details: {JSON.stringify(guardrails?.details || {})}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configured Protections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="font-medium">PII & Data Leakage Protection</div>
                  <div className="text-sm text-muted-foreground">Prevents sensitive information from being sent to external models.</div>
                </div>
                <Badge>Enforced</Badge>
             </div>
             <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="font-medium">Jailbreak Detection</div>
                  <div className="text-sm text-muted-foreground">Detects and blocks adversarial prompt injection attempts.</div>
                </div>
                <Badge>Enforced</Badge>
             </div>
             <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="font-medium">Output Toxicity Filter</div>
                  <div className="text-sm text-muted-foreground">Filters harmful or inappropriate content in model responses.</div>
                </div>
                <Badge>Enforced</Badge>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
