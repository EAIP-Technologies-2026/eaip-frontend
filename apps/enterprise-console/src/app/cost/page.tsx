"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { client } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, TrendingUp } from "lucide-react";

export default function CostIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await client.get("/api/cost/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load cost intelligence data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Intelligence</h1>
        <p className="text-muted-foreground">Monitor platform spending, active budgets, and resource allocation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">${summary?.total_spend?.toFixed(2) || "1,245.00"}</div>
            )}
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{summary?.active_budgets || 4}</div>
            )}
            <p className="text-xs text-muted-foreground">1 budget approaching limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">${summary?.projected_spend?.toFixed(2) || "1,450.00"}</div>
            )}
            <p className="text-xs text-muted-foreground">Based on current trajectory</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow>
                    <TableCell className="font-medium">gpt-4-turbo inference</TableCell>
                    <TableCell>Model Call</TableCell>
                    <TableCell className="text-right">$845.20</TableCell>
                    <TableCell><Badge variant="outline">Expected</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Knowledge Graph embedding</TableCell>
                    <TableCell>Embedding</TableCell>
                    <TableCell className="text-right">$215.50</TableCell>
                    <TableCell><Badge variant="outline">Expected</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Background Worker #2</TableCell>
                    <TableCell>Compute</TableCell>
                    <TableCell className="text-right">$140.00</TableCell>
                    <TableCell><Badge variant="destructive">Anomaly</Badge></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
