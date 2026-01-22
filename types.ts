export enum TransactionType {
  INCOME = 'Pemasukan',
  EXPENSE = 'Pengeluaran'
}

export enum TransactionStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING'
}

export interface Transaction {
  id: string;
  date: string;
  name: string; // Name of donor or expense description
  amount: number;
  type: TransactionType;
  category: string; // e.g., "Donasi QRIS", "Logistik", "Transport"
  status: TransactionStatus;
  proofUrl?: string; // URL to image/receipt
}

export interface Program {
  id: string;
  title: string;
  batch: string;
  status: 'ACTIVE' | 'COMING_SOON' | 'COMPLETED';
  description: string;
  image: string;
  link?: string;
}

export interface AppConfig {
  logoUrl: string;
  qrisUrl: string;
  youtubePlaylistId: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'DONATION' | 'SYSTEM';
}

export interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description: string;
  programBatch: string;
}