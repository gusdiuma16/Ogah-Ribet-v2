import { Transaction, TransactionType, TransactionStatus, AppConfig, AdminNotification, Program, MapLocation } from '../types';

// ==================================================================================
// KONFIGURASI PENTING
// ==================================================================================
// GANTI URL DI BAWAH INI DENGAN URL DEPLOYMENT APPS SCRIPT BARU ANDA
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAhAhMx85m6TqH2XnQ85OC2l--1TCpT1bdDTh3LSQnLdc46adnXPjofa9MuGjOKEpQ/exec'; // <-- PASTE URL DISINI, contoh: 'https://script.google.com/.../exec'
// ==================================================================================

// --- DATA FALLBACK (Tampil jika URL belum diisi atau offline) ---
const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 'P01',
    title: 'Program Berbagi (Contoh)',
    batch: 'Batch 3',
    status: 'ACTIVE',
    description: 'Program rutin berbagi nasi bungkus.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80',
    link: '/berbagi'
  },
  {
    id: 'P02',
    title: 'Santunan (Coming Soon)',
    batch: 'Batch 4',
    status: 'COMING_SOON',
    description: 'Program santunan anak yatim bulan depan.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80',
    link: '#'
  }
];

const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-1',
    date: new Date().toISOString().split('T')[0],
    name: 'Data Contoh (Belum Konek Sheet)',
    amount: 100000,
    type: TransactionType.INCOME,
    category: 'Sistem',
    status: TransactionStatus.APPROVED
  }
];

const FALLBACK_LOCATIONS: MapLocation[] = [
  {
      id: 'L01',
      lat: -6.258079,
      lng: 106.929853,
      title: 'Posko Berbagi Batch 1',
      description: 'Penyaluran 50 nasi box di area Jati Cempaka.',
      programBatch: 'Batch 1'
  },
  {
      id: 'L02',
      lat: -6.245500, 
      lng: 106.911200,
      title: 'Santunan Yatim Piatu',
      description: 'Kegiatan santunan dan doa bersama.',
      programBatch: 'Batch 2'
  }
];

// --- NETWORK HELPER ---

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!GOOGLE_SCRIPT_URL) return { success: false, message: "URL Script belum diisi di kode." };

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getConfig`);
        const text = await response.text();
        
        if (text.trim().startsWith('<')) {
            return { 
                success: false, 
                message: "Permission Error: Set 'Who has access' ke 'Anyone' di Google Apps Script Deployment." 
            };
        }

        const json = JSON.parse(text);
        if (json.status === 'success') {
            return { success: true, message: "Koneksi Berhasil! Config terbaca." };
        } else {
            return { success: false, message: `Script Error: ${json.message}` };
        }
    } catch (e: any) {
        return { success: false, message: `Network Error: ${e.message}` };
    }
};

const fetchData = async (action: string) => {
  if (!GOOGLE_SCRIPT_URL) {
      console.warn("GOOGLE_SCRIPT_URL kosong.");
      return null;
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=${action}`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const text = await response.text();
    if (text.trim().startsWith('<')) throw new Error("HTML Response (Permission Error)");

    const json = JSON.parse(text);
    return json.data;
  } catch (error) {
    console.warn(`Gagal fetch ${action}:`, error);
    return null;
  }
};

const postData = async (action: string, data: any) => {
    if (!GOOGLE_SCRIPT_URL) return false;
    try {
        const payload = JSON.stringify({ action, data });
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: payload,
            headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
        const json = await response.json();
        return json.status === 'success';
    } catch (error) {
        console.error(`Gagal POST ${action}:`, error);
        return false;
    }
};

// --- MAPPING ---

const mapTransaction = (raw: any): Transaction => {
    // Header sheet sekarang sudah lowercase semua dari backend
    const typeRaw = String(raw.type || '').toUpperCase();
    const type = typeRaw.includes('EXPENSE') || typeRaw.includes('KELUAR') ? TransactionType.EXPENSE : TransactionType.INCOME;
    
    const statusRaw = String(raw.status || '').toUpperCase();
    const status = statusRaw.includes('APPROV') ? TransactionStatus.APPROVED : TransactionStatus.PENDING;

    return {
        id: String(raw.id || `trx-${Math.random()}`),
        date: String(raw.date || new Date().toISOString().split('T')[0]),
        name: String(raw.name || 'Tanpa Nama'),
        amount: Number(raw.amount || 0),
        type: type,
        category: String(raw.category || 'Umum'),
        status: status,
        proofUrl: raw.proofurl || ''
    };
};

