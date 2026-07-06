"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  PatientBackground,
  UpdatePatientBackgroundInput,
  ActiveMedication,
  CreateActiveMedicationInput,
  UpdateActiveMedicationInput,
  PastMedication,
  CreatePastMedicationInput,
  UpdatePastMedicationInput,
  Allergy,
  CreateAllergyInput,
  UpdateAllergyInput,
  PrescriptionMedication,
  CreatePrescriptionMedicationInput,
  UpdatePrescriptionMedicationInput,
} from "@/lib/types";

const PATIENT_BACKGROUND_KEY = "patient-background";
const ACTIVE_MEDICATIONS_KEY = "active-medications";
const PAST_MEDICATIONS_KEY = "past-medications";
const ALLERGIES_KEY = "allergies";

async function fetchPatientBackground(patientId: string): Promise<PatientBackground> {
  const response = await apiClient.get(`/patients/${patientId}/background/`);
  return response.data;
}

async function updatePatientBackground({
  patientId,
  data,
}: {
  patientId: string;
  data: UpdatePatientBackgroundInput;
}): Promise<PatientBackground> {
  const response = await apiClient.patch(`/patients/${patientId}/background/`, data);
  return response.data;
}

export function usePatientBackground(patientId: string) {
  return useQuery({
    queryKey: [PATIENT_BACKGROUND_KEY, patientId],
    queryFn: () => fetchPatientBackground(patientId),
    enabled: !!patientId,
  });
}

export function useUpdatePatientBackground(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatientBackground,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_BACKGROUND_KEY, patientId] });
    },
  });
}

async function fetchActiveMedications(patientId: string): Promise<ActiveMedication[]> {
  const response = await apiClient.get(`/patients/${patientId}/medications/active/`);
  return response.data;
}

async function createActiveMedication(input: CreateActiveMedicationInput): Promise<ActiveMedication> {
  const response = await apiClient.post(`/patients/${input.patient}/medications/active/`, input);
  return response.data;
}

async function updateActiveMedication({
  id,
  data,
}: {
  id: string;
  data: UpdateActiveMedicationInput;
}): Promise<ActiveMedication> {
  const response = await apiClient.patch(`/medications/active/${id}/`, data);
  return response.data;
}

async function deleteActiveMedication(id: string): Promise<void> {
  await apiClient.delete(`/medications/active/${id}/`);
}

export function useActiveMedications(patientId: string) {
  return useQuery({
    queryKey: [ACTIVE_MEDICATIONS_KEY, patientId],
    queryFn: () => fetchActiveMedications(patientId),
    enabled: !!patientId,
  });
}

export function useCreateActiveMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createActiveMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_MEDICATIONS_KEY, patientId] });
    },
  });
}

export function useUpdateActiveMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateActiveMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_MEDICATIONS_KEY, patientId] });
    },
  });
}

export function useDeleteActiveMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteActiveMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_MEDICATIONS_KEY, patientId] });
    },
  });
}

async function fetchPastMedications(patientId: string): Promise<PastMedication[]> {
  const response = await apiClient.get(`/patients/${patientId}/medications/past/`);
  return response.data;
}

async function createPastMedication(input: CreatePastMedicationInput): Promise<PastMedication> {
  const response = await apiClient.post(`/patients/${input.patient}/medications/past/`, input);
  return response.data;
}

async function updatePastMedication({
  id,
  data,
}: {
  id: string;
  data: UpdatePastMedicationInput;
}): Promise<PastMedication> {
  const response = await apiClient.patch(`/medications/past/${id}/`, data);
  return response.data;
}

async function deletePastMedication(id: string): Promise<void> {
  await apiClient.delete(`/medications/past/${id}/`);
}

export function usePastMedications(patientId: string) {
  return useQuery({
    queryKey: [PAST_MEDICATIONS_KEY, patientId],
    queryFn: () => fetchPastMedications(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePastMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPastMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAST_MEDICATIONS_KEY, patientId] });
    },
  });
}

export function useUpdatePastMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePastMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAST_MEDICATIONS_KEY, patientId] });
    },
  });
}

export function useDeletePastMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePastMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAST_MEDICATIONS_KEY, patientId] });
    },
  });
}

async function fetchAllergies(patientId: string): Promise<Allergy[]> {
  const response = await apiClient.get(`/patients/${patientId}/allergies/`);
  return response.data;
}

async function createAllergy(input: CreateAllergyInput): Promise<Allergy> {
  const response = await apiClient.post(`/patients/${input.patient}/allergies/`, input);
  return response.data;
}

async function updateAllergy({
  id,
  data,
}: {
  id: string;
  data: UpdateAllergyInput;
}): Promise<Allergy> {
  const response = await apiClient.patch(`/allergies/${id}/`, data);
  return response.data;
}

async function deleteAllergy(id: string): Promise<void> {
  await apiClient.delete(`/allergies/${id}/`);
}

export function useAllergies(patientId: string) {
  return useQuery({
    queryKey: [ALLERGIES_KEY, patientId],
    queryFn: () => fetchAllergies(patientId),
    enabled: !!patientId,
  });
}

export function useCreateAllergy(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAllergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALLERGIES_KEY, patientId] });
    },
  });
}

export function useUpdateAllergy(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAllergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALLERGIES_KEY, patientId] });
    },
  });
}

export function useDeleteAllergy(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALLERGIES_KEY, patientId] });
    },
  });
}

const PRESCRIPTIONS_KEY = "prescriptions";

async function fetchPrescriptions(patientId: string): Promise<PrescriptionMedication[]> {
  const response = await apiClient.get(`/patients/${patientId}/prescriptions/`);
  return response.data;
}

async function createPrescriptionMedication(input: CreatePrescriptionMedicationInput): Promise<PrescriptionMedication> {
  const response = await apiClient.post(`/patients/${input.patient}/prescriptions/`, input);
  return response.data;
}

async function updatePrescriptionMedication({
  id,
  data,
}: {
  id: string;
  data: UpdatePrescriptionMedicationInput;
}): Promise<PrescriptionMedication> {
  const response = await apiClient.patch(`/prescriptions/${id}/`, data);
  return response.data;
}

async function deletePrescriptionMedication(id: string): Promise<void> {
  await apiClient.delete(`/prescriptions/${id}/`);
}

export function usePrescriptions(patientId: string) {
  return useQuery({
    queryKey: [PRESCRIPTIONS_KEY, patientId],
    queryFn: () => fetchPrescriptions(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePrescriptionMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPrescriptionMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY, patientId] });
    },
  });
}

export function useUpdatePrescriptionMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePrescriptionMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY, patientId] });
    },
  });
}

export function useDeletePrescriptionMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePrescriptionMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY, patientId] });
    },
  });
}