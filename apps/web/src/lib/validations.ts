import { z } from "zod";

export const medicalHistorySchema = z.object({
  id: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  diagnosis_date: z.string().min(1, "Diagnosis date is required"),
  notes: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(1, "Phone is required"),
});

export const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "O"]),
  address: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;