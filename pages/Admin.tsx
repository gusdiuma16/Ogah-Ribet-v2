import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAppConfig, updateAppConfig, getAllTransactions, getNotifications, markNotificationRead, submitManualTransaction, approveTransaction } from '../services/mockDataService';
import { Transaction, TransactionStatus, AdminNotification } from '../types';
import { Settings, Save, Lock, Bell, CheckCircle, Loader2, PlusCircle, ArrowDownLeft, ArrowUpRight, Upload, Youtube, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Currency } from '../components/Formatters';

const Admin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Tabs: 'dashboard' | 'input' | 'config'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Config state
  const [logoUrl, setLogoUrl] = useState('');
  const [qrisUrl, setQrisUrl] = useState('');
  const [youtubePlaylistId, setYoutubePlaylistId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Data state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  // Manual Input State
  const [inputType, setInputType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputName, setInputName] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);

  useEffect(() => {
    // Auto login jika redirect dari footer dengan params
    if (searchParams.get('auth') === 'true') {
        setIsAuthenticated(true);
        refreshData();
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
        refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = () => {
    getAllTransactions().then(setAllTransactions);
    getNotifications().then(setNotifications);
    getAppConfig().then(config => {
        setLogoUrl(config.logoUrl);
        setQrisUrl(config.qrisUrl);
        setYoutubePlaylistId(config.youtubePlaylistId);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1608') {
      setIsAuthenticated(true);
      refreshData();
    } else {
      alert('Kode Akses Salah');
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      navigate('/');
  };

  // --- CONFIG HANDLERS ---

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Kita tidak bisa upload ke public server di client-side.
          // Kita set path nya seolah-olah sudah diupload, dan minta user manual copy.
          const simulatedPath = `/images/${file.name}`;
          setter(simulatedPath);
          alert(`File dipilih: ${file.name}\n\nPENTING: Karena ini web statis, sistem tidak bisa upload file otomatis ke server.\n\nSilakan COPY file "${file.name}" secara manual ke folder "public/images/" di dalam project codingan Anda agar gambar bisa muncul.`);
      }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await updateAppConfig({ logoUrl, qrisUrl, youtubePlaylistId });
    setIsSaving(false);
    if (success) {
        alert('Konfigurasi berhasil disimpan!');
    } else {
        alert('Gagal menyimpan konfigurasi.');
    }
  };

  // --- TRANSACTION HANDLERS ---

  const handleApprove = async (id: string) => {
      if (!window.confirm("Setujui donasi ini?")) return;
      
      setIsApproving(id);
      const success = await approveTransaction(id);
      setIsApproving(null);
      
      if (success) {
          // Optimistic update
          setAllTransactions(prev => prev.map(t => t.id === id ? { ...t, status: TransactionStatus.APPROVED } : t));
          alert("Donasi berhasil disetujui!");
      } else {
          alert("Gagal update status. Pastikan Script Google Sheet sudah mendukung fitur Approve.");
      }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingInput(true);
      const success = await submitManualTransaction(
          inputType,
          inputDate,
          inputName,
          parseInt(inputAmount),
          inputCategory,
          TransactionStatus.APPROVED 
      );
      setIsSubmittingInput(false);
      
      if (success) {
          alert('Transaksi berhasil disimpan!');
          setInputName('');
          setInputAmount('');
          setInputCategory('');
          refreshData(); 
      } else {
          alert('Gagal menyimpan transaksi.');
      }
  };

  const handleMarkRead = (id: string) => {
      markNotificationRead(id);
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      setNotifications(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-20">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Lock size={32} />
              </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Restricted Area</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Masukkan kode akses 4 digit untuk melanjutkan.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg tracking-widest"
              placeholder="• • • •"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-all transform active:scale-95">
              Buka Kunci
            </button>
          </form>
          <div className="mt-6 text-center">
              <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600">Kembali ke Beranda</button>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                    <Settings className="text-purple-600" /> Admin Panel
                </h1>
                <p className="text-gray-500 text-sm mt-1">Kelola donasi dan konten website.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('input')} 
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'input' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Input Manual
                    </button>
                    <button 
                        onClick={() => setActiveTab('config')} 
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'config' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Konten
                    </button>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
            </div>
        </div>

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notifications Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden h-full">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Bell size={18} className={unreadCount > 0 ? "text-yellow-500 fill-current" : "text-gray-400"} />
                            Aktivitas Terbaru
                            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                        </h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">Tidak ada notifikasi baru.</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-3 rounded-lg border flex justify-between items-start transition-all ${n.isRead ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                {new Date(n.timestamp).toLocaleDateString('id-ID')} • {new Date(n.timestamp).toLocaleTimeString('id-ID')}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button onClick={() => handleMarkRead(n.id)} className="text-blue-600 hover:text-blue-800 p-1" title="Tandai Sudah Dibaca">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Table Side */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Verifikasi Donasi Masuk</h2>
                            <button onClick={refreshData} className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
                                <Loader2 size={14} className={isApproving ? "animate-spin" : ""} /> Refresh Data
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                        <th className="p-4 font-semibold rounded-tl-lg">Tanggal</th>
                                        <th className="p-4 font-semibold">Nama Donatur</th>
                                        <th className="p-4 font-semibold text-right">Jumlah</th>
                                        <th className="p-4 font-semibold text-center">Bukti</th>
                                        <th className="p-4 font-semibold text-center rounded-tr-lg">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allTransactions.filter(t => t.status === TransactionStatus.PENDING).length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Tidak ada donasi pending saat ini.</td></tr>
                                    ) : (
                                        allTransactions.filter(t => t.status === TransactionStatus.PENDING).map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-gray-600 whitespace-nowrap">{t.date}</td>
                                                <td className="p-4 font-medium text-gray-900">{t.name}</td>
                                                <td className="p-4 font-mono font-bold text-right"><Currency amount={t.amount} /></td>
                                                <td className="p-4 text-center">
                                                    {t.proofUrl ? (
                                                        <a href={t.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 px-2 py-1 rounded">
                                                            <ExternalLink size={12} /> Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => handleApprove(t.id)}
                                                        disabled={isApproving === t.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1 mx-auto"
                                                    >
                                                        {isApproving === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                                        APPROVE
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ================= INPUT TRANSAKSI TAB ================= */}
        {activeTab === 'input' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <PlusCircle className="text-purple-600" /> Input Transaksi Manual
                </h2>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setInputType('INCOME')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${inputType === 'INCOME' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200'}`}
                        >
                            <ArrowDownLeft size={24} />
                            <span className="font-bold">Pemasukan</span>
                        </div>
                        <div 
                            onClick={() => setInputType('EXPENSE')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${inputType === 'EXPENSE' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 hover:border-red-200'}`}
                        >
                            <ArrowUpRight size={24} />
                            <span className="font-bold">Pengeluaran</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input 
                                type="date" 
                                required
                                value={inputDate}
                                onChange={e => setInputDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                            <input 
                                type="number" 
                                required
                                value={inputAmount}
                                onChange={e => setInputAmount(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Nama</label>
                        <input 
                            type="text" 
                            required
                            value={inputName}
                            onChange={e => setInputName(e.target.value)}
                            placeholder={inputType === 'INCOME' ? 'Contoh: Donasi Tunai Hamba Allah' : 'Contoh: Pembelian Beras 50kg'}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select 
                            value={inputCategory} 
                            onChange={e => setInputCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                        >
                            <option value="">Pilih Kategori...</option>
                            <option value="Logistik">Logistik</option>
                            <option value="Transport">Transport</option>
                            <option value="Operasional">Operasional</option>
                            <option value="Donasi Offline">Donasi Offline</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmittingInput}
                        className={`w-full py-3 rounded-xl text-white font-bold transition-all flex justify-center items-center gap-2 ${inputType === 'INCOME' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isSubmittingInput ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Simpan {inputType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </button>
                </form>
             </div>
        )}

        {/* ================= CONFIG TAB ================= */}
        {activeTab === 'config' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-6 border-b pb-4">Manajemen Aset & Konten</h2>
                <div className="space-y-8">
                    
                    {/* LOGO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div>
                             <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <ImageIcon size={16} className="text-purple-600" /> Logo Website
                             </label>
                             <p className="text-xs text-gray-500">Format PNG/JPG. Disarankan 512x512px.</p>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={logoUrl} 
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                    placeholder="/images/logo.png"
                                />
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors flex items-center justify-center">
                                    <Upload size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLocalFileSelect(e, setLogoUrl)} />
                                </label>
                            </div>
                            {logoUrl && (
                                <div className="p-2 border border-dashed border-gray-200 rounded-lg inline-block bg-gray-50">
                                    <img src={logoUrl} alt="Preview" className="h-16 object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=File+Not+Found')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* QRIS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div>
                             <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <ImageIcon size={16} className="text-purple-600" /> Gambar QRIS
                             </label>
                             <p className="text-xs text-gray-500">Kode QR untuk donasi (tampil di popup).</p>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={qrisUrl} 
                                    onChange={(e) => setQrisUrl(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                    placeholder="/images/qris.jpg"
                                />
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors flex items-center justify-center">
                                    <Upload size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLocalFileSelect(e, setQrisUrl)} />
                                </label>
                            </div>
                            {qrisUrl && (
                                <div className="p-2 border border-dashed border-gray-200 rounded-lg inline-block bg-gray-50">
                                    <img src={qrisUrl} alt="Preview" className="h-32 object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=File+Not+Found')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* YOUTUBE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div>
                             <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Youtube size={16} className="text-red-600" /> Video Background
                             </label>
                             <p className="text-xs text-gray-500">ID Video Youtube untuk halaman Berbagi.</p>
                        </div>
                        <div className="md:col-span-2">
                            <input 
                                type="text" 
                                value={youtubePlaylistId} 
                                onChange={(e) => setYoutubePlaylistId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none font-mono"
                                placeholder="Contoh: jfKfPfyJRdk"
                            />
                            <p className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                Tips: Ambil kode unik di akhir link Youtube. Contoh: youtube.com/watch?v=<b>jfKfPfyJRdk</b>
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 disabled:bg-blue-400 disabled:shadow-none"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Admin;