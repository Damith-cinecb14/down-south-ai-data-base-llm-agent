export type Hospital = {
  id: number;
  name: string;
  address: string | null;
  email: string | null;
  telephone: string | null;
};

export type Equipment = {
  id: number;
  hospital_id: number;
  name: string;
  model: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  status: string | null;
};

export type Service = {
  id: number;
  equipment_id: number;
  service_year: number;
  quarter: number;
  service_date: string | null;
  engineer_name: string | null;
  status: string | null;
  remarks: string | null;
};

export type ServiceAgreement = {
  id: number;
  hospital_name: string;
  equipment_name: string;
  installation_date: string | null;
  contract_number: string | null;
  provider_type: string | null;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  source_row: number;
};

export type DashboardData = {
  connected: boolean;
  source?: "live" | "snapshot";
  warning?: string;
  hospitals: Hospital[];
  equipment: Equipment[];
  services: Service[];
  agreements: ServiceAgreement[];
};
