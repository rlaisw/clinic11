"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

const VISIT_SUMMARIES_KEY = "visit-summaries";

interface VisitSummary {
  id: string;
  patient: string;
  doctor_name: string;
  doctor_display_name: string;
  clinic_name: string;
  clinic_address: string;
  patient_name: string;
  patient_hkid: string;
  visit_date: string;
  visit_type: string;
  diagnosis: string;
  notes: string;
  status: string;
  certificate: string | null;
  certificate_details: Record<string, unknown> | null;
  receipt: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateVisitSummaryInput {
  patient: string;
  visit_date: string;
  visit_type?: string;
  diagnosis?: string;
  notes?: string;
}

async function fetchVisitSummaries(patientId: string): Promise<VisitSummary[]> {
  const response = await apiClient.get(`/visit-summaries/?patient=${patientId}`);
  return response.data;
}

async function fetchVisitSummary(id: string): Promise<VisitSummary> {
  const response = await apiClient.get(`/visit-summaries/${id}/`);
  return response.data;
}

async function createVisitSummary(input: CreateVisitSummaryInput): Promise<VisitSummary> {
  const response = await apiClient.post("/visit-summaries/", input);
  return response.data;
}

async function linkCertificate(visitId: string, certificateId: string): Promise<{ status: string }> {
  const response = await apiClient.post(`/visit-summaries/${visitId}/link_certificate/`, {
    certificate_id: certificateId,
  });
  return response.data;
}

async function linkReceipt(visitId: string, receiptId: string): Promise<{ status: string }> {
  const response = await apiClient.post(`/visit-summaries/${visitId}/link_receipt/`, {
    receipt_id: receiptId,
  });
  return response.data;
}

export function useVisitSummaries(patientId: string) {
  return useQuery({
    queryKey: [VISIT_SUMMARIES_KEY, patientId],
    queryFn: () => fetchVisitSummaries(patientId),
    enabled: !!patientId,
  });
}

export function useVisitSummary(id: string) {
  return useQuery({
    queryKey: [VISIT_SUMMARIES_KEY, id],
    queryFn: () => fetchVisitSummary(id),
    enabled: !!id,
  });
}

export function useCreateVisitSummary(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVisitSummaryInput) =>
      createVisitSummary(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VISIT_SUMMARIES_KEY, patientId] });
    },
  });
}

export function useLinkCertificate(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, certificateId }: { visitId: string; certificateId: string }) =>
      linkCertificate(visitId, certificateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VISIT_SUMMARIES_KEY, patientId] });
    },
  });
}

export function useLinkReceipt(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, receiptId }: { visitId: string; receiptId: string }) =>
      linkReceipt(visitId, receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VISIT_SUMMARIES_KEY, patientId] });
    },
  });
}