"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { QueueEntry, QueueStats, QueueCheckInInput } from "@/lib/types";

const QUEUE_KEY = "queue";
const QUEUE_STATS_KEY = "queue-stats";

// ----- API Functions -----

async function fetchQueue(): Promise<QueueEntry[]> {
  const response = await apiClient.get("/queue/");
  // Handle DRF pagination - results array
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  // Also handle if it's already an array
  return Array.isArray(response.data) ? response.data : [];
}

async function fetchQueueStats(): Promise<QueueStats> {
  const response = await apiClient.get("/queue/stats/");
  return response.data;
}

async function checkInPatient(input: QueueCheckInInput): Promise<QueueEntry> {
  const response = await apiClient.post("/queue/check_in/", input);
  return response.data;
}

async function callToDoctor(id: string): Promise<QueueEntry> {
  const response = await apiClient.post(`/queue/${id}/call/`);
  return response.data;
}

async function completeVisit(id: string): Promise<QueueEntry> {
  const response = await apiClient.post(`/queue/${id}/complete/`);
  return response.data;
}

async function removeFromQueue(id: string): Promise<void> {
  await apiClient.delete(`/queue/${id}/`);
}

async function deleteAllCompleted(): Promise<void> {
  const response = await apiClient.delete("/queue/completed/");
  return response.data;
}

// ----- Hooks -----

export function useQueue() {
  return useQuery({
    queryKey: [QUEUE_KEY],
    queryFn: fetchQueue,
    refetchInterval: 5000, // Auto-refresh every 5s
  });
}

export function useQueueStats() {
  return useQuery({
    queryKey: [QUEUE_STATS_KEY],
    queryFn: fetchQueueStats,
    refetchInterval: 5000,
  });
}

export function useCheckInPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkInPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_STATS_KEY] });
    },
  });
}

export function useCallToDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: callToDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_STATS_KEY] });
    },
  });
}

export function useCompleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_STATS_KEY] });
    },
  });
}

export function useRemoveFromQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_STATS_KEY] });
    },
  });
}

export function useDeleteAllCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_STATS_KEY] });
    },
  });
}
