"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api";
import { usePatient } from "@/hooks/use-patients";
import {
  useReceipts,
  useCreateReceipt,
  useDownloadReceiptPdf,
  useRevokeReceipt,
} from "@/hooks/use-receipts";
import { useReceiptPreview } from "@/hooks/useReceiptPreview";
import { PlusIcon, DownloadIcon, XCircleIcon, Search, EyeIcon, ShareIcon } from "lucide-react";

export function ReceiptTabs({ patientId, disabled }: { patientId: string; disabled?: boolean }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [shareDialogId, setShareDialogId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: receipts, isLoading: receiptsLoading } = useReceipts(patientId, searchTerm || undefined);
  const createMutation = useCreateReceipt(patientId);
  const revokeMutation = useRevokeReceipt(patientId);
  const downloadPdfMutation = useDownloadReceiptPdf();

  if (patientLoading) {
    return <div className="text-sm text-muted-foreground">Loading patient information...</div>;
  }

  if (!patient) {
    return <div className="text-sm text-red-500">Patient not found.</div>;
  }

  const handleDownloadPdf = async (receiptId: string) => {
    try {
      const blob = await downloadPdfMutation.mutateAsync(receiptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download PDF");
    }
  };

  const handlePreview = async (receiptId: string) => {
    setPreviewId(receiptId);
  };

  const handleShare = async (receiptId: string) => {
    setShareUrl(`${window.location.origin}/verify-receipt/${receiptId}`);
    setShareDialogId(receiptId);
  };

  const handleRevoke = async (receiptId: string) => {
    if (!confirm("Are you sure you want to revoke this receipt?")) return;
    try {
      await revokeMutation.mutateAsync(receiptId);
    } catch {
      console.error("Failed to revoke receipt");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Receipts</span>
            {!disabled && !showCreateForm && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                New Receipt
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {showCreateForm && (
            <ReceiptForm
              patientName={`${patient.first_name} ${patient.last_name}`}
              patientHkid={patient.hkid || ""}
              onCancel={() => setShowCreateForm(false)}
              isPending={createMutation.isPending}
              onSubmit={async (data) => {
                try {
                  await createMutation.mutateAsync({
                    consultation: data.consultation,
                    medications: data.medications,
                    investigations: data.investigations,
                    procedures: data.procedures,
                    misc: data.misc,
                    consultation_free: data.consultation_free,
                    medications_free: data.medications_free,
                    investigations_free: data.investigations_free,
                    procedures_free: data.procedures_free,
                    misc_free: data.misc_free,
                    total_free: data.total_free,
                    diagnosis: data.diagnosis,
                  });
                  setShowCreateForm(false);
                } catch (err: any) {
                  console.error("Failed to create receipt", err?.response?.data || err);
                }
              }}
            />
          )}

          {receiptsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : receipts && receipts.length > 0 ? (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">{receipt.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      Ref: {receipt.rref} | Date: {receipt.date} | ${receipt.total_free} | Status: {receipt.status}
                    </p>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(receipt.id)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(receipt.id)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleShare(receipt.id)}>
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                    {receipt.status === "active" && !disabled && (
                      <Button size="sm" variant="ghost" onClick={() => handleRevoke(receipt.id)}>
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No receipts issued yet. Click &ldquo;New Receipt&rdquo; to create one.
            </p>
          )}
        </CardContent>
      </Card>

      {previewId && (
        <ReceiptPreviewModal receiptId={previewId} onClose={() => setPreviewId(null)} />
      )}

      {shareDialogId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShareDialogId(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Share Receipt</h2>
            <Label>Verification URL</Label>
            <Input value={shareUrl} readOnly className="bg-muted mb-4" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShareDialogId(null)}>Close</Button>
              <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptPreviewModal({ receiptId, onClose }: { receiptId: string; onClose: () => void }) {
  const { pdfUrl, isLoading, error, openModal, closeModal } = useReceiptPreview(receiptId);

  useEffect(() => {
    openModal();
  }, [openModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); onClose(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); closeModal(); };
  }, [closeModal, onClose]);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <h2 className="text-lg font-bold">Receipt Preview</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>Download</Button>
            <button onClick={() => { closeModal(); onClose(); }} className="text-gray-500 hover:text-gray-700 p-1" aria-label="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Spinner className="w-12 h-12" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error.message || "Failed to load PDF"}</p>
              <Button variant="outline" onClick={openModal}>Retry</Button>
            </div>
          </div>
        )}

        {pdfUrl && !isLoading && !error && (
          <iframe src={pdfUrl} className="w-full flex-1 border-0" title="Receipt PDF" />
        )}
      </div>
    </div>
  );
}

interface ReceiptFormProps {
  patientName: string;
  patientHkid: string;
  onCancel: () => void;
  isPending: boolean;
  onSubmit: (data: {
    consultation: string;
    medications?: string;
    investigations?: string;
    procedures?: string;
    misc?: string;
    consultation_free: number;
    medications_free: number;
    investigations_free: number;
    procedures_free: number;
    misc_free: number;
    total_free: number;
    diagnosis: string;
  }) => void;
}

function ReceiptForm({ patientName, patientHkid, onCancel, isPending, onSubmit }: ReceiptFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    consultation: string;
    medications: string;
    investigations: string;
    procedures: string;
    misc: string;
    consultation_cost: number;
    medications_cost: number;
    investigations_cost: number;
    procedures_cost: number;
    misc_cost: number;
    consultation_free: number;
    medications_free: number;
    investigations_free: number;
    procedures_free: number;
    misc_free: number;
    diagnosis: string;
  }>();

  const v = (field: any) => Number(field) || 0;
  const consultation_cost = v(watch("consultation_cost"));
  const medications_cost = v(watch("medications_cost"));
  const investigations_cost = v(watch("investigations_cost"));
  const procedures_cost = v(watch("procedures_cost"));
  const misc_cost = v(watch("misc_cost"));
  const consultation_free = v(watch("consultation_free"));
  const medications_free = v(watch("medications_free"));
  const investigations_free = v(watch("investigations_free"));
  const procedures_free = v(watch("procedures_free"));
  const misc_free = v(watch("misc_free"));

  const total = (consultation_cost + medications_cost + investigations_cost + procedures_cost + misc_cost)
    - (consultation_free + medications_free + investigations_free + procedures_free + misc_free);
  const totalDisplay = Number.isNaN(total) ? "0.00" : total.toFixed(2);

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit({
      consultation: data.consultation,
      medications: data.medications,
      investigations: data.investigations,
      procedures: data.procedures,
      misc: data.misc,
      consultation_free,
      medications_free,
      investigations_free,
      procedures_free,
      misc_free,
      total_free: Math.max(0, total),
      diagnosis: data.diagnosis,
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 border rounded-lg p-4 mb-4">
      <h3 className="font-semibold">New Receipt</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Patient Name</Label>
          <Input value={patientName} readOnly disabled className="bg-muted" />
        </div>
        <div>
          <Label>HKID</Label>
          <Input value={patientHkid} readOnly disabled className="bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Consultation</Label>
          <Textarea {...register("consultation", { required: "Required" })} rows={2} placeholder="Description" />
          <Input type="number" step="0.01" min="0" placeholder="Amount ($)" {...register("consultation_cost", { valueAsNumber: true })} />
          <Input type="number" step="0.01" min="0" placeholder="Free Amount ($)" {...register("consultation_free", { valueAsNumber: true })} />
          {errors.consultation && <p className="text-xs text-red-500">{errors.consultation.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Medications</Label>
          <Textarea {...register("medications")} rows={2} placeholder="Description" />
          <Input type="number" step="0.01" min="0" placeholder="Amount ($)" {...register("medications_cost", { valueAsNumber: true })} />
          <Input type="number" step="0.01" min="0" placeholder="Free Amount ($)" {...register("medications_free", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Investigations</Label>
          <Textarea {...register("investigations")} rows={2} placeholder="Description" />
          <Input type="number" step="0.01" min="0" placeholder="Amount ($)" {...register("investigations_cost", { valueAsNumber: true })} />
          <Input type="number" step="0.01" min="0" placeholder="Free Amount ($)" {...register("investigations_free", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Procedures</Label>
          <Textarea {...register("procedures")} rows={2} placeholder="Description" />
          <Input type="number" step="0.01" min="0" placeholder="Amount ($)" {...register("procedures_cost", { valueAsNumber: true })} />
          <Input type="number" step="0.01" min="0" placeholder="Free Amount ($)" {...register("procedures_free", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Misc</Label>
          <Textarea {...register("misc")} rows={2} placeholder="Description" />
          <Input type="number" step="0.01" min="0" placeholder="Amount ($)" {...register("misc_cost", { valueAsNumber: true })} />
          <Input type="number" step="0.01" min="0" placeholder="Free Amount ($)" {...register("misc_free", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea id="diagnosis" {...register("diagnosis", { required: "Diagnosis is required" })} />
        {errors.diagnosis && <p className="text-xs text-red-500 mt-1">{errors.diagnosis.message}</p>}
      </div>

      <div className="p-3 bg-muted rounded-md">
        <p className="font-semibold text-lg">Total: ${totalDisplay}</p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate Receipt"}
        </Button>
      </div>
    </form>
  );
}