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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await client.get("/api/governance/policies");
        setPolicies(res.data.policies || []);
      } catch (err) {
        console.error("Failed to load policies", err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
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
          <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
          <p className="text-muted-foreground">Manage organizational governance and compliance policies.</p>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
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
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No policies found.
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{policy.description}</TableCell>
                  <TableCell>
                    {policy.enabled ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
