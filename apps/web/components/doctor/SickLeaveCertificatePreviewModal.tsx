"use client";

import { useEffect } from "react";
import { useSickLeaveCertificatePreview } from "@/hooks/useSickLeaveCertificatePreview";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface SickLeaveCertificatePreviewModalProps {
  certificateId: string;
  onClose: () => void;
}

export default function SickLeaveCertificatePreviewModal({
  certificateId,
  onClose,
}: SickLeaveCertificatePreviewModalProps) {
  const { pdfUrl, isLoading, error, openModal, closeModal } =
    useSickLeaveCertificatePreview(certificateId);

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
      a.download = `sick-leave-certificate-${certificateId}.pdf`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <h2 className="text-lg font-bold">Sick Leave Certificate</h2>
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
          <iframe src={pdfUrl} className="w-full flex-1 border-0" title="Sick Leave Certificate PDF" />
        )}
      </div>
    </div>
  );
}