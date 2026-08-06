"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSickLeaveCertificatePreview } from "@/hooks/useSickLeaveCertificatePreview";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { PDFErrorBoundary } from "@/components/doctor/PDFErrorBoundary";

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
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    openModal();
  }, [openModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      closeModal();
    };
  }, [closeModal, onClose]);

  const handleRetry = useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `sick-leave-certificate-${certificateId}.pdf`;
      a.click();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches);
    if (touches.length === 1) {
      setTouchStart({ x: touches[0]!.clientX, y: touches[0]!.clientY });
    }
    if (touches.length === 2) {
      const dx = touches[0]!.clientX - touches[1]!.clientX;
      const dy = touches[0]!.clientY - touches[1]!.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      (e.target as HTMLElement).dataset.pinchDist = String(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart;
    const changedTouches = Array.from(e.changedTouches);
    if (changedTouches.length === 1 && start) {
      const dx = changedTouches[0]!.clientX - start.x;
      const dy = changedTouches[0]!.clientY - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-close-area]")) {
            closeModal();
            onClose();
          }
        }, 300);
      }
    }
    setTouchStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.25, Math.min(3, z - e.deltaY * 0.01)));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={containerRef}
        className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-5/6 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Sick Leave Certificate Preview"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sick Leave Certificate</h2>
          <button
            onClick={() => { closeModal(); onClose(); }}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close preview"
            data-close-area
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <PDFErrorBoundary
          onRetry={handleRetry}
          downloadUrl={pdfUrl || undefined}
          certificateId={certificateId}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner className="w-12 h-12" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message || "Failed to load PDF"}</p>
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}

          {pdfUrl && !isLoading && !error && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                    aria-label="Zoom out"
                  >
                    -
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    aria-label="Zoom in"
                  >
                    +
                  </Button>
                </div>
                <Button size="sm" variant="link" onClick={handleDownload} aria-label="Download PDF">
                  Download
                </Button>
              </div>
              <div
                className="w-full h-[60vh] overflow-auto border rounded"
                onWheel={handleWheel}
              >
                <div
                  style={{
                    width: `${100 * zoom}%`,
                    height: `${100 * zoom}%`,
                    transformOrigin: "top left",
                  }}
                >
                  <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    aria-label="Sick leave certificate PDF preview"
                  >
                    <p className="p-4 text-center text-muted-foreground">
                      PDF preview not available in your browser.
                      <button onClick={handleDownload} className="text-blue-600 underline ml-1">
                        Download instead
                      </button>
                    </p>
                  </object>
                </div>
              </div>
            </div>
          )}
        </PDFErrorBoundary>
      </div>
    </div>
  );
}