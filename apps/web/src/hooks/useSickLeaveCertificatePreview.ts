// apps/web/src/hooks/useSickLeaveCertificatePreview.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PdfPreviewState {
  pdfUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Cache key for PDF preview queries
const PDF_PREVIEW_KEY = "pdf-preview";

// Fetch the PDF URL for a certificate
async function fetchPdfUrl(certificateId: string): Promise<string> {
  const response = await apiClient.get(`/sick-leave-certificates/${certificateId}/pdf/`);
  // The response should contain the PDF URL or we construct it from the endpoint
  // For direct blob fetching, we return the endpoint URL
  return `/api/sick-leave-certificates/${certificateId}/pdf/`;
}

export function useSickLeaveCertificatePreview(certificateId: string) {
  return useQuery<PdfPreviewState>({
    queryKey: [PDF_PREVIEW_KEY, certificateId],
    queryFn: async () => {
      const url = await fetchPdfUrl(certificateId);
      return {
        pdfUrl: url,
        isLoading: false,
        error: null
      };
    },
    enabled: !!certificateId,
    retry: false,
  });
}