const mapProgram = (raw: any): Program => {
    const statusRaw = String(raw.status || '').toUpperCase();
    let status: 'ACTIVE' | 'COMING_SOON' | 'COMPLETED' = 'COMING_SOON';
    
    if (statusRaw.includes('ACTIVE') || statusRaw.includes('JALAN')) status = 'ACTIVE';
    if (statusRaw.includes('COMPLET') || statusRaw.includes('SELESAI')) status = 'COMPLETED';

    return {
        id: String(raw.id || `prg-${Math.random()}`),
        title: String(raw.title || 'Program'),
        batch: String(raw.batch || ''),
        status: status,
        description: String(raw.description || ''),
        image: String(raw.image || 'https://via.placeholder.com/400'),
        link: String(raw.link || '#')
    };
};

const mapMapLocation = (raw: any): MapLocation => {
    return {
        id: String(raw.id || `loc-${Math.random()}`),
        lat: Number(raw.lat || -6.2),
        lng: Number(raw.lng || 106.8),
        title: String(raw.title || 'Lokasi'),
        description: String(raw.description || ''),
        programBatch: String(raw.programBatch || 'Batch ?')
    };
};

// --- EXPORTS ---

export const getApprovedTransactions = async (): Promise<Transaction[]> => {
  const data = await fetchData('getTransactions');
  if (data && Array.isArray(data)) {
      return data.map(mapTransaction).filter(t => t.status === TransactionStatus.APPROVED);
  }
  return FALLBACK_TRANSACTIONS;
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const data = await fetchData('getTransactions');
  if (data && Array.isArray(data)) return data.map(mapTransaction);
  return FALLBACK_TRANSACTIONS;
};

export const getPrograms = async (): Promise<Program[]> => {
  const data = await fetchData('getPrograms');
  if (data && Array.isArray(data)) return data.map(mapProgram);
  return FALLBACK_PROGRAMS;
};

export const getMapLocations = async (): Promise<MapLocation[]> => {
    const data = await fetchData('getMapLocations');
    if (data && Array.isArray(data)) return data.map(mapMapLocation);
    return FALLBACK_LOCATIONS;
};

// Config
let localConfig: AppConfig = {
  logoUrl: '/ogah.png',
  qrisUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png',
  youtubePlaylistId: 'jfKfPfyJRdk' // Video default
};

export const getAppConfig = async (): Promise<AppConfig> => {
  const data = await fetchData('getConfig');
  if (data) {
    // Backend mengembalikan object { logoUrl, qrisUrl, youtubePlaylistId }
    localConfig = { ...localConfig, ...data };
  }
  return localConfig;
};

export const getConfig = (): AppConfig => localConfig;

export const updateAppConfig = async (newConfig: Partial<AppConfig>): Promise<boolean> => {
    const success = await postData('updateConfig', newConfig);
    if (success) {
        localConfig = { ...localConfig, ...newConfig };
        return true;
    }
    return false;
};

// Actions
export const approveTransaction = async (id: string): Promise<boolean> => {
    return await postData('approveTransaction', { id });
};

export const submitDonation = async (name: string, amount: number, proofFile: File | null): Promise<boolean> => {
    // Versi simple: Kirim data teks saja dulu agar tidak error CORS upload file
    const payload = {
        name,
        amount,
        date: new Date().toISOString().split('T')[0]
    };
    return await postData('submitDonation', payload);
};

export const submitManualTransaction = async (
    type: 'INCOME' | 'EXPENSE',
    date: string,
    name: string,
    amount: number,
    category: string,
    status: TransactionStatus
): Promise<boolean> => {
    const payload = { type, date, name, amount, category, status };
    return await postData('submitManualTransaction', payload);
};

export const calculateSummary = (transactions: Transaction[]) => {
  const income = transactions
    .filter(t => t.type === TransactionType.INCOME && t.status === TransactionStatus.APPROVED)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const expense = transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.APPROVED)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return { income, expense, balance: income - expense };
};

// Notification helper
export const getNotifications = async (): Promise<AdminNotification[]> => {
    try {
        const data = await getAllTransactions();
        return data
            .filter(t => t.status === TransactionStatus.PENDING)
            .map(t => ({
                id: `notif-${t.id}`,
                message: `Pending: ${t.name} (Rp ${t.amount})`,
                timestamp: t.date,
                isRead: false,
                type: 'DONATION'
            }));
    } catch {
        return [];
    }
};

export const markNotificationRead = (id: string) => {};
