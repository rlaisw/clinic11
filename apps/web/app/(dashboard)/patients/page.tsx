"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PatientTable } from "@/components/patients/patient-table";
import { CreatePatientModal } from "@/components/patients/create-patient-modal";
import { usePatients } from "@/hooks/use-patients";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";

export default function PatientsPage() {
  return <PatientsPageContent />;
}

function PatientsPageContent() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: patients, isLoading, error } = usePatients(search, `${sortOrder === "desc" ? "-" : ""}${sortBy}`);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Patients</h1>
        <CreatePatientModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients by name, email, or phone..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">
          Failed to load patients. Please try again.
        </div>
      ) : (
        <PatientTable
          patients={patients || []}
          sortBy={sortBy}
          onSort={toggleSort}
        />
      )}
    </div>
  );
}