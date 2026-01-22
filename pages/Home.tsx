import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, Zap, Heart, Loader2 } from 'lucide-react';
import { Program } from '../types';
import { getPrograms } from '../services/mockDataService';

const Home: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrograms().then(data => {
      setPrograms(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 tracking-tight mb-8">
              <span className="gradient-text">Ogah Ribetzz</span> Foundation
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Tercipta karena keresahan pada sesuatu yang rumit. 
              <br/>
              Kami hadir untuk membuktikan bahwa <span className="font-semibold text-gray-800">"rumit itu cuma alasan"</span>.
              Mari berbagi kebaikan dengan cara yang paling sederhana.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/berbagi" className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                Program Berjalan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Sat Set Tanpa Ribet</h3>
                    <p className="text-gray-600">Proses donasi dan penyaluran yang memotong birokrasi tidak penting.</p>
                </div>
                <div className="p-6 rounded-2xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">100% Transparan</h3>
                    <p className="text-gray-600">Setiap rupiah yang masuk dan keluar tercatat dan dapat diakses publik.</p>
                </div>
                <div className="p-6 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition-colors">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 text-pink-600">
                        <Heart size={24} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Dampak Nyata</h3>
                    <p className="text-gray-600">Fokus pada eksekusi program yang memberikan manfaat langsung.</p>
                </div>
            </div>
         </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Program Kami</h2>
            <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Semua Program
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program) => (
                <div key={program.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                    <div className="relative h-48 overflow-hidden">
                    <img src={program.image} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4">
                        {program.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                            SEDANG BERJALAN
                        </span>
                        ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white shadow-sm">
                            <Clock size={12} className="mr-2" />
                            COMING SOON
                        </span>
                        )}
                    </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                    <div className="text-sm font-semibold text-purple-600 mb-2">{program.batch}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{program.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1">{program.description}</p>
                    
                    {program.status === 'ACTIVE' ? (
                        <Link to={program.link || '#'} className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-center hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        Lihat Detail <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
                        Segera Hadir
                        </button>
                    )}
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;