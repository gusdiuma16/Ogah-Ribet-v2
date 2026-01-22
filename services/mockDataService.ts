import { Transaction, TransactionType, TransactionStatus, AppConfig, AdminNotification, MapLocation, Program } from '../types';

// ==================================================================================
// KONFIGURASI PENTING
// ==================================================================================
// GANTI URL INI DENGAN URL DEPLOYMENT BARU ANDA (Permission: Anyone)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5cvAZmeUapOqo0mmiTDhVk_LXEAcJ8l5FPARHjOVbPX88qx6eGKWZvSVLfUtl-TQl/exec'; 
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
    // Gunakan 'no-cors' tidak disarankan karena kita butuh response body JSON.
    // Jika Script di-deploy dengan Access "Anyone", fetch standar akan bekerja.
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
        // Google Apps Script memerlukan "text/plain" untuk menghindari preflight OPTIONS check (CORS complex request)
        // Kita kirim body JSON sebagai string
        const payload = JSON.stringify({ action, data });
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: payload,
            // Header ini penting agar browser tidak mengirim request OPTIONS
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

const parseAmount = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const clean = val.replace(/[^0-9]/g, '');
        return parseInt(clean) || 0;
    }
    return 0;
};

// Fungsi ini memastikan data dari Sheet (apapun format headernya) dipetakan ke Tipe Aplikasi
const mapTransaction = (raw: any): Transaction => {
    // Coba tebak key dari raw object (karena header sheet bisa uppercase/lowercase)
    const getVal = (keys: string[]) => {
        for (const k of keys) if (raw[k] !== undefined) return raw[k];
        return undefined;
    };

    const typeStr = String(getVal(['type', 'Type']) || '').toLowerCase();
    let type = TransactionType.INCOME;
    if (typeStr.includes('expense') || typeStr.includes('pengeluaran')) type = TransactionType.EXPENSE;

    const statusStr = String(getVal(['status', 'Status']) || 'PENDING');
    const status = statusStr.toUpperCase() === 'APPROVED' ? TransactionStatus.APPROVED : TransactionStatus.PENDING;

    return {
        id: String(getVal(['id', 'ID']) || `trx-${Math.random()}`),
        date: String(getVal(['date', 'Date']) || new Date().toISOString()),
        name: String(getVal(['name', 'Name', 'title', 'Title']) || 'Tanpa Nama'),
        amount: parseAmount(getVal(['amount', 'Amount'])),
        type: type,
        category: String(getVal(['category', 'Category']) || 'Umum'),
        status: status,
        proofUrl: String(getVal(['proofUrl', 'ProofUrl', 'image']) || '')
    };
};

const mapProgram = (raw: any): Program => ({
    id: raw.id || raw.ID || `prog-${Math.random()}`,
    title: raw.title || raw.Title || 'Program',
    batch: raw.batch || raw.Batch || '',
    status: raw.status || raw.Status || 'COMING_SOON',
    description: raw.description || raw.Description || '',
    image: raw.image || raw.Image || 'https://via.placeholder.com/400',
    link: raw.link || raw.Link || '#'
});

const mapLocation = (raw: any): MapLocation => ({
    id: raw.id || raw.ID || `loc-${Math.random()}`,
    title: raw.title || raw.Title || 'Lokasi',
    lat: Number(raw.lat || raw.Lat || 0),
    lng: Number(raw.lng || raw.Lng || 0),
    description: raw.description || raw.Description || '',
    programBatch: raw.programBatch || raw.ProgramBatch || ''
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
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
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
    // Fallback local update if network fails
    localConfig = { ...localConfig, ...newConfig };
    alert("Gagal update ke server. Config disimpan lokal sementara.");
    return true;
};

// --- OTHERS ---

export const getNotifications = async (): Promise<AdminNotification[]> => {
  try {
    const transactions = await getAllTransactions();
    // Jika ID transaksi dummy (TRX-1), jangan jadikan notif
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