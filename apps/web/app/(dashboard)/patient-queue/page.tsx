"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueueEntry, QueueStats, VisitType, Patient } from "@/lib/types";
import { usePatients } from "@/hooks/use-patients";
import {
  useQueue,
  useQueueStats,
  useCheckInPatient,
  useCallToDoctor,
  useCompleteVisit,
  useRemoveFromQueue,
  useDeleteAllCompleted,
} from "@/hooks/use-queue";
import {
  ClockIcon,
  HourglassIcon,
  ListOrderedIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
  CheckIcon,
  Activity,
} from "lucide-react";

const VISIT_TYPE_OPTIONS: { value: VisitType; label: string }[] = [
  { value: "follow_up", label: "Follow-up" },
  { value: "walkin", label: "Walk-in" },
  { value: "appointment", label: "Appointment" },
  { value: "emergency", label: "Emergency" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last && first.length > 0 && last.length > 0) {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function visitTypeBadge(variant: VisitType) {
  const map: Record<VisitType, React.ReactNode> = {
    follow_up: <Badge variant="follow-up">follow-up</Badge>,
    walkin: <Badge variant="walkin">walkin</Badge>,
    appointment: <Badge variant="appointment">appointment</Badge>,
    emergency: <Badge variant="emergency">emergency</Badge>,
  };
  return map[variant];
}

function statusBadge(status: QueueEntry["status"]) {
  if (status === "waiting") return <Badge variant="waiting">Waiting</Badge>;
  if (status === "in_consultation") return <Badge variant="in-consultation">With Doctor</Badge>;
  return <Badge variant="completed">Completed</Badge>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientQueuePage() {
  const [patientId, setPatientId] = useState<string>("");
  const [hkid, setHkid] = useState<string>("");
  const [visitType, setVisitType] = useState<VisitType>("walkin");
  const [reason, setReason] = useState("");
  const [selectedPatientObj, setSelectedPatientObj] = useState<Patient | null>(null);

  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: queue = [], isLoading: queueLoading } = useQueue();
  const { data: stats } = useQueueStats();
  const checkInMutation = useCheckInPatient();
  const callMutation = useCallToDoctor();
  const completeMutation = useCompleteVisit();
  const removeMutation = useRemoveFromQueue();
  const deleteAllCompletedMutation = useDeleteAllCompleted();

  const waitingList = useMemo(() => queue.filter((q) => q.status === "waiting"), [queue]);
  const inConsultationList = useMemo(() => queue.filter((q) => q.status === "in_consultation"), [queue]);
  const completedList = useMemo(() => queue.filter((q) => q.status === "completed"), [queue]);
  const activeQueue = useMemo(() => [...waitingList, ...inConsultationList], [waitingList, inConsultationList]);

  const handleCheckIn = () => {
    if (!selectedPatientObj) return;
    checkInMutation.mutate({
      patient_id: String(selectedPatientObj.id),
      patient_name: selectedPatientObj ? `${selectedPatientObj.first_name} ${selectedPatientObj.last_name}` : "",
      visit_type: visitType,
      reason: reason.trim() || undefined,
    });
    setPatientId("");
    setHkid("");
    setSelectedPatientObj(null);
    setReason("");
    setVisitType("walkin");
  };

  const handleCallDoctor = (entry: QueueEntry) => {
    callMutation.mutate(entry.id);
  };

  const handleComplete = (entry: QueueEntry) => {
    completeMutation.mutate(entry.id);
  };

  const handleRemoveCompleted = (id: string) => {
    removeMutation.mutate(id);
  };

  const handleDeleteAllCompleted = () => {
    if (completedList.length > 0 && window.confirm(`Delete all ${completedList.length} completed records?`)) {
      deleteAllCompletedMutation.mutate();
    }
  };

  const currentPatient = inConsultationList[0];
  const currentStats = stats || { waiting: 0, in_consultation: 0, in_clinic: 0, next_up: null, avg_wait_time: 0 };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setPatientId(id);
    setHkid("");
    const patient = patients.find((p) => String(p.id) === id) || null;
    setSelectedPatientObj(patient);
    if (patient) {
      setHkid(patient.hkid || "");
    }
  };

  const handleHkidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHkid(value);
    if (value) {
      const patient = patients.find((p) => p.hkid === value) || null;
      if (patient) {
        setPatientId(String(patient.id));
        setSelectedPatientObj(patient);
      } else {
        setPatientId("");
        setSelectedPatientObj(null);
      }
    } else {
      setPatientId("");
      setSelectedPatientObj(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Patient Queue Management</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time patient queue — check-in, call to doctor, complete visit. Auto-refreshes every 5 s.
        </p>
      </div>

      {currentPatient && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <StethoscopeIcon className="h-3.5 w-3.5" />
            Live Clinic Room
          </h2>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  <StethoscopeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {currentPatient.doctor_name} — {currentPatient.room_name}
                  </p>
                  <p className="text-sm font-semibold">{currentPatient.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{currentPatient.reason}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {currentPatient.consultation_start_time
                  ? `${Math.floor((Date.now() - new Date(currentPatient.consultation_start_time).getTime()) / 60000)}m in`
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          title="Waiting"
          value={String(currentStats.waiting)}
          icon={<HourglassIcon className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          title="In Consultation"
          value={String(currentStats.in_consultation)}
          subtitle={currentPatient?.patient_name || "Dr. Smith"}
          icon={<UserCheckIcon className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="In Clinic"
          value={String(currentStats.in_clinic)}
          subtitle="all active"
          icon={<UsersIcon className="h-4 w-4 text-indigo-500" />}
        />
        <StatCard
          title="Next Up"
          value={`#1`}
          subtitle={currentStats.next_up?.patient_name || "—"}
          icon={<ListOrderedIcon className="h-4 w-4 text-cyan-500" />}
        />
        <StatCard
          title="Avg Wait Time"
          value={`${currentStats.avg_wait_time}m`}
          subtitle="moving avg"
          icon={<ClockIcon className="h-4 w-4 text-emerald-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <UserPlusIcon className="h-4 w-4" />
                Patient Check-In
              </CardTitle>
              <CardDescription>Register a new arrival into the queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Patient *</label>
                <Select
                  value={patientId}
                  onChange={handlePatientChange}
                  disabled={patientsLoading}
                >
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">HKID</label>
                <Input
                  type="text"
                  placeholder="Or enter HKID..."
                  value={hkid}
                  onChange={handleHkidChange}
                  disabled={patientsLoading}
                />
                {selectedPatientObj && hkid && (
                  <p className="text-xs text-muted-foreground">
                    {selectedPatientObj.first_name} {selectedPatientObj.last_name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Visit Type *</label>
                <Select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as VisitType)}
                >
                  <option value="" disabled>Select type...</option>
                  {VISIT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Reason for Visit</label>
                <Textarea
                  placeholder="e.g. Fever, headache, routine check..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCheckIn}
                disabled={!selectedPatientObj || checkInMutation.isPending}
              >
                <UserPlusIcon className="h-3.5 w-3.5 mr-1" />
                Add to Queue
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Activity className="h-4 w-4 text-primary" />
                Live Queue — {activeQueue.length} patients in clinic
              </CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-1">
                  <HourglassIcon className="h-3 w-3 text-amber-500" />
                  Waiting
                </span>
                <span className="mx-1">→</span>
                <span className="inline-flex items-center gap-1">
                  <UserCheckIcon className="h-3 w-3 text-blue-500" />
                  Call to Doctor
                </span>
                <span className="mx-1">→</span>
                <span className="inline-flex items-center gap-1">
                  <CheckIcon className="h-3 w-3 text-emerald-500" />
                  Complete. Action buttons advance the patient through the queue.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {queueLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : activeQueue.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No patients in queue.</p>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeQueue.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[0.65rem] font-semibold text-muted-foreground">
                                {entry.initials || getInitials(entry.patient_name)}
                              </div>
                              <div>
                                <p className="text-xs font-medium">{entry.patient_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{visitTypeBadge(entry.visit_type)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{entry.reason}</TableCell>
                          <TableCell>{statusBadge(entry.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatTime(entry.check_in_time)}</TableCell>
                          <TableCell className="text-right">
                            {entry.status === "waiting" ? (
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => handleCallDoctor(entry)}
                                title="Call to Doctor"
                                disabled={callMutation.isPending}
                              >
                                <UserCheckIcon className="h-3 w-3" />
                              </Button>
                            ) : entry.status === "in_consultation" ? (
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleComplete(entry)}
                                title="Complete Visit"
                                disabled={completeMutation.isPending}
                              >
                                <CheckIcon className="h-3 w-3" />
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {completedList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-emerald-500" />
                  Completed Today — {completedList.length} patients
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleDeleteAllCompleted}
                  disabled={deleteAllCompletedMutation.isPending}
                  className="text-xs"
                >
                  Delete All
                </Button>
              </CardTitle>
              <CardDescription>
                  Finished visits. Click the × button to remove a record from the queue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedList.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[0.65rem] font-semibold text-muted-foreground">
                                {entry.initials || getInitials(entry.patient_name)}
                              </div>
                              <span className="text-xs font-medium">{entry.patient_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{visitTypeBadge(entry.visit_type)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{entry.reason}</TableCell>
                          <TableCell>{statusBadge(entry.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatTime(entry.check_in_time)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => handleRemoveCompleted(entry.id)}
                              disabled={removeMutation.isPending}
                            >
                              <XIcon className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}