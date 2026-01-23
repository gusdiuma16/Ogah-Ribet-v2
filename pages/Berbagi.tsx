import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, X, ArrowLeft, Upload, Loader2, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { getAppConfig, calculateSummary, getApprovedTransactions, submitDonation } from '../services/mockDataService';
import { Currency } from '../components/Formatters';
import { Transaction } from '../types';

const Berbagi: React.FC = () => {
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [config, setConfig] = useState({ 
    logoUrl: '', 
    qrisUrl: '', 
    youtubePlaylistId: '0ynAZZFsp8g' // default
  });
  
  // Donation Form States
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Fetch summary data
    getApprovedTransactions().then(transactions => {
      const summary = calculateSummary(transactions);
      setBalance(summary.balance);
    });
    
    // Fetch Config
    getAppConfig().then(setConfig);
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !amount) return;
    
    setIsSubmitting(true);
    const numAmount = parseInt(amount.replace(/\D/g, ''));
    
    await submitDonation(donorName, numAmount, file);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form after 2 seconds and close
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setDonorName('');
      setAmount('');
      setFile(null);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-jakarta">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
            {/* Dynamic YouTube Embed using playlistId from config */}
            <iframe
                className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoMode ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}
                src={`https://www.youtube.com/embed/${config.youtubePlaylistId}?autoplay=1&mute=${isVideoMode ? '0' : '1'}&controls=${isVideoMode ? '1' : '0'}&loop=1&playlist=${config.youtubePlaylistId}&showinfo=0&rel=0&modestbranding=1`}
                title="Dokumentasi Berbagi"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            ></iframe>
        </div>
      </div>

      {/* Overlay Layer (Visible when NOT in video mode) */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 ${isVideoMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="h-full flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Top Nav (Back Button) */}
          <div className="flex justify-between items-start pt-4">
             <Link to="/" className="text-white/80 hover:text-white flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-all hover:bg-white/20">
                <ArrowLeft size={20} /> Kembali
             </Link>
             <button 
                onClick={() => setIsVideoMode(true)}
                className="text-white/80 hover:text-white flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-all hover:bg-white/20 group"
             >
                <Play size={18} className="fill-current group-hover:scale-110 transition-transform" /> Tonton Video
             </button>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto w-full text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/30 backdrop-blur-md border border-blue-500/50 text-blue-100 text-sm font-bold mb-4 tracking-wide">
              BATCH 3
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
              Ogah Ribetzz <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Berbagi</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow-md">
              Aksi nyata berbagi kebahagiaan. Tanpa prosedur rumit, langsung tepat sasaran.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left">
                    <p className="text-gray-400 text-sm font-medium mb-1">Saldo Terkumpul</p>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        <Currency amount={balance} />
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left flex items-center justify-between hover:bg-white/15 transition-colors cursor-pointer group">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Transparansi</p>
                        <p className="text-white font-bold group-hover:text-purple-300 transition-colors">Lihat Pengeluaran</p>
                    </div>
                    <Link to="/transparansi" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <ArrowLeft size={20} className="rotate-180 text-white" />
                    </Link>
                </div>
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] hover:shadow-[0_0_60px_-10px_rgba(147,51,234,0.7)] hover:-translate-y-1 transition-all transform animate-pulse"
            >
                Donasi Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Video Mode Controls */}
      {isVideoMode && (
        <button 
            onClick={() => setIsVideoMode(false)}
            className="absolute top-6 right-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
        >
            <X size={24} />
        </button>
      )}

      {/* Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease-out]">
                {isSuccess ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h3>
                        <p className="text-gray-500">Data donasi Anda telah kami terima dan sedang diverifikasi (Pending). Cek status di Transparansi.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="p-8 w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Donasi Cepat</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleDonate} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">QRIS Scan</label>
                                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex justify-center">
                                        <img src="/qris.png" alt="QRIS" className="w-full max-w-[280px] h-auto object-contain" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Nama (Hamba Allah)</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                            placeholder="Nama Anda"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Jumlah (Rp)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-bold"
                                            placeholder="100000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Bukti Transfer</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange}
                                            className="hidden" 
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2 text-gray-600 transition-colors">
                                            <Upload size={18} />
                                            {file ? <span className="text-blue-600 font-medium truncate">{file.name}</span> : "Upload Screenshot"}
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Kirim Donasi'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Berbagi;
