"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedications } from "@/hooks/use-medications";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function MedicationsPage() {
  const { data: medications = [], isLoading, error } = useMedications();

  if (isLoading) return <Card><CardContent>Loading medications...</CardContent></Card>;
  if (error) return <Card><CardContent className="text-sm text-red-500">Failed to load medications. Please try again.</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Medications</CardTitle>
            <CardDescription>Manage your medication inventory.</CardDescription>
          </div>
          <Link href="/medications/all">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No medication records found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.slice(0, 5).map((med) => (
                <TableRow key={med.id}>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.category}</TableCell>
                  <TableCell>{med.stock_value}</TableCell>
                  <TableCell>{med.expiry_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}