"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

export function useSickLeaveCertificatePreview(certificateId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const openModal = useCallback(async () => {
    if (!certificateId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/sick-leave-certificates/${certificateId}/pdf/`,
        { responseType: "arraybuffer" }
      );
      const uint8 = new Uint8Array(response.data);
      const binary = uint8.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
      const base64 = btoa(binary);
      const dataUrl = `data:application/pdf;base64,${base64}`;
      setPdfUrl(dataUrl);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || "Failed to load PDF"));
    } finally {
      setIsLoading(false);
    }
  }, [certificateId]);

  const closeModal = useCallback(() => {
    setPdfUrl(null);
    setError(null);
  }, []);

  return { pdfUrl, isLoading, error, openModal, closeModal, isOpen: !!pdfUrl };
}