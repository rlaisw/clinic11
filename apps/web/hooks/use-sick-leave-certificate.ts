"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  SickLeaveCertificate,
  SickLeaveCertificateListItem,
  SickLeaveCertificateCreateResponse,
  CreateSickLeaveCertificateInput,
  ShareLinkResponse,
  CertificateVerificationResponse,
} from "@/lib/types";

const SICK_LEAVE_CERTIFICATES_KEY = "sick-leave-certificates";

async function fetchCertificates(patientId: string, search?: string): Promise<SickLeaveCertificateListItem[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await apiClient.get(`/patients/${patientId}/sick-leave-certificates/${params}`);
  return response.data;
}

async function createCertificate(input: CreateSickLeaveCertificateInput & { patient: string }): Promise<SickLeaveCertificateCreateResponse> {
  const response = await apiClient.post(`/patients/${input.patient}/sick-leave-certificates/`, {
    consultation_details: input.consultation_details,
    diagnosis: input.diagnosis,
    recommended_sick_leave: input.recommended_sick_leave,
  });
  return response.data;
}

async function fetchCertificate(id: string): Promise<SickLeaveCertificate> {
  const response = await apiClient.get(`/sick-leave-certificates/${id}/`);
  return response.data;
}

async function revokeCertificate(id: string): Promise<{ status: string; revoked_timestamp: string }> {
  const response = await apiClient.patch(`/sick-leave-certificates/${id}/revoke/`);
  return response.data;
}

async function downloadPdf(id: string): Promise<Blob> {
  const response = await apiClient.get(`/sick-leave-certificates/${id}/pdf/`, {
    responseType: "blob",
  });
  return response.data;
}

async function createShareLink(id: string, maxViews?: number): Promise<ShareLinkResponse> {
  const response = await apiClient.post(`/sick-leave-certificates/${id}/share-link/`, {
    max_views: maxViews,
  });
  return response.data;
}

async function verifyCertificate(token: string): Promise<CertificateVerificationResponse> {
  const response = await apiClient.get(`/verify/${encodeURIComponent(token)}/`);
  return response.data;
}

export function useSickLeaveCertificates(patientId: string, search?: string) {
  return useQuery({
    queryKey: [SICK_LEAVE_CERTIFICATES_KEY, patientId, search],
    queryFn: () => fetchCertificates(patientId, search),
    enabled: !!patientId,
  });
}

export function useSickLeaveCertificate(id: string) {
  return useQuery({
    queryKey: [SICK_LEAVE_CERTIFICATES_KEY, id],
    queryFn: () => fetchCertificate(id),
    enabled: !!id,
  });
}

export function useCreateSickLeaveCertificate(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSickLeaveCertificateInput) =>
      createCertificate({ ...input, patient: patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SICK_LEAVE_CERTIFICATES_KEY, patientId] });
    },
  });
}

export function useRevokeSickLeaveCertificate(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SICK_LEAVE_CERTIFICATES_KEY, patientId] });
    },
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: downloadPdf,
  });
}

export function useCreateShareLink() {
  return useMutation({
    mutationFn: ({ id, maxViews }: { id: string; maxViews?: number }) =>
      createShareLink(id, maxViews),
  });
}

export function useVerifyCertificate() {
  return useMutation({
    mutationFn: verifyCertificate,
  });
}