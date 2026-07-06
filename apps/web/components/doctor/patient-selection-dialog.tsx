"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlusIcon } from "lucide-react";
import { usePatients } from "@/hooks/use-patients";

export function PatientSelectionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [hkid, setHkid] = useState<string>("");
  const [selectedPatientObj, setSelectedPatientObj] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    hkid?: string;
  } | null>(null);
  const router = useRouter();

  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    setHkid("");
    const patient = patients.find((p) => String(p.id) === id) || null;
    setSelectedPatientObj(patient || null);
    if (patient) {
      setHkid(patient.hkid || "");
    }
  };

  const handleHkidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHkid(value);
    if (value) {
      const patient = patients.find((p) =>
        p.hkid && p.hkid.toLowerCase().includes(value.toLowerCase())
      ) || null;
      if (patient) {
        setSelectedPatientId(String(patient.id));
        setSelectedPatientObj(patient);
      } else {
        setSelectedPatientId("");
        setSelectedPatientObj(null);
      }
    } else {
      setSelectedPatientId("");
      setSelectedPatientObj(null);
    }
  };

  const handleSelectPatient = () => {
    if (selectedPatientObj) {
      router.push(`/doctor/patients/${selectedPatientObj.id}`);
      onOpenChange(false);
      setHkid("");
      setSelectedPatientId("");
      setSelectedPatientObj(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Patient</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Patient *</label>
            <Select
              value={selectedPatientId}
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setHkid("");
                setSelectedPatientId("");
                setSelectedPatientObj(null);
              }}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={handleSelectPatient}
              disabled={!selectedPatientObj}
              className="flex-1"
            >
              Select Patient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}