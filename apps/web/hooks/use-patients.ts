"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Patient, CreatePatientInput, UpdatePatientInput } from "@/lib/types";

const PATIENTS_KEY = "patients";

async function fetchPatients(search?: string, ordering?: string): Promise<Patient[]> {
  const response = await apiClient.get("/patients/", {
    params: { 
      search,
      ordering,
    },
  });
  return response.data;
}

async function fetchPatient(id: string): Promise<Patient> {
  const response = await apiClient.get(`/patients/${id}/`);
  return response.data;
}

async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const response = await apiClient.post("/patients/", input);
  return response.data;
}

async function updatePatient({
  id,
  data,
}: {
  id: string;
  data: UpdatePatientInput;
}): Promise<Patient> {
  const response = await apiClient.patch(`/patients/${id}/`, data);
  return response.data;
}

async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/patients/${id}/`);
}

export function usePatients(search?: string, ordering?: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, { search, ordering }],
    queryFn: () => fetchPatients(search, ordering),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY, id] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}
