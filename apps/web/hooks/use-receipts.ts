"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  ReceiptListItem,
  ReceiptCreateResponse,
  CreateReceiptInput,
} from "@/lib/types";

const RECEIPTS_KEY = "receipts";

async function fetchReceipts(patientId: string, search?: string): Promise<ReceiptListItem[]> {
  const params: string[] = [`patient=${patientId}`];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  const response = await apiClient.get(`/receipts/?${params.join("&")}`);
  return response.data;
}

async function createReceipt(input: CreateReceiptInput & { patient: string }): Promise<ReceiptCreateResponse> {
  const response = await apiClient.post("/receipts/", {
    patient: input.patient,
    consultation: input.consultation,
    medications: input.medications || "",
    investigations: input.investigations || "",
    procedures: input.procedures || "",
    misc: input.misc || "",
    consultation_free: input.consultation_free || 0,
    medications_free: input.medications_free || 0,
    investigations_free: input.investigations_free || 0,
    procedures_free: input.procedures_free || 0,
    misc_free: input.misc_free || 0,
    total_free: input.total_free,
    diagnosis: input.diagnosis,
  });
  return response.data;
}

async function downloadPdf(id: string): Promise<Blob> {
  const response = await apiClient.get(`/receipts/${id}/pdf/`, {
    responseType: "blob",
  });
  return response.data;
}

async function revokeReceipt(id: string): Promise<{ status: string; revoked_timestamp: string }> {
  const response = await apiClient.patch(`/receipts/${id}/revoke/`);
  return response.data;
}

export function useReceipts(patientId: string, search?: string) {
  return useQuery({
    queryKey: [RECEIPTS_KEY, patientId, search],
    queryFn: () => fetchReceipts(patientId, search),
    enabled: !!patientId,
  });
}

export function useCreateReceipt(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReceiptInput) =>
      createReceipt({ ...input, patient: patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_KEY, patientId] });
    },
  });
}

export function useDownloadReceiptPdf() {
  return useMutation({
    mutationFn: downloadPdf,
  });
}

export function useRevokeReceipt(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_KEY, patientId] });
    },
  });
}