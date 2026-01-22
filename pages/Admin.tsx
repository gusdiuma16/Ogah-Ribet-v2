import React, { useState, useEffect } from 'react';
import { getAppConfig, updateAppConfig, getAllTransactions, getNotifications, markNotificationRead, submitManualTransaction } from '../services/mockDataService';
import { Transaction, TransactionStatus, AdminNotification } from '../types';
import { Settings, Save, Lock, Bell, CheckCircle, Loader2, PlusCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Currency } from '../components/Formatters';

const Admin: React.FC = () => {
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

  // Manual Input State
  const [inputType, setInputType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputName, setInputName] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);

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
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Password salah');
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await updateAppConfig({ logoUrl, qrisUrl, youtubePlaylistId });
    setIsSaving(false);
    if (success) {
        alert('Konfigurasi berhasil disimpan ke Google Sheet!');
    } else {
        alert('Gagal menyimpan konfigurasi.');
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
          TransactionStatus.APPROVED // Manual input by admin is auto-approved
      );
      setIsSubmittingInput(false);
      
      if (success) {
          alert('Transaksi berhasil disimpan!');
          // Reset form
          setInputName('');
          setInputAmount('');
          setInputCategory('');
          refreshData(); // Refresh list
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-6 text-purple-600"><Lock size={48} /></div>
          <h2 className="text-2xl font-bold text-center mb-6">Hidden Admin Panel</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter Password"
            />
            <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold">
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings /> Admin Dashboard
            </h1>
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('input')} 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'input' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Input Transaksi
                </button>
                <button 
                    onClick={() => setActiveTab('config')} 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'config' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Konfigurasi
                </button>
            </div>
        </div>

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
            <>
                {/* Notifications Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Bell size={20} className={unreadCount > 0 ? "text-yellow-500 animate-pulse" : "text-gray-400"} />
                        Notifications
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </h2>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-gray-400 text-sm">No new notifications.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-3 rounded-lg flex justify-between items-start ${n.isRead ? 'bg-gray-50 opacity-60' : 'bg-blue-50 border border-blue-100'}`}>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{n.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                    </div>
                                    {!n.isRead && (
                                        <button onClick={() => handleMarkRead(n.id)} className="text-blue-600 hover:text-blue-800" title="Mark as Read">
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h2 className="text-xl font-bold">Pending Transactions</h2>
                        <button onClick={refreshData} className="text-sm text-purple-600 hover:text-purple-800">Refresh</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTransactions.filter(t => t.status === TransactionStatus.PENDING).length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No pending transactions.</td></tr>
                                )}
                                {allTransactions.filter(t => t.status === TransactionStatus.PENDING).map(t => (
                                    <tr key={t.id} className="border-b">
                                        <td className="p-3">{t.date}</td>
                                        <td className="p-3">{t.name}</td>
                                        <td className="p-3 font-mono"><Currency amount={t.amount} /></td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                        * Ubah status menjadi "APPROVED" langsung di Google Sheet pada tab <b>Pemasukan</b> untuk menampilkannya di web.
                    </p>
                </div>
            </>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input 
                            type="date" 
                            required
                            value={inputDate}
                            onChange={e => setInputDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Nama</label>
                        <input 
                            type="text" 
                            required
                            value={inputName}
                            onChange={e => setInputName(e.target.value)}
                            placeholder={inputType === 'INCOME' ? 'Contoh: Donasi Tunai Hamba Allah' : 'Contoh: Pembelian Beras 50kg'}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                            <input 
                                type="number" 
                                required
                                value={inputAmount}
                                onChange={e => setInputAmount(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select 
                                value={inputCategory} 
                                onChange={e => setInputCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                            >
                                <option value="">Pilih Kategori...</option>
                                <option value="Logistik">Logistik</option>
                                <option value="Transport">Transport</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Donasi Offline">Donasi Offline</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmittingInput}
                        className={`w-full py-3 rounded-xl text-white font-bold transition-all flex justify-center items-center gap-2 ${inputType === 'INCOME' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isSubmittingInput ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Simpan {inputType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </button>
                    <p className="text-xs text-center text-gray-400">
                        Data akan langsung masuk ke Google Sheet dengan status <b>APPROVED</b>.
                    </p>
                </form>
             </div>
        )}

        {/* ================= CONFIG TAB ================= */}
        {activeTab === 'config' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-bold mb-6 border-b pb-2">Asset & Config Management</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input 
                            type="text" 
                            value={logoUrl} 
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <div className="mt-2 h-12">
                            <img src={logoUrl} alt="Preview" className="h-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">QRIS Image URL</label>
                        <input 
                            type="text" 
                            value={qrisUrl} 
                            onChange={(e) => setQrisUrl(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <div className="mt-2 h-32 bg-gray-50 w-32 flex items-center justify-center border rounded">
                            <img src={qrisUrl} alt="Preview" className="h-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID (Page Berbagi)</label>
                        <input 
                            type="text" 
                            value={youtubePlaylistId} 
                            onChange={(e) => setYoutubePlaylistId(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none font-mono text-sm"
                            placeholder="e.g. jfKfPfyJRdk"
                        />
                        <p className="text-xs text-gray-500 mt-1">Masukan ID video dari URL Youtube (contoh: watch?v=<b>ID_DISINI</b>)</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-4">Untuk mengedit daftar Program, silakan edit langsung di Google Sheet pada tab <b>Programs</b>.</p>
                    </div>

                    <button 
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium disabled:bg-blue-400"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Admin;