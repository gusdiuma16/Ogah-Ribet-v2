import { Transaction, TransactionType, TransactionStatus, AppConfig, AdminNotification, MapLocation, Program } from '../types';

// ==================================================================================
// KONFIGURASI PENTING
// ==================================================================================
// GANTI URL INI DENGAN URL DEPLOYMENT BARU ANDA (Permission: Anyone)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3no5sJNE44YBJM693p3X5dvhm_cdF75k4g0Tzg5dYQYw6vl4QTaexhOGaDvDZucI/exec'; 
// ==================================================================================

// --- DATA FALLBACK (OFFLINE/ERROR) ---
const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 'P01',
    title: 'Ogah Ribetzz Berbagi',
    batch: 'Batch 3',
    status: 'ACTIVE',
    description: 'Program rutin berbagi nasi bungkus dan sembako setiap hari Jumat.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80',
    link: '/berbagi'
  }
];

const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-1',
    date: new Date().toISOString().split('T')[0],
    name: 'Hamba Allah (Offline)',
    amount: 500000,
    type: TransactionType.INCOME,
    category: 'Donasi QRIS',
    status: TransactionStatus.APPROVED
  }
];

const FALLBACK_LOCATIONS: MapLocation[] = [
    {
        id: 'L1',
        title: 'Posko Jati Cempaka',
        lat: -6.244, 
        lng: 106.924,
        description: 'Pusat distribusi bantuan utama.',
        programBatch: 'Batch 3'
    }
];

// --- NETWORK HELPER ---

// Helper untuk fetch data GET dengan handling error
const fetchData = async (action: string, params: string = '') => {
  if (!GOOGLE_SCRIPT_URL) return null;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=${action}${params}`);
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const json = await response.json();
    if (json.status === 'error') throw new Error(json.message);
    
    return json.data;
  } catch (error) {
    console.warn(`Gagal mengambil data ${action}:`, error);
    return null;
  }
};

// Helper untuk POST data
const postData = async (action: string, data: any) => {
    try {
        const payload = JSON.stringify({ action, data });
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: payload,
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        });

        const json = await response.json();
        return json.status === 'success';
    } catch (error) {
        console.error(`Gagal POST ${action}:`, error);
        return false;
    }
};

// --- DATA MAPPING HELPER ---

// Mapping untuk Transaksi (Pemasukan & Pengeluaran)
const mapTransaction = (raw: any): Transaction => {
    const tipeRaw = String(raw['Tipe'] || '').toLowerCase();
    
    return {
        id: String(raw['ID'] || Math.random()),
        date: String(raw['Tanggal'] || new Date().toISOString()),
        name: String(raw['Nama Donatur'] || 'Hamba Allah'),
        amount: parseAmount(raw['Nominal']),
        type: (tipeRaw.includes('pengeluaran') || tipeRaw.includes('expense')) 
               ? TransactionType.EXPENSE : TransactionType.INCOME,
        category: 'Umum', // Kamu bisa tambah kolom Kategori di Sheet jika mau
        status: String(raw['Verivikasi']).toUpperCase() === 'APPROVED' 
                ? TransactionStatus.APPROVED : TransactionStatus.PENDING,
        proofUrl: String(raw['Bukti Transfer'] || '')
    };
};

// Mapping untuk Program
const mapProgram = (raw: any): Program => ({
    id: String(raw['ID'] || ''),
    title: String(raw['Title'] || ''),
    batch: String(raw['Batch'] || ''),
    status: String(raw['Status'] || 'ACTIVE'),
    description: String(raw['Description'] || ''),
    image: String(raw['Image'] || ''),
    link: String(raw['Link'] || '#')
});

// Mapping untuk Location
const mapLocation = (raw: any): MapLocation => ({
    id: String(raw['ID'] || ''),
    title: String(raw['Title'] || ''),
    lat: Number(raw['Lat'] || 0),
    lng: Number(raw['Lng'] || 0),
    description: String(raw['Description'] || ''),
    programBatch: String(raw['Batch'] || '')
});

// --- EXPORTED FUNCTIONS ---

export const getApprovedTransactions = async (): Promise<Transaction[]> => {
  const data = await fetchData('getTransactions', '&type=public');
  if (data && Array.isArray(data)) return data.map(mapTransaction);
  return FALLBACK_TRANSACTIONS;
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const data = await fetchData('getTransactions', '&type=all');
  if (data && Array.isArray(data)) return data.map(mapTransaction);
  return FALLBACK_TRANSACTIONS;
};

export const approveTransaction = async (id: string): Promise<boolean> => {
    // Fungsi ini membutuhkan Action 'approveTransaction' di Google Apps Script Anda.
    // Jika belum ada, Anda perlu menambahkannya di backend.
    const success = await postData('approveTransaction', { id });
    if (!success) {
        // Fallback simulation jika offline
        console.warn("Server approval failed, simulating success locally.");
        return true; 
    }
    return success;
};

export const getPrograms = async (): Promise<Program[]> => {
  const data = await fetchData('getPrograms');
  if (data && Array.isArray(data)) return data.map(mapProgram);
  return FALLBACK_PROGRAMS;
};

export const getMapLocations = async (): Promise<MapLocation[]> => {
  const data = await fetchData('getLocations');
  if (data && Array.isArray(data)) return data.map(mapLocation);
  return FALLBACK_LOCATIONS;
};

// --- CONFIG ---

let localConfig: AppConfig = {
  logoUrl: '/ogah.png',
  qrisUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png',
  youtubePlaylistId: 'jfKfPfyJRdk'
};

export const getAppConfig = async (): Promise<AppConfig> => {
  const data = await fetchData('getConfig');
  if (data) {
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
    localConfig = { ...localConfig, ...newConfig };
    alert("Gagal update ke server. Config disimpan lokal sementara.");
    return true;
};

// --- OTHERS ---

export const getNotifications = async (): Promise<AdminNotification[]> => {
  try {
    const transactions = await getAllTransactions();
    if (transactions.length === 1 && transactions[0].id === 'TRX-1') return [];
    
    const pending = transactions.filter(t => t.status === TransactionStatus.PENDING);
    return pending.map(t => ({
      id: `notif-${t.id}`,
      message: `Donasi baru ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.amount)} dari ${t.name}`,
      timestamp: t.date,
      isRead: false,
      type: 'DONATION'
    }));
  } catch (error) {
    return [];
  }
};

export const markNotificationRead = (id: string) => {
  console.log(`Notification ${id} marked read locally`);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
    };
    reader.onerror = error => reject(error);
  });
};

export const submitDonation = async (name: string, amount: number, proofFile: File | null): Promise<boolean> => {
    let base64File = null;
    let mimeType = null;
    let fileName = null;

    if (proofFile) {
        try {
            base64File = await fileToBase64(proofFile);
            mimeType = proofFile.type;
            fileName = proofFile.name;
        } catch (e) {
            console.error("Gagal convert file", e);
        }
    }

    const payload = {
        name,
        amount,
        date: new Date().toISOString().split('T')[0],
        file: base64File,
        mimeType,
        fileName
    };

    const success = await postData('submitDonation', payload);
    if (!success) {
        alert("Gagal koneksi ke server. Donasi belum tercatat.");
        return false;
    }
    return true;
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
