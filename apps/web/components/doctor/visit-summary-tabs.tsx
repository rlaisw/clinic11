"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatient } from "@/hooks/use-patients";
import { useVisitSummaries, useCreateVisitSummary } from "@/hooks/use-visit-summaries";
import { PlusIcon } from "lucide-react";

interface VisitSummaryTabsProps {
  patientId: string;
}

export function VisitSummaryTabs({ patientId }: VisitSummaryTabsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: patient } = usePatient(patientId);
  const { data: visits, isLoading } = useVisitSummaries(patientId);
  const createMutation = useCreateVisitSummary(patientId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    visit_date: string;
    visit_type: string;
    diagnosis: string;
    notes: string;
  }>();

  const onSubmit = async (data: { visit_date: string; visit_type: string; diagnosis: string; notes: string }) => {
    try {
      await createMutation.mutateAsync({
        patient: patientId,
        ...data,
      });
      reset();
      setShowCreateForm(false);
    } catch {
      console.error("Failed to create visit summary");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visit Summaries</span>
            {!showCreateForm && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                New Visit Summary
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 mb-4">
              <h3 className="font-semibold">New Visit Summary</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input value={patient ? `${patient.first_name} ${patient.last_name}` : ""} readOnly disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="visit_date">Visit Date</Label>
                  <Input id="visit_date" type="date" defaultValue={today} {...register("visit_date", { required: true })} />
                  {errors.visit_date && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="visit_type">Visit Type</Label>
                <Input id="visit_type" placeholder="e.g., Consultation, Follow-up" {...register("visit_type", { required: true })} />
                {errors.visit_type && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea id="diagnosis" {...register("diagnosis")} rows={2} />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Visit Summary"}
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : visits && visits.length > 0 ? (
            <div className="space-y-3">
              {visits.map((visit: any) => (
                <div key={visit.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {visit.visit_type} - {visit.visit_date}
                      </p>
                      <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${visit.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {visit.status}
                    </span>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{visit.notes}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    {visit.certificate && <span>Linked Certificate</span>}
                    {visit.receipt && <span>Linked Receipt</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No visit summaries yet. Click "New Visit Summary" to create one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}