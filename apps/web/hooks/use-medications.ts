import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Medication, UpdateMedicationInput, CreateMedicationInput } from "@/lib/types";

const MEDICATIONS_KEY = "medications";

async function fetchMedications(): Promise<Medication[]> {
  const response = await apiClient.get("/medications/");
  return response.data;
}

async function fetchMedication(id: string): Promise<Medication> {
  const response = await apiClient.get(`/medications/${id}/`);
  return response.data;
}

async function updateMedicationApi(id: string, data: UpdateMedicationInput): Promise<Medication> {
  const response = await apiClient.patch(`/medications/${id}/`, data);
  return response.data;
}

async function deleteMedicationApi(id: string): Promise<void> {
  await apiClient.delete(`/medications/${id}/`);
}

async function createMedicationApi(data: CreateMedicationInput): Promise<Medication> {
  const response = await apiClient.post("/medications/", data);
  return response.data;
}

export function useMedications() {
  return useQuery({
    queryKey: [MEDICATIONS_KEY],
    queryFn: fetchMedications,
  });
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: [MEDICATIONS_KEY, id],
    queryFn: () => fetchMedication(id),
    enabled: !!id,
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicationInput }) => updateMedicationApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICATIONS_KEY] });
    },
    onError: (error) => {
      console.error('Update error:', error);
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedicationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICATIONS_KEY] });
    },
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMedicationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICATIONS_KEY] });
    },
    onError: (error) => {
      console.error('Create error:', error);
    },
  });
}