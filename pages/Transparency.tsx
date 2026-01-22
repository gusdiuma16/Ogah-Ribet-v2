import React, { useEffect, useState } from 'react';
import { getApprovedTransactions, calculateSummary } from '../services/mockDataService';
import { Transaction, TransactionType } from '../types';
import { Currency } from '../components/Formatters';
import { ArrowDownLeft, ArrowUpRight, Filter, Download, Search, Calendar, X } from 'lucide-react';

const Transparency: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  
  // Advanced Filter State
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getApprovedTransactions().then(data => {
      // Sort by date descending
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted);
      setSummary(calculateSummary(data));
      
      // Extract unique categories
      const categories = Array.from(new Set(data.map(t => t.category)));
      setAvailableCategories(categories);
    });
  }, []);

  const filteredTransactions = transactions.filter(t => {
    // 1. Type Filter
    if (filterType === 'INCOME' && t.type !== TransactionType.INCOME) return false;
    if (filterType === 'EXPENSE' && t.type !== TransactionType.EXPENSE) return false;

    // 2. Search Query (Name)
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // 3. Date Range
    if (startDate && new Date(t.date) < new Date(startDate)) return false;
    if (endDate && new Date(t.date) > new Date(endDate)) return false;

    // 4. Category
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

    return true;
  });

  const clearFilters = () => {
      setSearchQuery('');
      setStartDate('');
      setEndDate('');
      setSelectedCategory('ALL');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Transparansi Dana</h1>
          <p className="text-gray-500">Rekapitulasi pemasukan dan pengeluaran program <span className="font-semibold text-purple-600">Ogah Ribetzz Berbagi</span>.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowDownLeft size={60} color="blue" /></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</p>
                <div className="text-2xl font-bold text-blue-600"><Currency amount={summary.income} /></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowUpRight size={60} color="red" /></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</p>
                <div className="text-2xl font-bold text-red-500"><Currency amount={summary.expense} /></div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                <p className="text-sm font-medium text-blue-100 mb-1">Saldo Saat Ini</p>
                <div className="text-3xl font-bold"><Currency amount={summary.balance} /></div>
            </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                
                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                        placeholder="Cari nama donatur atau transaksi..."
                    />
                </div>

                {/* Quick Type Toggles */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setFilterType('ALL')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Semua
                    </button>
                    <button 
                        onClick={() => setFilterType('INCOME')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'INCOME' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pemasukan
                    </button>
                    <button 
                        onClick={() => setFilterType('EXPENSE')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'EXPENSE' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pengeluaran
                    </button>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Filter size={18} />
                        <span className="text-sm font-semibold">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Mulai Tanggal</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Sampai Tanggal</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Kategori Program</label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none bg-white"
                        >
                            <option value="ALL">Semua Kategori</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={clearFilters}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex justify-center items-center gap-1"
                        >
                            <X size={16} /> Reset Filter
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Keterangan</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4 text-right">Jumlah</th>
                            <th className="px-6 py-4 text-center">Tipe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                    {t.date}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {t.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {t.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-bold font-mono">
                                    <span className={t.type === TransactionType.INCOME ? 'text-blue-600' : 'text-red-500'}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'} <Currency amount={t.amount} />
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {t.type === TransactionType.INCOME ? (
                                        <span className="p-1.5 rounded-full bg-blue-100 text-blue-600 inline-block"><ArrowDownLeft size={16} /></span>
                                    ) : (
                                        <span className="p-1.5 rounded-full bg-red-100 text-red-600 inline-block"><ArrowUpRight size={16} /></span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Search size={40} className="text-gray-200 mb-2" />
                                        <p>Tidak ada transaksi yang sesuai dengan filter Anda.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Transparency;