export interface MedicalHistory {
  id: string;
  condition: string;
  diagnosis_date: string;
  notes: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientBackground {
  id: string;
  patient: string;
  chief_complaint?: string;
  past_medical_history: {
    illnesses: unknown[];
    surgeries: unknown[];
    injuries: unknown[];
    hospitalizations: unknown[];
  };
  social_family_history: {
    smoking?: {
      status: string;
      years_smoked?: number;
      packs_per_day?: number;
      quit_date?: string | null;
    };
    alcohol?: {
      status: string;
      frequency?: string | null;
      average_drinks?: number;
    };
    family_diseases: unknown[];
  };
  occupation?: string;
  created_at?: string;
  updated_at?: string;
}

export type UpdatePatientBackgroundInput = Partial<Pick<PatientBackground, 
  'chief_complaint' | 'past_medical_history' | 'social_family_history' | 'occupation'
>>;

export interface ActiveMedication {
  id: string;
  patient: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  created_at?: string;
}

export type CreateActiveMedicationInput = Omit<ActiveMedication, 'id' | 'created_at'>;
export type UpdateActiveMedicationInput = Partial<Omit<ActiveMedication, 'id' | 'patient' | 'created_at'>>;

export interface PastMedication {
  id: string;
  patient: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  reason_discontinuation: string;
  created_at?: string;
}

export type CreatePastMedicationInput = Omit<PastMedication, 'id' | 'created_at'>;
export type UpdatePastMedicationInput = Partial<Omit<PastMedication, 'id' | 'patient' | 'created_at'>>;

export interface Allergy {
  id: string;
  patient: string;
  substance: string;
  reaction: string;
  severity: string;
  created_at?: string;
}

export type CreateAllergyInput = Omit<Allergy, 'id' | 'created_at'>;
export type UpdateAllergyInput = Partial<Omit<Allergy, 'id' | 'patient' | 'created_at'>>;

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: "M" | "F" | "O";
  address: string;
  phone: string;
  email?: string | null;
  blood_type?: string;
  allergies?: string;
  timestamp: string;
  updated: string;
  medical_history: MedicalHistory[];
  emergency_contacts: EmergencyContact[];
}

export type CreatePatientInput = Omit<
  Patient,
  "id" | "timestamp" | "updated" | "medical_history" | "emergency_contacts"
>;

export type UpdatePatientInput = Partial<CreatePatientInput>;
