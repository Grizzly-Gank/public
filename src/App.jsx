import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Home, ShoppingCart, Package, FileText, Settings as SettingsIcon, 
  LogOut, Plus, Minus, Trash2, Search, ScanLine, Printer, Download,
  Calendar, DollarSign, TrendingUp, CheckCircle, Upload, Users, BookOpen, Eye, EyeOff,
  Edit
} from 'lucide-react';

// --- DATABASE & STATE MANAGEMENT (LocalStorage) ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- CUSTOM STYLES & GOOGLE FONTS ---
const CustomStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      font-family: 'Inter', sans-serif;
    }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Smooth entrance animations */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    
    .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
    .animate-fadeInUp { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

export default function App() {
  const [authUser, setAuthUser] = useLocalStorage('pos_auth_user', null); 
  const [activeTab, setActiveTab] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [products, setProducts] = useLocalStorage('pos_products', [
    { id: '1', barcode: '899123456', name: 'Nasi Gudeg Spesial', stock: 50, buyPriceBox: 100000, buyPriceUnit: 10000, sellPrice: 15000, category: 'Makanan' },
    { id: '2', barcode: '899654321', name: 'Es Teh Manis', stock: 100, buyPriceBox: 20000, buyPriceUnit: 2000, sellPrice: 5000, category: 'Minuman' },
    { id: '3', barcode: '899987654', name: 'Keripik Singkong', stock: 5, buyPriceBox: 50000, buyPriceUnit: 5000, sellPrice: 8000, category: 'Cemilan' },
  ]);
  const [transactions, setTransactions] = useLocalStorage('pos_transactions', []);
  const [customers, setCustomers] = useLocalStorage('pos_customers', []);
  const [settings, setSettings] = useLocalStorage('pos_settings', {
    storeName: 'KasirGo',
    address: 'Jl. Merdeka No. 45, Jakarta',
    phone: '081234567890',
    cashierName: 'Admin Utama',
    themeColor: 'caramel',
    printerType: 'bluetooth',
    paperSize: '58mm',
    receiptLogo: null,
    receiptFooter: '*** Terima Kasih ***'
  });

  // Gradient enhanced themes
  const themeColors = {
    caramel: { primary: 'bg-[#867233]', gradient: 'bg-gradient-to-r from-[#867233] to-[#a38c43]', hover: 'hover:bg-[#6b5b29]', text: 'text-[#867233]', light: 'bg-[#f4efe1]', ring: 'focus:ring-[#867233]/40' },
    green: { primary: 'bg-emerald-600', gradient: 'bg-gradient-to-r from-emerald-600 to-teal-500', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', light: 'bg-emerald-50', ring: 'focus:ring-emerald-500/40' },
    blue: { primary: 'bg-blue-600', gradient: 'bg-gradient-to-r from-blue-600 to-indigo-500', hover: 'hover:bg-blue-700', text: 'text-blue-600', light: 'bg-blue-50', ring: 'focus:ring-blue-500/40' },
    dark: { primary: 'bg-slate-800', gradient: 'bg-gradient-to-r from-slate-800 to-gray-700', hover: 'hover:bg-slate-900', text: 'text-slate-800', light: 'bg-slate-100', ring: 'focus:ring-slate-800/40' },
  };
  const thm = themeColors[settings.themeColor] || themeColors.caramel;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authUser) {
      if (authUser.role === 'owner' && activeTab === 'pos' && !window.localStorage.getItem('tab_set')) {
        setActiveTab('dashboard');
        window.localStorage.setItem('tab_set', 'true');
      }
    } else {
      window.localStorage.removeItem('tab_set');
    }
  }, [authUser, activeTab]);

  if (!authUser) {
    return <><CustomStyles/><LoginScreen onLogin={(user) => setAuthUser(user)} thm={thm} /></>;
  }

  // Functional Icon Colors for Sidebar
  const navItems = [
    { id: 'dashboard', icon: <Home size={20} className={activeTab === 'dashboard' ? 'text-white' : 'text-blue-500'}/>, label: 'Dashboard', roles: ['owner'] },
    { id: 'pos', icon: <ShoppingCart size={20} className={activeTab === 'pos' ? 'text-white' : 'text-emerald-500'}/>, label: 'Mesin Kasir (POS)', roles: ['owner', 'cashier'] },
    { id: 'customers', icon: <Users size={20} className={activeTab === 'customers' ? 'text-white' : 'text-purple-500'}/>, label: 'Data Pelanggan', roles: ['owner', 'cashier'] },
    { id: 'debts', icon: <BookOpen size={20} className={activeTab === 'debts' ? 'text-white' : 'text-rose-500'}/>, label: 'Buku Kasbon', roles: ['owner', 'cashier'] },
    { id: 'inventory', icon: <Package size={20} className={activeTab === 'inventory' ? 'text-white' : 'text-amber-500'}/>, label: 'Inventaris', roles: ['owner'] },
    { id: 'history', icon: <FileText size={20} className={activeTab === 'history' ? 'text-white' : 'text-teal-500'}/>, label: 'Riwayat Transaksi', roles: ['owner', 'cashier'] },
    { id: 'settings', icon: <SettingsIcon size={20} className={activeTab === 'settings' ? 'text-white' : 'text-slate-500'}/>, label: 'Pengaturan', roles: ['owner'] },
  ].filter(item => item.roles.includes(authUser.role));

  return (
    <>
      <CustomStyles />
      <div className="flex h-screen bg-[#F8F9FC] text-gray-800 overflow-hidden">
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className={`text-2xl font-black bg-clip-text text-transparent ${thm.gradient} tracking-tight`}>{settings.storeName}</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={20} /></button>
          </div>
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id ? `${thm.gradient} text-white shadow-md transform scale-[1.02]` : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {item.icon}
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full p-5 border-t border-gray-50 bg-white/80 backdrop-blur-md">
            <div className="mb-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
              Login: <span className={`ml-1 px-2 py-0.5 rounded-md font-bold text-white ${authUser.role === 'owner' ? 'bg-blue-500' : 'bg-emerald-500'}`}>{authUser.role === 'owner' ? 'Owner' : 'Kasir'}</span>
            </div>
            <button 
              onClick={() => setAuthUser(null)}
              className="w-full flex items-center justify-center space-x-2 p-3.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-2xl transition-all font-bold text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </div>

        {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden print:bg-white">
          <header className="bg-white/80 backdrop-blur-md shadow-[0_4px_30px_-5px_rgba(0,0,0,0.03)] h-20 flex items-center justify-between px-6 z-10 print:hidden sticky top-0 border-b border-gray-100/50">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-2xl ${thm.light} ${thm.text} hover:opacity-80 transition-colors`}>
                <Menu size={24} />
              </button>
              <h1 className={`text-2xl font-black text-gray-800 hidden sm:block tracking-tight`}>{settings.storeName}</h1>
            </div>
            <div className="flex items-center space-x-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs font-medium text-gray-400">{currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className={`h-11 w-11 rounded-2xl ${thm.gradient} flex items-center justify-center text-white font-bold shadow-lg shadow-[#867233]/20 transform hover:scale-105 transition-transform cursor-pointer`}>
                {authUser.role === 'owner' ? 'OW' : 'KS'}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-[#F8F9FC] print:bg-white print:overflow-visible relative">
            {activeTab === 'dashboard' && authUser.role === 'owner' && <DashboardView transactions={transactions} products={products} thm={thm} />}
            {activeTab === 'pos' && <POSView products={products} setProducts={setProducts} transactions={transactions} setTransactions={setTransactions} customers={customers} settings={settings} thm={thm} authUser={authUser} />}
            {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} thm={thm} authUser={authUser} />}
            {activeTab === 'debts' && <DebtsView transactions={transactions} setTransactions={setTransactions} thm={thm} />}
            {activeTab === 'inventory' && authUser.role === 'owner' && <InventoryView products={products} setProducts={setProducts} thm={thm} />}
            {activeTab === 'history' && <HistoryView transactions={transactions} setTransactions={setTransactions} settings={settings} thm={thm} authUser={authUser} />}
            {activeTab === 'settings' && authUser.role === 'owner' && <SettingsView settings={settings} setSettings={setSettings} themeColors={themeColors} thm={thm} />}
          </main>
        </div>
      </div>
    </>
  );
}

function LoginScreen({ onLogin, thm }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'owner1727' && password === 'ghozzin1727') {
      onLogin({ role: 'owner', username });
    } else if (username === 'akunkasir1727' && password === '1sampai1727') {
      onLogin({ role: 'cashier', username });
    } else {
      setError('Sandi atau username salah.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8F9FC] to-[#E2E8F0] p-4 relative overflow-hidden">
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${thm.primary} opacity-10 rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 ${thm.primary} opacity-10 rounded-full blur-3xl`}></div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] w-full max-w-md transform transition-all duration-500 border border-white z-10 animate-scaleIn">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 mx-auto ${thm.gradient} rounded-[1.5rem] flex items-center justify-center mb-5 shadow-lg shadow-[#867233]/20 text-white transform hover:rotate-6 transition-transform`}>
            <ShoppingCart size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">KasirGo</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Retail Point of Sale Modern</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 ${thm.ring} transition-all outline-none font-semibold text-gray-800 shadow-inner`}
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Kata Sandi</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-4 pr-12 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 ${thm.ring} transition-all outline-none font-semibold text-gray-800 shadow-inner`}
                placeholder="Masukkan sandi"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>
          {error && <p className="text-rose-500 text-sm font-bold text-center bg-rose-50 border border-rose-100 py-3 rounded-2xl animate-fadeInUp">{error}</p>}
          <button 
            type="submit" 
            className={`w-full ${thm.gradient} text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-[#867233]/20 transition-all transform hover:-translate-y-1 active:scale-95`}
          >
            Masuk Sistem
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-xs font-bold text-gray-400 tracking-wide z-10">
        © 2026 M. Ghozzin Dirham | All Right Reserved
      </p>
    </div>
  );
}

function DashboardView({ transactions, products, thm }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const calcStats = (filterDateFn) => {
    return transactions.filter(t => filterDateFn(new Date(t.date))).reduce((acc, curr) => {
      acc.revenue += curr.total;
      acc.items += curr.items.reduce((sum, item) => sum + item.qty, 0);
      acc.margin += curr.items.reduce((sum, item) => sum + ((item.sellPrice - item.buyPriceUnit) * item.qty), 0);
      acc.count += 1;
      return acc;
    }, { revenue: 0, items: 0, margin: 0, count: 0 });
  };

  const todayStats = calcStats((d) => d >= today);
  const monthStats = calcStats((d) => d >= startOfMonth);
  
  const lowStockProducts = products.filter(p => p.stock <= 10);
  const unpaidDebts = transactions.filter(t => t.paymentMethod === 'Kasbon' && t.paymentStatus === 'Belum Lunas');
  const totalDebtAmount = unpaidDebts.reduce((sum, t) => sum + t.total, 0);

  // Line Chart Data Generation (Last 7 days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
      const dayTotal = transactions.filter(t => new Date(t.date) >= d && new Date(t.date) < nextD).reduce((sum, t) => sum + t.total, 0);
      data.push({ day: d.toLocaleDateString('id-ID', { weekday: 'short' }), date: d.getDate(), total: dayTotal });
    }
    return data;
  }, [transactions]);

  // SVG Chart Calculation
  const maxVal = Math.max(...chartData.map(d => d.total), 100);
  const chartWidth = 600; const chartHeight = 200; const padding = 30;
  
  const points = chartData.map((d, i) => {
    const x = padding + (i * ((chartWidth - padding * 2) / (chartData.length - 1)));
    const y = chartHeight - padding - ((d.total / maxVal) * (chartHeight - padding * 2));
    return { x, y, value: d.total, label: d.day };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.map((p, i) => i === 0 ? '' : `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x} ${chartHeight-padding} L ${points[0].x} ${chartHeight-padding} Z`;

  return (
    <div className="p-8 animate-fadeIn print:hidden max-w-7xl mx-auto">
      <h2 className="text-3xl font-black text-gray-800 mb-8 tracking-tight">Ringkasan Bisnis</h2>
      
      {/* 4 Colorful Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-gray-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-4 rounded-2xl bg-blue-100 text-blue-600 shadow-inner`}><Calendar size={24} /></div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Omset Hari Ini</h3>
            </div>
            <div className="text-3xl font-black text-gray-800 tracking-tight">Rp {todayStats.revenue.toLocaleString('id-ID')}</div>
            <div className="mt-3 text-xs font-black text-white bg-blue-500 inline-block px-3 py-1.5 rounded-xl shadow-md">Laba: Rp {todayStats.margin.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-gray-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-4 rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner`}><TrendingUp size={24} /></div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Omset Bulan Ini</h3>
            </div>
            <div className="text-3xl font-black text-gray-800 tracking-tight">Rp {monthStats.revenue.toLocaleString('id-ID')}</div>
            <div className="mt-3 text-xs font-black text-white bg-emerald-500 inline-block px-3 py-1.5 rounded-xl shadow-md">Laba: Rp {monthStats.margin.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-gray-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-4 rounded-2xl bg-purple-100 text-purple-600 shadow-inner`}><ShoppingCart size={24} /></div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Nota Hari Ini</h3>
            </div>
            <div className="text-3xl font-black text-gray-800 tracking-tight">{todayStats.count} <span className="text-xl text-gray-400">Trx</span></div>
            <div className="mt-3 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 inline-block px-3 py-1.5 rounded-xl">Rata-rata: Rp {todayStats.count > 0 ? Math.round(todayStats.revenue / todayStats.count).toLocaleString('id-ID') : 0}/nota</div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-rose-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-4 rounded-2xl bg-rose-100 text-rose-600 shadow-inner`}><BookOpen size={24} /></div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Piutang</h3>
            </div>
            <div className="text-3xl font-black text-rose-600 tracking-tight">Rp {totalDebtAmount.toLocaleString('id-ID')}</div>
            <div className="mt-3 text-xs font-bold text-white bg-rose-500 inline-block px-3 py-1.5 rounded-xl shadow-md">{unpaidDebts.length} Kasbon Aktif</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><TrendingUp size={22} className="mr-2 text-indigo-500"/> Pertumbuhan Penjualan (7 Hari)</h3>
          <div className="w-full overflow-x-auto hide-scrollbar">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto drop-shadow-sm min-w-[500px]">
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1={padding} y1={padding} x2={chartWidth-padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4"/>
              <line x1={padding} y1={(chartHeight)/2} x2={chartWidth-padding} y2={(chartHeight)/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4"/>
              <line x1={padding} y1={chartHeight-padding} x2={chartWidth-padding} y2={chartHeight-padding} stroke="#e2e8f0" strokeWidth="2"/>
              
              <path d={areaD} fill="url(#gradientArea)" />
              <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" className="transition-all duration-300 group-hover:r-8 group-hover:fill-indigo-100"/>
                  <text x={p.x} y={chartHeight - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">{p.label}</text>
                  <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="800" className="opacity-0 group-hover:opacity-100 transition-opacity">Rp {(p.value/1000)}k</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center"><Package size={20} className="mr-2 text-amber-500"/> Stok Menipis</h3>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? <p className="text-gray-400 text-sm font-medium">Semua stok aman terkendali.</p> : 
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-amber-50 rounded-2xl transition-colors border border-gray-100 hover:border-amber-100">
                    <span className="font-bold text-gray-700 text-sm">{p.name}</span>
                    <span className="text-xs font-black bg-red-100 text-red-600 px-3 py-1.5 rounded-xl shadow-sm">Sisa {p.stock}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-400"></div>
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center"><Users size={20} className="mr-2 text-rose-500"/> Kasbon Terbaru</h3>
            <div className="space-y-3">
              {unpaidDebts.length === 0 ? <p className="text-gray-400 text-sm font-medium">Tidak ada hutang pelanggan.</p> : 
                unpaidDebts.slice(0,4).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-rose-50 rounded-2xl transition-colors border border-gray-100 hover:border-rose-100">
                    <div>
                      <div className="font-bold text-gray-700 text-sm">{t.customerName}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase mt-0.5">{new Date(t.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</div>
                    </div>
                    <span className="font-black text-rose-600">Rp {t.total.toLocaleString('id-ID')}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function POSView({ products, setProducts, transactions, setTransactions, customers, settings, thm, authUser }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product) => {
    if (product.stock <= 0) { setAlertMsg(`Stok ${product.name} habis!`); return; }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stock) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);
  
  const processCheckout = (paymentData) => {
    const newTx = {
      id: 'TRX-' + Date.now(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: subtotal,
      total: subtotal,
      cash: paymentData.cash,
      change: paymentData.change,
      cashier: authUser.role === 'owner' ? settings.cashierName : 'Kasir',
      paymentMethod: paymentData.method,
      customerName: paymentData.customerName,
      paymentStatus: paymentData.method === 'Kasbon' ? 'Belum Lunas' : 'Lunas'
    };

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });

    setProducts(updatedProducts);
    setTransactions([newTx, ...transactions]);
    setLastTransaction(newTx);
    
    setCart([]);
    setShowCheckout(false);
    setShowReceipt(true);
  };

  return (
    <div className="flex h-full print:block print:h-auto animate-fadeIn">
      <div className="flex-1 flex flex-col print:hidden p-4 space-y-4 max-w-5xl mx-auto">
        <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-3 flex items-center space-x-2 border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-4 text-gray-400" size={22} />
            <input 
              type="text" 
              placeholder="Cari menu atau scan barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-14 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 border-none transition-all outline-none font-bold text-gray-700 text-lg shadow-inner"
            />
            <button className={`absolute right-3 top-2 p-2 rounded-xl ${thm.light} ${thm.text} hover:opacity-80 transition transform hover:scale-105`}>
              <ScanLine size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-4 pb-20 px-2 hide-scrollbar">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center justify-between hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all transform hover:-translate-y-1 cursor-pointer group" onClick={() => addToCart(product)}>
              <div className="flex flex-col">
                <span className="font-black text-gray-800 text-xl group-hover:text-emerald-600 transition-colors">{product.name}</span>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold tracking-wide">{product.category || 'Item'}</span>
                  <span className={`text-xs font-black tracking-wide ${product.stock > 10 ? 'text-emerald-500' : 'text-rose-500'}`}>Sisa: {product.stock}</span>
                </div>
              </div>
              <div className="flex items-center space-x-5">
                <span className={`font-black text-2xl bg-clip-text text-transparent ${thm.gradient}`}>Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className={`p-3 rounded-2xl ${thm.light} ${thm.text} hover:scale-110 transition-transform shadow-sm`}
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[420px] bg-white flex flex-col shadow-[-10px_0_40px_rgb(0,0,0,0.05)] z-20 print:hidden border-l border-gray-100">
        <div className="p-6 flex justify-between items-center bg-white z-10 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center"><ShoppingCart size={24} className="mr-3 text-emerald-500"/> Pesanan</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-rose-500 text-sm font-black flex items-center hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-rose-100">
              <Trash2 size={16} className="mr-2"/> Hapus
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50/50 hide-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-300">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"><ShoppingCart size={40} className="opacity-50" /></div>
              <p className="font-bold tracking-wide">Belum ada pesanan.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                  <div className={`text-sm font-black ${thm.text} mt-1`}>Rp {item.sellPrice.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1.5 shadow-inner border border-gray-100">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-2 rounded-lg bg-white shadow-sm text-gray-500 hover:text-rose-500 transition-colors"><Minus size={16}/></button>
                  <span className="font-black w-8 text-center text-gray-800">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-2 rounded-lg bg-white shadow-sm text-gray-500 hover:text-emerald-500 transition-colors"><Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgb(0,0,0,0.03)] z-10">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Total Item</span>
            <span className="font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div className="flex justify-between mb-8 items-end">
            <span className="font-black text-2xl text-gray-800">Total</span>
            <span className={`font-black text-4xl bg-clip-text text-transparent ${thm.gradient}`}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xl text-white shadow-xl transition-all transform active:scale-95 flex justify-center items-center ${cart.length === 0 ? 'bg-gray-200 shadow-none cursor-not-allowed text-gray-400' : `${thm.gradient} hover:-translate-y-1 shadow-[#867233]/30`}`}
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {showCheckout && <CheckoutModal subtotal={subtotal} customers={customers} onClose={() => setShowCheckout(false)} onProcess={processCheckout} thm={thm} />}
      {showReceipt && <ReceiptModal transaction={lastTransaction} settings={settings} onClose={() => setShowReceipt(false)} thm={thm} />}

      {/* Elegant Alert Modal */}
      {alertMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem]"></div>
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full text-center relative z-10 animate-scaleIn shadow-2xl border border-white">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Package size={30} /></div>
            <h3 className="font-black text-gray-800 mb-2">Peringatan</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">{alertMsg}</p>
            <button onClick={() => setAlertMsg('')} className="w-full py-3 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-colors">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutModal({ subtotal, customers, onClose, onProcess, thm }) {
  const [cash, setCash] = useState('');
  const [method, setMethod] = useState('Tunai');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const handleProcess = () => {
    if (method === 'Tunai') {
      const cashVal = parseInt(cash.replace(/\D/g, '')) || 0;
      if (cashVal < subtotal) { setAlertMsg('Uang pelanggan kurang dari tagihan!'); return; }
      onProcess({ method, cash: cashVal, change: cashVal - subtotal, customerName: '-' });
    } else if (method === 'QRIS') {
      onProcess({ method, cash: subtotal, change: 0, customerName: '-' });
    } else if (method === 'Kasbon') {
      if (!selectedCustomer) { setAlertMsg('Pilih nama pelanggan untuk kasbon!'); return; }
      onProcess({ method, cash: 0, change: 0, customerName: selectedCustomer });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-fadeInUp border border-white">
        <div className={`p-10 ${thm.gradient} text-white text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
          <h3 className="text-xs font-black opacity-80 uppercase tracking-widest mb-2 relative z-10">Total Tagihan</h3>
          <div className="text-5xl font-black tracking-tight relative z-10 drop-shadow-lg">Rp {subtotal.toLocaleString('id-ID')}</div>
        </div>
        
        <div className="p-8 space-y-6 bg-gray-50/50">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-100 rounded-2xl">
              {['Tunai', 'QRIS', 'Kasbon'].map(m => (
                <button 
                  key={m} onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl font-black text-sm transition-all border-none ${method === m ? `bg-white text-gray-800 shadow-md` : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {method === 'Tunai' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Terima Uang</label>
              <input 
                type="text" autoFocus value={cash}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCash(val ? parseInt(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className="w-full text-right text-4xl font-black p-5 bg-white border border-gray-200 rounded-[1.5rem] focus:ring-4 focus:border-transparent outline-none text-gray-800 shadow-inner transition-shadow"
                style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }}
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <button onClick={() => setCash(subtotal.toLocaleString('id-ID'))} className="py-3 rounded-xl font-black text-sm bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">Uang Pas</button>
                 <button onClick={() => setCash('100.000')} className="py-3 rounded-xl font-black text-sm bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors">Rp 100.000</button>
              </div>
            </div>
          )}

          {method === 'Kasbon' && (
            <div className="animate-fadeIn">
               <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Pilih Pelanggan (Wajib)</label>
               <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 outline-none font-bold text-gray-700 appearance-none shadow-sm" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }}>
                 <option value="">-- Pilih Nama Pelanggan --</option>
                 {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>)}
               </select>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">Batal</button>
            <button onClick={handleProcess} className={`flex-1 py-4 ${thm.gradient} text-white font-black rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95`}>Proses Bayar</button>
          </div>
        </div>
      </div>

      {alertMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem]"></div>
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full text-center relative z-10 animate-scaleIn shadow-2xl border border-white">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingCart size={30} /></div>
            <h3 className="font-black text-gray-800 mb-2">Informasi</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">{alertMsg}</p>
            <button onClick={() => setAlertMsg('')} className="w-full py-3 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-colors">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptModal({ transaction, settings, onClose, thm }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:block animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-fadeInUp border border-gray-100 overflow-hidden">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 print:hidden">
          <h3 className="font-black text-gray-800 flex items-center"><FileText size={20} className="mr-2 text-gray-400"/> Preview Struk</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8 overflow-y-auto print:p-0 font-mono text-sm text-gray-800 bg-white">
          <div className="text-center mb-6">
            {settings.receiptLogo && <img src={settings.receiptLogo} alt="Logo" className="h-16 mx-auto mb-3 object-contain" />}
            <h2 className="text-2xl font-black uppercase tracking-widest">{settings.storeName}</h2>
            <p className="text-xs text-gray-500 whitespace-pre-wrap mt-1 font-sans font-medium">{settings.address}</p>
            <p className="text-xs text-gray-500 font-sans font-medium">{settings.phone}</p>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-3 text-xs space-y-1 font-medium">
            <div className="flex justify-between"><span>No:</span><span className="font-bold">{transaction.id}</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>{new Date(transaction.date).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span>{transaction.cashier}</span></div>
            <div className="flex justify-between"><span>Metode:</span><span className="font-bold">{transaction.paymentMethod}</span></div>
            {transaction.paymentMethod === 'Kasbon' && <div className="flex justify-between text-rose-500"><span>Pelanggan:</span><span className="font-bold">{transaction.customerName}</span></div>}
          </div>

          <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-3 space-y-2">
            {transaction.items.map(item => (
              <div key={item.id}>
                <div className="font-bold">{item.name}</div>
                <div className="flex justify-between text-xs mt-0.5 text-gray-600 font-medium">
                  <span>{item.qty} x {item.sellPrice.toLocaleString('id-ID')}</span>
                  <span className="font-bold text-gray-800">{(item.qty * item.sellPrice).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 mb-8 text-sm">
            <div className="flex justify-between text-lg font-black mt-2 pt-2">
              <span>TOTAL</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && (
              <>
                <div className="flex justify-between font-bold text-gray-500"><span>Tunai</span><span>Rp {transaction.cash.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between font-bold text-gray-500"><span>Kembali</span><span>Rp {transaction.change.toLocaleString('id-ID')}</span></div>
              </>
            )}
            {transaction.paymentMethod === 'Kasbon' && (
              <div className={`text-center mt-4 p-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${transaction.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                Status: {transaction.paymentStatus}
              </div>
            )}
          </div>

          <div className="text-center text-xs font-bold text-gray-400 italic whitespace-pre-wrap">
            {settings.receiptFooter || '*** Terima Kasih ***'}
          </div>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100 flex space-x-3 print:hidden">
          <button onClick={onClose} className="flex-1 py-3.5 bg-white text-gray-600 font-black rounded-xl hover:bg-gray-100 transition shadow-sm border border-gray-200">Selesai</button>
          <button onClick={() => window.print()} className={`flex-1 flex items-center justify-center py-3.5 ${thm.gradient} text-white font-black rounded-xl transition shadow-lg hover:-translate-y-0.5 transform`}>
            <Printer size={18} className="mr-2" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomersView({ customers, setCustomers, thm, authUser }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCust, setEditingCust] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newCust = { id: editingCust ? editingCust.id : 'CUST-'+Date.now(), name: data.get('name'), phone: data.get('phone'), address: data.get('address') };
    if (editingCust) {
      setCustomers(customers.map(c => c.id === editingCust.id ? newCust : c));
    } else {
      setCustomers([newCust, ...customers]);
    }
    setShowAdd(false); setEditingCust(null);
  };

  const handleDelete = (id) => {
    setConfirmData({
      title: 'Hapus Pelanggan?',
      message: 'Data pelanggan ini akan dihapus secara permanen.',
      isDanger: true,
      confirmText: 'Hapus',
      action: () => setCustomers(customers.filter(c => c.id !== id))
    });
  };

  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Data Pelanggan</h2>
        <button onClick={() => { setEditingCust(null); setShowAdd(true); }} className={`${thm.gradient} text-white px-5 py-3 rounded-2xl flex items-center font-black shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transition-transform`}><Plus size={20} className="mr-2"/> Tambah</button>
      </div>
      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-widest font-black">
            <tr><th className="p-6">Nama Pelanggan</th><th className="p-6">No. HP</th><th className="p-6">Alamat</th>{authUser.role === 'owner' && <th className="p-6 text-center">Aksi</th>}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-purple-50/30 transition-colors group">
                <td className="p-6 font-black text-gray-800">{c.name}</td>
                <td className="p-6 font-bold text-gray-500">{c.phone}</td>
                <td className="p-6 text-gray-500 font-medium text-sm">{c.address}</td>
                {authUser.role === 'owner' && (
                  <td className="p-6 text-center space-x-2">
                    <button onClick={() => { setEditingCust(c); setShowAdd(true); }} className="p-2 bg-white rounded-xl text-purple-500 hover:bg-purple-100 border border-gray-100 shadow-sm transition"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-100 border border-gray-100 shadow-sm transition"><Trash2 size={18}/></button>
                  </td>
                )}
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={authUser.role === 'owner' ? "4" : "3"} className="p-10 text-center text-gray-400 font-bold">Belum ada data pelanggan.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 border border-white animate-scaleIn">
            <h3 className="font-black text-2xl text-gray-800 mb-6">{editingCust ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required name="name" defaultValue={editingCust?.name} placeholder="Nama Lengkap" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
              <input required name="phone" defaultValue={editingCust?.phone} placeholder="No. WhatsApp" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
              <textarea name="address" defaultValue={editingCust?.address} placeholder="Alamat" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} rows="3" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-black rounded-2xl shadow-sm">Batal</button>
                <button type="submit" className={`flex-1 py-4 ${thm.gradient} text-white font-black rounded-2xl shadow-lg`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elegant Confirm Modal */}
      {confirmData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">{confirmData.title}</h3>
            <p className="text-gray-500 font-medium mb-6">{confirmData.message}</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmData(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition">Batal</button>
              <button onClick={() => { confirmData.action(); setConfirmData(null); }} className="flex-1 py-3 text-white font-black rounded-xl shadow-lg transition bg-rose-500 hover:bg-rose-600">{confirmData.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsView({ transactions, setTransactions, thm }) {
  const [confirmData, setConfirmData] = useState(null);
  const debts = transactions.filter(t => t.paymentMethod === 'Kasbon');

  const payDebt = (id) => {
    setConfirmData({
      title: 'Konfirmasi Lunas',
      message: 'Tandai hutang pelanggan ini sebagai LUNAS?',
      isDanger: false,
      confirmText: 'Ya, Lunas!',
      action: () => setTransactions(transactions.map(t => t.id === id ? { ...t, paymentStatus: 'Lunas' } : t))
    });
  };

  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Buku Kasbon / Piutang</h2>
      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-widest font-black">
            <tr><th className="p-6">Tanggal</th><th className="p-6">Pelanggan</th><th className="p-6">Nominal</th><th className="p-6">Status</th><th className="p-6 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {debts.map(d => (
              <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                <td className="p-6 text-sm font-bold text-gray-500">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                <td className="p-6 font-black text-gray-800">{d.customerName}</td>
                <td className="p-6 font-black text-rose-600">Rp {d.total.toLocaleString('id-ID')}</td>
                <td className="p-6"><span className={`px-4 py-1.5 text-xs font-black tracking-wide rounded-xl border ${d.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{d.paymentStatus}</span></td>
                <td className="p-6 text-center">
                  {d.paymentStatus !== 'Lunas' && <button onClick={() => payDebt(d.id)} className={`px-5 py-2.5 bg-emerald-500 text-white font-black rounded-xl text-xs hover:bg-emerald-600 shadow-md transition-transform active:scale-95`}>Lunas!</button>}
                </td>
              </tr>
            ))}
            {debts.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold">Tidak ada catatan kasbon.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Elegant Confirm Modal */}
      {confirmData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">{confirmData.title}</h3>
            <p className="text-gray-500 font-medium mb-6">{confirmData.message}</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmData(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition">Batal</button>
              <button onClick={() => { confirmData.action(); setConfirmData(null); }} className="flex-1 py-3 text-white font-black rounded-xl shadow-lg transition bg-emerald-500 hover:bg-emerald-600">{confirmData.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryView({ products, setProducts, thm }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const prod = { id: editingProd ? editingProd.id : 'PRD-'+Date.now(), barcode: fd.get('barcode'), name: fd.get('name'), stock: parseInt(fd.get('stock')), category: fd.get('category'), buyPriceBox: parseInt(fd.get('buyPriceBox')), buyPriceUnit: parseInt(fd.get('buyPriceUnit')), sellPrice: parseInt(fd.get('sellPrice')) };
    if (editingProd) setProducts(products.map(p => p.id === prod.id ? prod : p));
    else setProducts([prod, ...products]);
    setShowAdd(false); setEditingProd(null);
  };
  
  const handleDelete = (id) => {
    setConfirmData({
      title: 'Hapus Produk?',
      message: 'Produk ini akan dihapus permanen dari inventaris.',
      isDanger: true,
      confirmText: 'Hapus',
      action: () => setProducts(products.filter(p => p.id !== id))
    });
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      const newProducts = [];
      // Start loop from 1 to skip header row
      for (let i = 1; i < rows.length; i++) {
        // Simple comma split
        const cols = rows[i].split(',');
        if (cols.length >= 6) {
          newProducts.push({
            id: 'PRD-IMP-' + Date.now() + i,
            barcode: cols[0].trim(),
            name: cols[1].trim(),
            category: cols[2].trim(),
            stock: parseInt(cols[3].trim()) || 0,
            buyPriceBox: parseInt(cols[4].trim()) || 0, // Fallback logic
            buyPriceUnit: parseInt(cols[4].trim()) || 0,
            sellPrice: parseInt(cols[5].trim()) || 0,
          });
        }
      }
      
      if(newProducts.length > 0) {
          setProducts(prev => [...newProducts, ...prev]);
          setAlertMsg(`Sukses mengimpor ${newProducts.length} data produk!`);
      } else {
          setAlertMsg('Format CSV tidak valid. Ikuti template: Barcode, Produk, Kategori, Stok, Harga Beli, Harga Jual');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset so same file can be uploaded again if needed
  };

  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Manajemen Inventaris</h2>
        <div className="flex space-x-3">
          <label className="cursor-pointer bg-white border border-gray-200 text-gray-600 px-5 py-3 rounded-2xl flex items-center hover:bg-gray-50 shadow-sm font-black transition-colors">
            <Upload size={20} className="mr-2 text-amber-500"/> Import Data (.csv)
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </label>
          <button onClick={() => { setEditingProd(null); setShowAdd(true); }} className={`${thm.gradient} text-white px-5 py-3 rounded-2xl flex items-center font-black shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transition-transform`}>
            <Plus size={20} className="mr-2"/> Tambah Produk
          </button>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-widest font-black">
            <tr><th className="p-6">Barcode</th><th className="p-6">Produk</th><th className="p-6 text-center">Stok</th><th className="p-6">H. Beli</th><th className="p-6">H. Jual</th><th className="p-6 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-amber-50/30 transition-colors group">
                <td className="p-6 font-mono text-gray-400 text-sm font-bold">{p.barcode || '-'}</td>
                <td className="p-6 font-black text-gray-800">{p.name} <span className="block text-xs font-bold text-amber-500 mt-1 uppercase tracking-wide">{p.category}</span></td>
                <td className="p-6 text-center"><span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${p.stock <= 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{p.stock}</span></td>
                <td className="p-6 font-bold text-gray-500">Rp {p.buyPriceUnit.toLocaleString('id-ID')}</td>
                <td className="p-6 font-black text-gray-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                <td className="p-6 text-center space-x-2">
                  <button onClick={() => { setEditingProd(p); setShowAdd(true); }} className="p-2 bg-white rounded-xl text-amber-500 hover:bg-amber-100 border border-gray-100 shadow-sm transition"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-100 border border-gray-100 shadow-sm transition"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-bold">Belum ada produk.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 border border-white animate-scaleIn">
            <h3 className="font-black text-2xl text-gray-800 mb-6">{editingProd ? 'Edit Produk' : 'Tambah Produk'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="barcode" defaultValue={editingProd?.barcode} placeholder="Kode Barcode (Opsional)" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner font-mono text-sm" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
                <input required name="name" defaultValue={editingProd?.name} placeholder="Nama Produk" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required name="category" defaultValue={editingProd?.category} placeholder="Kategori" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
                <input required type="number" name="stock" defaultValue={editingProd?.stock} placeholder="Stok" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
                <input required type="number" name="buyPriceBox" defaultValue={editingProd?.buyPriceBox} placeholder="Modal Perdus" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
                <input required type="number" name="buyPriceUnit" defaultValue={editingProd?.buyPriceUnit} placeholder="Modal Satuan" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-bold shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
              </div>
              <input required type="number" name="sellPrice" defaultValue={editingProd?.sellPrice} placeholder="Harga Jual" className="w-full p-5 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 outline-none font-black text-2xl text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-black rounded-2xl shadow-sm">Batal</button>
                <button type="submit" className={`flex-1 py-4 ${thm.gradient} text-white font-black rounded-2xl shadow-lg`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elegant Modals */}
      {alertMsg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><Package size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Informasi</h3>
            <p className="text-gray-500 font-medium mb-6">{alertMsg}</p>
            <button onClick={() => setAlertMsg('')} className="w-full py-3 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200 transition">Tutup</button>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">{confirmData.title}</h3>
            <p className="text-gray-500 font-medium mb-6">{confirmData.message}</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmData(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition">Batal</button>
              <button onClick={() => { confirmData.action(); setConfirmData(null); }} className="flex-1 py-3 text-white font-black rounded-xl shadow-lg transition bg-rose-500 hover:bg-rose-600">{confirmData.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryView({ transactions, setTransactions, settings, thm, authUser }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const threeYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(threeYearsAgo);
  const [endDate, setEndDate] = useState(today);

  const filteredTx = transactions.filter(tx => { const d = new Date(tx.date); return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59'); });

  const exportCSV = () => {
    let csv = 'Waktu,ID Transaksi,Pembayaran,Total\n';
    filteredTx.forEach(tx => { 
      const waktu = new Date(tx.date).toLocaleString('id-ID');
      csv += `"${waktu}","${tx.id}","${tx.paymentMethod}","${tx.total}"\n`; 
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(blob); 
    link.download = `Riwayat_Transaksi.csv`; 
    link.click();
  };

  const handleDelete = (id) => {
    setConfirmData({
      title: 'Hapus Transaksi?',
      message: 'Catatan transaksi ini akan dihapus permanen.',
      isDanger: true,
      confirmText: 'Hapus',
      action: () => setTransactions(transactions.filter(t => t.id !== id))
    });
  };

  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-sm font-bold text-gray-400 mt-2 tracking-wide">Ditemukan {filteredTx.length} nota</p>
        </div>
        {authUser.role === 'owner' && (
          <button onClick={exportCSV} className={`flex items-center px-5 py-3 ${thm.gradient} text-white font-black rounded-2xl shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transition-transform`}>
            <Download size={20} className="mr-2"/> Export Data (.csv)
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 max-w-fit">
        <div className="flex items-center space-x-3 px-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Dari:</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-50 border-none text-gray-700 text-sm rounded-xl focus:ring-2 outline-none p-2 font-bold" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
        </div>
        <div className="flex items-center space-x-3 px-2 border-l border-gray-100">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sampai:</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-50 border-none text-gray-700 text-sm rounded-xl focus:ring-2 outline-none p-2 font-bold" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-widest font-black">
            <tr><th className="p-6">Waktu</th><th className="p-6">ID Transaksi</th><th className="p-6">Pembayaran</th><th className="p-6">Total</th><th className="p-6 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTx.map(tx => (
              <tr key={tx.id} className="hover:bg-teal-50/30 transition-colors group">
                <td className="p-6 font-bold text-sm text-gray-500">{new Date(tx.date).toLocaleString('id-ID')}</td>
                <td className="p-6 font-black text-gray-800 text-sm">{tx.id}</td>
                <td className="p-6">
                  <div className="font-bold text-gray-500 text-sm flex items-center space-x-2">
                    <span>{tx.paymentMethod}</span>
                    {tx.paymentMethod === 'Kasbon' && <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg border ${tx.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{tx.paymentStatus}</span>}
                  </div>
                </td>
                <td className="p-6 font-black text-gray-800">Rp {tx.total.toLocaleString('id-ID')}</td>
                <td className="p-6 text-center space-x-2">
                  <button onClick={() => setSelectedTx(tx)} className="p-2 bg-white rounded-xl text-teal-500 hover:bg-teal-100 border border-gray-100 shadow-sm transition"><FileText size={18}/></button>
                  {authUser.role === 'owner' && <button onClick={() => handleDelete(tx.id)} className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-100 border border-gray-100 shadow-sm transition"><Trash2 size={18}/></button>}
                </td>
              </tr>
            ))}
            {filteredTx.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold">Tidak ada transaksi di rentang tanggal ini.</td></tr>}
          </tbody>
        </table>
      </div>
      
      {selectedTx && <ReceiptModal transaction={selectedTx} settings={settings} onClose={() => setSelectedTx(null)} thm={thm} />}

      {/* Elegant Confirm Modal */}
      {confirmData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">{confirmData.title}</h3>
            <p className="text-gray-500 font-medium mb-6">{confirmData.message}</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmData(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition">Batal</button>
              <button onClick={() => { confirmData.action(); setConfirmData(null); }} className="flex-1 py-3 text-white font-black rounded-xl shadow-lg transition bg-rose-500 hover:bg-rose-600">{confirmData.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView({ settings, setSettings, themeColors, thm }) {
  const [formData, setFormData] = useState(settings);
  const [alertMsg, setAlertMsg] = useState('');
  
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setSettings(formData); 
    setAlertMsg('Pengaturan toko berhasil disimpan!'); 
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Pengaturan Toko</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 p-10 space-y-10">
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center"><Home size={16} className="mr-2 text-slate-400"/> Profil Usaha</h3>
          <div className="grid grid-cols-2 gap-5">
            <input required value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-4 outline-none font-black text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} placeholder="Nama Toko" />
            <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-4 outline-none font-bold text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} placeholder="No WhatsApp" />
            <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2 w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-4 outline-none font-bold text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} placeholder="Alamat Lengkap" rows="2" />
            <input required value={formData.cashierName} onChange={e => setFormData({...formData, cashierName: e.target.value})} className="col-span-2 w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-4 outline-none font-black text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} placeholder="Nama Kasir Saat Ini" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center"><Printer size={16} className="mr-2 text-slate-400"/> Printer Struk</h3>
            <div className="space-y-4">
               <select value={formData.printerType} onChange={e => setFormData({...formData, printerType: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-4 outline-none font-bold text-gray-700 shadow-sm appearance-none" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }}>
                 <option value="bluetooth">Bluetooth Thermal</option>
                 <option value="usb">USB Printer</option>
               </select>
               <select value={formData.paperSize} onChange={e => setFormData({...formData, paperSize: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-4 outline-none font-bold text-gray-700 shadow-sm appearance-none" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }}>
                 <option value="58mm">Kertas 58mm</option>
                 <option value="80mm">Kertas 80mm</option>
               </select>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center"><FileText size={16} className="mr-2 text-slate-400"/> Kustomisasi Struk</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Upload Logo (Opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => setFormData({...formData, receiptLogo: event.target.result}); reader.readAsDataURL(file); } }} className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-white file:text-gray-700 shadow-sm hover:file:bg-gray-100" />
                {formData.receiptLogo && <button type="button" onClick={() => setFormData({...formData, receiptLogo: null})} className="text-xs text-rose-500 font-black mt-2">Hapus Logo</button>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Teks Pesan Footer</label>
                <textarea value={formData.receiptFooter || ''} onChange={e => setFormData({...formData, receiptFooter: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-4 outline-none font-medium text-gray-800 shadow-inner" style={{ '--tw-ring-color': thm.primary.replace('bg-', '') }} placeholder="*** Terima Kasih ***" rows="2" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">🎨 Warna Tema UI</h3>
          <div className="flex space-x-5 bg-gray-50 p-6 rounded-3xl w-fit border border-gray-100 shadow-inner">
            {Object.keys(themeColors).map(color => (
              <button type="button" key={color} onClick={() => setFormData({...formData, themeColor: color})} className={`w-14 h-14 rounded-2xl ${themeColors[color].gradient} flex items-center justify-center transform transition-all hover:scale-110 shadow-lg ${formData.themeColor === color ? 'ring-4 ring-offset-4 ring-gray-300 scale-110' : 'opacity-80 hover:opacity-100'}`}>
                {formData.themeColor === color && <CheckCircle className="text-white drop-shadow-md" size={26} />}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className={`w-full py-5 ${thm.gradient} text-white font-black text-lg rounded-2xl shadow-xl hover:-translate-y-1 transform transition-all active:scale-95`}>Simpan Pengaturan</button>
      </form>

      {/* Elegant Success Modal */}
      {alertMsg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn border border-white">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={30} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Sukses</h3>
            <p className="text-gray-500 font-medium mb-6">{alertMsg}</p>
            <button onClick={() => setAlertMsg('')} className="w-full py-3 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200 transition">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}