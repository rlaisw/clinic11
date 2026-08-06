"use client";

import { useEffect, useState, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface ReceiptPreviewModalProps {
  receipt: {
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
  } | null;
  onClose: () => void;
}

export default function ReceiptPreviewModal({
  receipt,
  onClose,
}: ReceiptPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  const handleDownloadPdf = () => {
    if (receipt) {
      const a = document.createElement("a");
      a.href = `/api/receipts/${receipt.id}/pdf/`;
      a.download = `receipt-${receipt.rref}.pdf`;
      a.click();
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Retry logic would go here
    setTimeout(() => {
      setIsLoading(false);
      if (!receipt) setError("Failed to load receipt");
    }, 1000);
  };

  if (!receipt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-5/6 relative">
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close preview"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <Spinner className="w-12 h-12" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={handleRetry}>
              Retry
            </Button>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Or download the PDF directly:
              </p>
              <a
                href={`/api/receipts/${receipt.id}/pdf/`}
                download
                className="text-blue-600 underline text-sm"
              >
                Download receipt-{receipt.rref}.pdf
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Receipt</h2>
              <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                Download PDF
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-bold text-lg">{receipt.rref}</p>
                  <p className="text-sm text-muted-foreground">{receipt.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{receipt.total_dollars}</p>
                  <p className="text-sm text-muted-foreground">${receipt.total_free}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-medium">{receipt.patient_name}</p>
                <p className="text-sm text-muted-foreground">{receipt.diagnosis}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Consultation:</span>{" "}
                    {receipt.consultation} (${receipt.consultation_free})
                  </div>
                  <div>
                    <span className="font-medium">Medications:</span>{" "}
                    {receipt.medications} (${receipt.medications_free})
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Investigations:</span>{" "}
                    {receipt.investigations} (${receipt.investigations_free})
                  </div>
                  <div>
                    <span className="font-medium">Procedures:</span>{" "}
                    {receipt.procedures} (${receipt.procedures_free})
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Misc:</span>{" "}
                    {receipt.misc} (${receipt.misc_free})
                  </div>
                </div>
              </div>
            </div>

            {receipt.qr_code_base64 && (
              <div className="text-center mt-4">
                <img
                  src={`data:image/png;base64,${receipt.qr_code_base64}`}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}