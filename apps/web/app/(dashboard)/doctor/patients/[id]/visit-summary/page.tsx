import { VisitSummaryTabs } from "@/components/doctor/visit-summary-tabs";

export default function VisitSummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <VisitSummaryTabs patientId={params.id} />
    </div>
  );
}