import React, { useState } from 'react';
import { Heart, Lock, X, ChevronRight } from 'lucide-react';

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setAccessCode('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === '1608') {
      // Force navigation untuk memastikan fresh reload di halaman admin
      window.location.href = '/hidden-admin?auth=true';
    } else {
      alert("Kode akses salah!");
      setAccessCode('');
    }
  };

  return (
    <>
      <footer className="bg-white border-t border-gray-100 py-12 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 mb-4">
            Ogah Ribetzz
          </div>
          <p className="text-gray-500 text-center max-w-md mb-8">
            Rumit itu cuma alasan. Mari berbagi dengan cara yang paling sederhana dan berdampak.
          </p>
          <div className="text-sm text-gray-400 flex items-center justify-center gap-1 select-none">
            <span>&copy; {new Date().getFullYear()} Ogah Ribetzz Foundation.</span>
            
            <button 
              onClick={handleOpenModal}
              className="flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors ml-1 relative z-50 py-2 px-1 focus:outline-none"
              title="Akses Sistem Internal"
            >
              <span className="font-medium hover:underline decoration-red-500 decoration-2 underline-offset-2">Made with</span>
              <Heart size={14} className="text-red-500 fill-current animate-pulse" />
            </button>
          </div>
        </div>
      </footer>

      {/* Security Modal - Selalu dirender jika state true, menggantikan window.prompt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-[fadeIn_0.2s_ease-out] border border-gray-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-600">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Akses Terbatas</h3>
              <p className="text-xs text-gray-500">Area ini khusus untuk administrator.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="PIN"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-center font-bold tracking-[0.5em] text-xl"
                    autoFocus
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                Verifikasi <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;