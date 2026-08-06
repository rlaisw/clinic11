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
import {
  useCreateSickLeaveCertificate,
  useSickLeaveCertificates,
  useCreateShareLink,
  useDownloadPdf,
  useRevokeSickLeaveCertificate,
} from "@/hooks/use-sick-leave-certificate";
import { PlusIcon, DownloadIcon, ShareIcon, XCircleIcon, Search, EyeIcon } from "lucide-react";
import SickLeaveCertificatePreviewModal from "@/components/doctor/SickLeaveCertificatePreviewModal";

interface CurrentUserInfo {
  username: string;
  email: string;
  clinic_name: string;
  clinic_address: string;
  phone: string;
  display_name: string;
}

function useCurrentUser() {
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  useEffect(() => {
    apiClient.get("/auth/user/").then((res) => setUserInfo(res.data)).catch(() => {});
  }, []);
  return userInfo;
}

interface SickLeaveCertificateTabsProps {
  patientId: string;
  disabled?: boolean;
}

export function SickLeaveCertificateTabs({ patientId, disabled }: SickLeaveCertificateTabsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [srefPreview, setSrefPreview] = useState<string>("");
  const [previewModalId, setPreviewModalId] = useState<string | null>(null);
  const [shareDialogId, setShareDialogId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMaxViews, setShareMaxViews] = useState<number>(5);
  const [createdCert, setCreatedCert] = useState<{ id: string; qrBase64: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const currentUser = useCurrentUser();
  const { data: certificates, isLoading: certsLoading } = useSickLeaveCertificates(patientId, searchTerm || undefined);
  const createMutation = useCreateSickLeaveCertificate(patientId);
  const revokeMutation = useRevokeSickLeaveCertificate(patientId);
  const shareLinkMutation = useCreateShareLink();
  const downloadPdfMutation = useDownloadPdf();

  useEffect(() => {
    if (showCreateForm && !srefPreview) {
      apiClient.get("/sref-preview/").then((res) => {
        setSrefPreview(res.data.sref);
      }).catch(() => {});
    }
  }, [showCreateForm, srefPreview]);

  if (patientLoading) {
    return <div className="text-sm text-muted-foreground">Loading patient information...</div>;
  }

  if (!patient) {
    return <div className="text-sm text-red-500">Patient not found.</div>;
  }

  const handleDownloadPdf = async (certId: string) => {
    try {
      const blob = await downloadPdfMutation.mutateAsync(certId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sick-leave-certificate-${certId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download PDF");
    }
  };

  const handleShareLink = async (certId: string) => {
    try {
      const result = await shareLinkMutation.mutateAsync({ id: certId, maxViews: shareMaxViews });
      setShareUrl(result.share_url);
      setShareDialogId(certId);
    } catch {
      console.error("Failed to generate share link");
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!confirm("Are you sure you want to revoke this certificate?")) return;
    try {
      await revokeMutation.mutateAsync(certId);
    } catch {
      console.error("Failed to revoke certificate");
    }
  };

  const handlePreview = (certId: string) => {
    setPreviewModalId(certId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sick Leave Certificates</span>
            {!disabled && !showCreateForm && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                New Certificate
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, HKID, or QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {showCreateForm && (
            <SickLeaveCertificateForm
              patientName={`${patient.first_name} ${patient.last_name}`}
              patientHkid={patient.hkid || ""}
              doctorName={currentUser?.display_name || currentUser?.username || ""}
              doctorEmail={currentUser?.email || ""}
              onCancel={() => setShowCreateForm(false)}
              isPending={createMutation.isPending}
              srefPreview={srefPreview}
              onSubmit={async (data) => {
                try {
                  const result = await createMutation.mutateAsync(data);
                  setCreatedCert({ id: result.id, qrBase64: result.qr_code_base64 || "" });
                  setShowCreateForm(false);
                } catch (err: any) {
                  console.error("Failed to create certificate", err?.response?.data || err);
                }
              }}
            />
          )}

          {createdCert && (
            <div className="mb-6 p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Certificate Issued Successfully</h3>
              <div className="flex items-center gap-4">
                {createdCert.qrBase64 && (
                  <img
                    src={`data:image/png;base64,${createdCert.qrBase64}`}
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                )}
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(createdCert.id)}>
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleShareLink(createdCert.id)}>
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}

          {certsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : certificates && certificates.length > 0 ? (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">{cert.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      Ref: {cert.reference_number} | Issued: {cert.issue_date} | Status: {cert.status}
                    </p>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(cert.id)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(cert.id)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleShareLink(cert.id)}>
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                    {cert.status === "active" && !disabled && (
                      <Button size="sm" variant="ghost" onClick={() => handleRevoke(cert.id)}>
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sick leave certificates issued yet. Click "New Certificate" to create one.
            </p>
          )}
        </CardContent>
      </Card>

{shareDialogId && (
         <Dialog open={!!shareDialogId} onOpenChange={() => setShareDialogId(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Share Certificate</DialogTitle>
             </DialogHeader>
             <div className="space-y-4">
               <div>
                 <Label>Share Link</Label>
                 <Input value={shareUrl} readOnly className="bg-muted" />
               </div>
               <div>
                 <Label>Max Views</Label>
                 <Input
                   type="number"
                   min={1}
                   value={shareMaxViews}
                   onChange={(e) => setShareMaxViews(Number(e.target.value))}
                 />
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

        {previewModalId && (
          <SickLeaveCertificatePreviewModal
            certificateId={previewModalId}
            onClose={() => setPreviewModalId(null)}
          />
        )}
      </div>
     );
   }

interface SickLeaveCertificateFormProps {
  patientName: string;
  patientHkid: string;
  doctorName: string;
  doctorEmail: string;
  onCancel: () => void;
  isPending: boolean;
  onSubmit: (data: { consultation_details: string; diagnosis: string; recommended_sick_leave: string; remarks?: string }) => void;
  srefPreview?: string;
}

function SickLeaveCertificateForm({
  patientName,
  patientHkid,
  doctorName,
  doctorEmail,
  onCancel,
  isPending,
  onSubmit,
  srefPreview,
}: SickLeaveCertificateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<{
    consultation_details: string;
    diagnosis: string;
    recommended_sick_leave: string;
    remarks?: string;
  }>();

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 mb-4">
      <h3 className="font-semibold">Sick Leave Certificate</h3>

      <div>
        <Label>Sick Leave Certificate Ref. Number</Label>
        <Input value={srefPreview || 'Loading...'} readOnly disabled className="bg-muted font-mono" />
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Display name</Label>
          <Input value={doctorName} readOnly disabled className="bg-muted" />
        </div>
        <div>
          <Label>Doctor Email</Label>
          <Input value={doctorEmail} readOnly disabled className="bg-muted" />
        </div>
      </div>

      <div>
        <Label>Date</Label>
        <Input value={today} readOnly disabled className="bg-muted" />
      </div>

      <div>
        <Label htmlFor="consultation_details">Consultation Details</Label>
        <Textarea
          id="consultation_details"
          {...register("consultation_details", { required: "Consultation details are required" })}
        />
        {errors.consultation_details && (
          <p className="text-xs text-red-500 mt-1">{errors.consultation_details.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea
          id="diagnosis"
          {...register("diagnosis", { required: "Diagnosis is required" })}
        />
        {errors.diagnosis && (
          <p className="text-xs text-red-500 mt-1">{errors.diagnosis.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="recommended_sick_leave">Recommended Sick Leave</Label>
        <Input
          id="recommended_sick_leave"
          placeholder="e.g., 3 days"
          {...register("recommended_sick_leave", { required: "Recommended sick leave is required" })}
        />
        {errors.recommended_sick_leave && (
          <p className="text-xs text-red-500 mt-1">{errors.recommended_sick_leave.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          {...register("remarks")}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Signing..." : "Sign & Issue"}
        </Button>
      </div>
    </form>
  );
}