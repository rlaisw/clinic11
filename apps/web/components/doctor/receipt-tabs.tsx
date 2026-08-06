"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { usePatient } from "@/hooks/use-patients";
import { useUser } from "@/contexts/user-context";
import { PlusIcon, DownloadIcon, ShareIcon, Search, EyeIcon } from "lucide-react";
import ReceiptPreviewModal from "@/components/doctor/ReceiptPreviewModal";

interface ReceiptItem {
  id: string;
  rref: string;
  date: string;
  patient_name: string;
  consultation: string;
  medications: string;
  investigations: string;
  procedures: string;
  misc: string;
  consultation_free: string;
  medications_free: string;
  investigations_free: string;
  procedures_free: string;
  misc_free: string;
  total_free: string;
  total_dollars: string;
  diagnosis: string;
  qr_code_base64?: string;
}

interface ReceiptFormData {
  patient_name: string;
  consultation: string;
  medications: string;
  investigations: string;
  procedures: string;
  misc: string;
  consultation_free: string;
  medications_free: string;
  investigations_free: string;
  procedures_free: string;
  misc_free: string;
  total_dollars: string;
  diagnosis: string;
}

function generateRRef(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = year === "26" ? "R001" : year === "27" ? "R002" : "R003";
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `${prefix}-0000-0000-${seq}`;
}

function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  ];
  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 10) return ones[num] ?? "";
  if (num < 20) return teens[num - 10] ?? "";
  if (num < 100) {
    return (tens[Math.floor(num / 10)] ?? "") + (num % 10 !== 0 ? ` ${ones[num % 10] ?? ""}` : "");
  }
  if (num < 1000) {
    return (
      (ones[Math.floor(num / 100)] ?? "") +
      " Hundred" +
      (num % 100 !== 0 ? ` ${numberToWords(num % 100)}` : "")
    );
  }
  if (num < 1000000) {
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 !== 0 ? ` ${numberToWords(num % 1000)}` : "")
    );
  }
  return num.toString();
}

function formatTotalDollars(totalFree: string): string {
  const num = parseFloat(totalFree);
  if (isNaN(num)) return totalFree;
  return `${numberToWords(num)} dollars`;
}

export function ReceiptTabs({ patientId, disabled }: { patientId: string; disabled?: boolean }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [previewModalId, setPreviewModalId] = useState<string | null>(null);
  const [shareDialogId, setShareDialogId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: patient } = usePatient(patientId);
  const currentUser = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReceiptFormData>();

  const filteredReceipts = receipts.filter(
    (r) =>
      r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: ReceiptFormData) => {
    const consultationFree = parseFloat(data.consultation_free || "0") || 0;
    const medicationsFree = parseFloat(data.medications_free || "0") || 0;
    const investigationsFree = parseFloat(data.investigations_free || "0") || 0;
    const proceduresFree = parseFloat(data.procedures_free || "0") || 0;
    const miscFree = parseFloat(data.misc_free || "0") || 0;
    const totalFree = consultationFree + medicationsFree + investigationsFree + proceduresFree + miscFree;

    const newReceipt: ReceiptItem = {
      id: `receipt-${Date.now()}`,
      rref: generateRRef(),
      date: (new Date().toISOString().split("T")[0] as string),
      patient_name: data.patient_name || (patient ? patient.first_name : "") || "",
      consultation: data.consultation || "",
      medications: data.medications || "",
      investigations: data.investigations || "",
      procedures: data.procedures || "",
      misc: data.misc || "",
      consultation_free: data.consultation_free || "0",
      medications_free: data.medications_free || "0",
      investigations_free: data.investigations_free || "0",
      procedures_free: data.procedures_free || "0",
      misc_free: data.misc_free || "0",
      total_free: totalFree.toFixed(2),
      total_dollars: data.total_dollars && data.total_dollars.trim() !== "" 
        ? data.total_dollars 
        : formatTotalDollars(totalFree.toFixed(2)),
      diagnosis: data.diagnosis || "",
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    setShowCreateForm(false);
    reset();
  };

  const handlePreview = (receiptId: string) => {
    setPreviewModalId(receiptId);
  };

  const handleDownloadPdf = async (receipt: ReceiptItem) => {
    try {
      const blob = await apiClient
        .get(`/receipts/${receipt.id}/pdf/`, { responseType: "blob" })
        .then((res) => res.data);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receipt.rref}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download receipt PDF");
    }
  };

  const handleShareLink = async (receiptId: string) => {
    try {
      const result = await apiClient
        .post(`/receipts/${receiptId}/share-link/`, { max_views: 5 })
        .then((res) => res.data);
      setShareUrl(result.share_url);
      setShareDialogId(receiptId);
    } catch {
      console.error("Failed to generate share link");
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
              placeholder="Search by patient name, receipt number, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 border rounded-lg p-4 mb-4"
            >
              <h3 className="font-semibold">New Receipt</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    {...register("patient_name", { required: "Patient name is required" })}
                    defaultValue={patient?.first_name || ""}
                  />
                  {errors.patient_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.patient_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Diagnosis</Label>
                  <Input {...register("diagnosis")} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Line Items</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Consultation</Label>
                    <Input {...register("consultation")} />
                  </div>
                  <div>
                    <Label>Consultation Free ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("consultation_free")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Medications</Label>
                    <Input {...register("medications")} />
                  </div>
                  <div>
                    <Label>Medications Free ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("medications_free")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Investigations</Label>
                    <Input {...register("investigations")} />
                  </div>
                  <div>
                    <Label>Investigations Free ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("investigations_free")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Procedures</Label>
                    <Input {...register("procedures")} />
                  </div>
                  <div>
                    <Label>Procedures Free ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("procedures_free")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Misc</Label>
                    <Input {...register("misc")} />
                  </div>
                  <div>
                    <Label>Misc Free ($)</Label>
                    <Input type="number" step="0.01" {...register("misc_free")} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Dollars</Label>
                  <Input
                    {...register("total_dollars")}
                    readOnly
                    className="bg-muted font-mono"
                    value={formatTotalDollars(
                      (
                        (parseFloat(String(errors.consultation_free?.message || 0)) ||
                          parseFloat(String(errors.medications_free?.message || 0)) ||
                          parseFloat(String(errors.investigations_free?.message || 0)) ||
                          parseFloat(String(errors.procedures_free?.message || 0)) ||
                          parseFloat(String(errors.misc_free?.message || 0)) ||
                          0) as number
                      ).toFixed(2)
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Receipt"}
                </Button>
              </div>
            </form>
          )}

          {filteredReceipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No receipts yet. Click "New Receipt" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{receipt.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Ref: {receipt.rref} | Date: {receipt.date} | Total: ${receipt.total_free}
                    </p>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(receipt.id)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(receipt)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleShareLink(receipt.id)}>
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {previewModalId && (
        <ReceiptPreviewModal
          receipt={receipts.find((r) => r.id === previewModalId) || null}
          onClose={() => setPreviewModalId(null)}
        />
      )}

      {shareDialogId && (
        <Dialog open={!!shareDialogId} onOpenChange={() => setShareDialogId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Share Link</Label>
                <Input value={shareUrl} readOnly className="bg-muted" />
              </div>
              <Button
                className="w-full"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Copy Link to Clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}