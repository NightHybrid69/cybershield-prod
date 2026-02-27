import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach JWT token to admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cs_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Complaint {
  complaintId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  crimeType: string;
  incidentDate: string;
  subject: string;
  description: string;
  evidenceText?: string;
  evidenceFiles?: { name: string; url: string; type: string }[];
  status: 'New' | 'Investigating' | 'Resolved' | 'Closed';
  filedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AdminStats {
  total: number;
  new: number;
  investigating: number;
  resolved: number;
  closed: number;
}

export const CRIME_TYPES = [
  'Online Fraud',
  'Cyberbullying / Harassment',
  'Hacking / Unauthorized Access',
  'Identity Theft',
  'Phishing / Scam',
  'Data Breach',
  'Ransomware',
  'Child Sexual Abuse Material',
  'Other',
];

export const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
];

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    New: 'badge-new',
    Investigating: 'badge-investigating',
    Resolved: 'badge-resolved',
    Closed: 'badge-closed',
  };
  return `badge ${map[status] || 'badge-new'}`;
}
