import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Home, ShoppingCart, Package, FileText, Settings as SettingsIcon, 
  LogOut, Plus, Minus, Trash2, Search, ScanLine, Printer, Download,
  Calendar, DollarSign, TrendingUp, CheckCircle, Upload, Users, BookOpen, Eye, EyeOff,
  AlertCircle, Info, Edit
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

// --- CUSTOM STYLES (Animations & Scrollbars) ---
const CustomStyles = () => (
  <style>{`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes scaleIn {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `}</style>
);

export default function App() {
  const [authUser, setAuthUser] = useLocalStorage('pos_auth_user', null); 
  const [activeTab, setActiveTab] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Elegant Global Modals State
  const [alertMsg, setAlertMsg] = useState(null); // { title, message, type: 'error' | 'success' }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }

  const showNotification = (title, message, type = 'error') => setAlertMsg({ title, message, type });
  const showConfirm = (title, message, onConfirm) => setConfirmDialog({ title, message, onConfirm });

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
    paperSize: '58mm'
  });

  const themeColors = {
    caramel: { primary: 'bg-[#867233]', hover: 'hover:bg-[#6b5b29]', text: 'text-[#867233]', border: 'border-[#867233]', light: 'bg-[#f4efe1]', ring: 'focus:ring-[#867233]' },
    green: { primary: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', border: 'border-green-600', light: 'bg-green-50', ring: 'focus:ring-green-500' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50', ring: 'focus:ring-blue-500' },
    dark: { primary: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-gray-800', border: 'border-gray-800', light: 'bg-gray-100', ring: 'focus:ring-gray-800' },
  };
  const thm = themeColors[settings.themeColor] || themeColors.caramel;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (user, defaultTab) => {
    setAuthUser(user);
    setActiveTab(defaultTab);
  };

  if (!authUser) {
    return <><CustomStyles/><LoginScreen onLogin={handleLoginSuccess} thm={thm} /></>;
  }

  const navItems = [
    { id: 'dashboard', icon: <Home size={20}/>, label: 'Dashboard', roles: ['owner'] },
    { id: 'pos', icon: <ShoppingCart size={20}/>, label: 'Mesin Kasir (POS)', roles: ['owner', 'cashier'] },
    { id: 'customers', icon: <Users size={20}/>, label: 'Data Pelanggan', roles: ['owner', 'cashier'] },
    { id: 'debts', icon: <BookOpen size={20}/>, label: 'Buku Kasbon', roles: ['owner', 'cashier'] },
    { id: 'inventory', icon: <Package size={20}/>, label: 'Manajemen Inventaris', roles: ['owner'] },
    { id: 'history', icon: <FileText size={20}/>, label: 'Riwayat Transaksi', roles: ['owner', 'cashier'] },
    { id: 'settings', icon: <SettingsIcon size={20}/>, label: 'Pengaturan Toko', roles: ['owner'] },
  ].filter(item => item.roles.includes(authUser.role));

  return (
    <>
      <CustomStyles />
      {/* Global Modals for Alerts & Confirms */}
      {alertMsg && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-scaleIn border border-gray-100">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${alertMsg.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {alertMsg.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{alertMsg.title}</h3>
            <p className="text-gray-500 mb-6">{alertMsg.message}</p>
            <button onClick={() => setAlertMsg(null)} className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${alertMsg.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
              Mengerti
            </button>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-scaleIn border border-gray-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-500 mb-6">{confirmDialog.message}</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className={`flex-1 py-3 ${thm.primary} ${thm.hover} text-white font-bold rounded-xl transition-all transform active:scale-95`}>
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className={`text-2xl font-black ${thm.text} tracking-tight`}>{settings.storeName}</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-200 border border-transparent ${activeTab === item.id ? `${thm.light} ${thm.text} border-${thm.border.split('-')[1]} shadow-sm` : 'text-gray-500 hover:bg-gray-50 border-gray-50 hover:text-gray-800'}`}
              >
                {item.icon}
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
            <div className="mb-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Login: <span className={`font-bold ${thm.text}`}>{authUser.role === 'owner' ? 'Owner' : 'Kasir'}</span>
            </div>
            <button 
              onClick={() => setAuthUser(null)}
              className="w-full flex items-center justify-center space-x-2 p-3 text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 rounded-xl transition-colors font-bold text-sm"
            >
              <LogOut size={18} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>

        {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden print:bg-white">
          <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-6 z-10 print:hidden">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors`}>
                <Menu size={20} />
              </button>
              <h1 className={`text-xl font-black ${thm.text} hidden sm:block tracking-tight`}>{settings.storeName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs font-medium text-gray-400">{currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${thm.primary} flex items-center justify-center text-white font-bold shadow-md`}>
                {authUser.role === 'owner' ? 'OW' : 'KS'}
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-auto bg-gray-50 print:bg-white print:overflow-visible relative">
            <div className="flex-1">
              {activeTab === 'dashboard' && authUser.role === 'owner' && <DashboardView transactions={transactions} products={products} thm={thm} />}
              {activeTab === 'pos' && <POSView products={products} setProducts={setProducts} transactions={transactions} setTransactions={setTransactions} customers={customers} settings={settings} thm={thm} authUser={authUser} showNotification={showNotification} />}
              {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} thm={thm} showNotification={showNotification} authUser={authUser} showConfirm={showConfirm} />}
              {activeTab === 'debts' && <DebtsView transactions={transactions} setTransactions={setTransactions} thm={thm} showConfirm={showConfirm} authUser={authUser} />}
              {activeTab === 'inventory' && authUser.role === 'owner' && <InventoryView products={products} setProducts={setProducts} thm={thm} showConfirm={showConfirm} showNotification={showNotification} />}
              {activeTab === 'history' && <HistoryView transactions={transactions} setTransactions={setTransactions} settings={settings} thm={thm} authUser={authUser} showConfirm={showConfirm} showNotification={showNotification} />}
              {activeTab === 'settings' && authUser.role === 'owner' && <SettingsView settings={settings} setSettings={setSettings} themeColors={themeColors} thm={thm} showNotification={showNotification} />}
            </div>
            
            <div className="py-6 text-center text-xs font-bold text-gray-400 print:hidden w-full border-t border-gray-200 mt-auto bg-gray-50">
              © 2026 M. Ghozzin Dirham | All Right Reserved
            </div>
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
      onLogin({ role: 'owner', username }, 'dashboard');
    } else if (username === 'akunkasir1727' && password === '1sampai1727') {
      onLogin({ role: 'cashier', username }, 'pos');
    } else {
      setError('Sandi atau username salah.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-200 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto ${thm.light} rounded-2xl flex items-center justify-center mb-4 border border-gray-100`}>
            <ShoppingCart size={32} className={thm.text} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">KasirGo</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Sistem Manajemen Retail Modern</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} transition-all font-medium text-gray-700`}
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
                className={`w-full p-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} transition-all font-medium text-gray-700`}
                placeholder="Masukkan sandi"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors bg-white px-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 border border-red-100 rounded-xl animate-scaleIn">{error}</p>}
          <button 
            type="submit" 
            className={`w-full mt-2 ${thm.primary} ${thm.hover} text-white font-bold py-3.5 rounded-xl shadow-md transition-all transform active:scale-95`}
          >
            Masuk Sistem
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-xs font-bold text-gray-400">
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

  // Chart Data Generation (Last 7 days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayTotal = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate >= d && tDate < nextD;
        })
        .reduce((sum, t) => sum + t.total, 0);

      data.push({
        day: d.toLocaleDateString('id-ID', { weekday: 'long' }),
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        total: dayTotal
      });
    }
    return data;
  }, [transactions]);

  const maxChartVal = Math.max(...chartData.map(d => d.total), 1); // Hindari pembagian 0

  return (
    <div className="p-6 md:p-8 animate-scaleIn print:hidden">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-6">Dashboard & Analitik</h2>
      
      {/* 4 Cards Grid Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all group">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${thm.light} ${thm.text}`}><Calendar size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Omset Hari Ini</h3>
          </div>
          <div className="text-2xl font-black text-gray-800 mb-3 group-hover:scale-105 transform origin-left transition-transform">Rp {todayStats.revenue.toLocaleString('id-ID')}</div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">Laba: Rp {todayStats.margin.toLocaleString('id-ID')}</span>
            <span className="font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">{todayStats.items} Item Terjual</span>
          </div>
        </div>

        {/* Card 2: Bulan Ini */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all group">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${thm.light} ${thm.text}`}><TrendingUp size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Omset Bulan Ini</h3>
          </div>
          <div className="text-2xl font-black text-gray-800 mb-3 group-hover:scale-105 transform origin-left transition-transform">Rp {monthStats.revenue.toLocaleString('id-ID')}</div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">Laba: Rp {monthStats.margin.toLocaleString('id-ID')}</span>
            <span className="font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">{monthStats.items} Item Terjual</span>
          </div>
        </div>

        {/* Card 3: Transaksi Hari ini */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all group">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl bg-blue-50 text-blue-500`}><ShoppingCart size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Transaksi Hari Ini</h3>
          </div>
          <div className="text-2xl font-black text-gray-800 mb-3 group-hover:scale-105 transform origin-left transition-transform">{todayStats.count} <span className="text-lg font-bold text-gray-400">Nota</span></div>
          <div className="flex text-xs">
             <span className="font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">Rata-rata: Rp {todayStats.count > 0 ? Math.round(todayStats.revenue / todayStats.count).toLocaleString('id-ID') : 0} / nota</span>
          </div>
        </div>

        {/* Card 4: Piutang */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-200 hover:shadow-md transition-all group">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl bg-red-50 text-red-500`}><BookOpen size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Piutang</h3>
          </div>
          <div className="text-2xl font-black text-red-600 mb-3 group-hover:scale-105 transform origin-left transition-transform">Rp {totalDebtAmount.toLocaleString('id-ID')}</div>
          <div className="flex text-xs">
            <span className="font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">{unpaidDebts.length} Kasbon Menggantung</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid (Chart & Warnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center"><TrendingUp size={18} className="mr-2 text-gray-400"/> Grafik Pendapatan (7 Hari Terakhir)</h3>
          <div className="space-y-5">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex items-center group">
                <div className="w-20 flex flex-col justify-center">
                  <span className="text-sm font-bold text-gray-700">{data.day}</span>
                  <span className="text-[11px] font-bold text-gray-400">{data.date}</span>
                </div>
                <div className="flex-1 mx-4 bg-gray-50 rounded-full h-5 overflow-hidden flex items-center border border-gray-100 shadow-inner">
                  <div 
                    className={`h-full ${thm.primary} rounded-full transition-all duration-1000 ease-out relative group-hover:opacity-80`} 
                    style={{ width: `${data.total === 0 ? 0 : Math.max((data.total / maxChartVal) * 100, 2)}%` }}
                  />
                </div>
                <span className="w-28 text-right text-sm font-black text-gray-700">Rp {data.total.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Warnings Section */}
        <div className="space-y-6">
          
          {/* Low Stock Warning */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider"><Package size={18} className="mr-2 text-orange-500"/> Stok Menipis</h3>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? <p className="text-gray-400 text-sm font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">Semua stok aman terkendali.</p> : 
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="font-bold text-gray-700 text-sm">{p.name}</span>
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-lg border border-red-200">Sisa {p.stock}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Unpaid Debt Warning */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider"><Users size={18} className="mr-2 text-red-500"/> Kasbon Terbaru</h3>
            <div className="space-y-3">
              {unpaidDebts.length === 0 ? <p className="text-gray-400 text-sm font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">Tidak ada piutang pelanggan.</p> : 
                unpaidDebts.slice(0,4).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <div className="font-bold text-gray-700 text-sm">{t.customerName}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{new Date(t.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</div>
                    </div>
                    <span className="font-black text-red-500 text-sm">Rp {t.total.toLocaleString('id-ID')}</span>
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

function POSView({ products, setProducts, transactions, setTransactions, customers, settings, thm, authUser, showNotification }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Derive categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Semua', ...Array.from(cats).filter(Boolean)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return showNotification('Stok Habis!', `Produk "${product.name}" sudah habis.`, 'error');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          showNotification('Batas Stok', `Maksimal stok "${product.name}" tercapai.`, 'error');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stock) {
           showNotification('Batas Stok', `Stok tidak mencukupi.`, 'error');
           return item;
        }
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
    <div className="flex h-full print:block print:h-auto">
      {/* Product List Section */}
      <div className="flex-1 flex flex-col bg-gray-50 print:hidden px-4 pt-4 space-y-4 h-full">
        <div className="bg-white shadow-sm rounded-2xl p-2 flex items-center space-x-2 border border-gray-200 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atau barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-2.5 rounded-xl border-none bg-transparent focus:outline-none font-medium text-gray-700"
            />
            <button className={`absolute right-2 top-1.5 p-1.5 rounded-lg ${thm.light} ${thm.text} hover:opacity-80 transition`}>
              <ScanLine size={18} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar shrink-0 py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${selectedCategory === cat ? `${thm.primary} text-white border-transparent` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-6 pr-1">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group" onClick={() => addToCart(product)}>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{product.name}</span>
                <span className="text-xs text-gray-500 mt-1 font-medium">Kategori: {product.category || '-'} | Sisa: <span className={`font-bold ${product.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>{product.stock}</span></span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-black text-lg ${thm.text}`}>Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className={`p-2 rounded-xl ${thm.light} ${thm.text} group-hover:scale-110 transition-transform`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400 font-bold text-sm">Produk tidak ditemukan.</div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[360px] bg-white flex flex-col shadow-[-4px_0_15px_rgb(0,0,0,0.03)] z-20 print:hidden border-l border-gray-200 shrink-0">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Keranjang</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-red-500 text-xs font-bold flex items-center hover:bg-red-50 border border-transparent hover:border-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <Trash2 size={14} className="mr-1"/> Kosongkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-sm">Belum ada pesanan.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2">{item.name}</h4>
                  <div className={`text-sm font-black ${thm.text} whitespace-nowrap`}>Rp {(item.sellPrice * item.qty).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex justify-between items-center">
                   <div className="text-xs text-gray-400 font-medium">Rp {item.sellPrice.toLocaleString('id-ID')} / item</div>
                   <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                    <button onClick={() => updateCartQty(item.id, -1)} className="p-1 rounded bg-white shadow-sm text-gray-500 hover:text-red-500 border border-gray-200"><Minus size={14}/></button>
                    <span className="font-bold w-6 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="p-1 rounded bg-white shadow-sm text-gray-500 hover:text-green-500 border border-gray-200"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between mb-3 text-sm">
            <span className="font-bold text-gray-500">Total Item</span>
            <span className="font-black text-gray-800">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div className="flex justify-between mb-5">
            <span className="font-black text-xl text-gray-800">Total</span>
            <span className={`font-black text-2xl ${thm.text}`}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-3.5 rounded-xl font-black text-lg text-white shadow-md transition-all active:scale-95 ${cart.length === 0 ? 'bg-gray-300 shadow-none cursor-not-allowed' : `${thm.primary} ${thm.hover}`}`}
          >
            Pilih Pembayaran
          </button>
        </div>
      </div>

      {showCheckout && <CheckoutModal subtotal={subtotal} customers={customers} onClose={() => setShowCheckout(false)} onProcess={processCheckout} thm={thm} showNotification={showNotification} />}
      {showReceipt && <ReceiptModal transaction={lastTransaction} settings={settings} onClose={() => setShowReceipt(false)} thm={thm} />}
    </div>
  );
}

function CheckoutModal({ subtotal, customers, onClose, onProcess, thm, showNotification }) {
  const [cash, setCash] = useState('');
  const [method, setMethod] = useState('Tunai');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleProcess = () => {
    if (method === 'Tunai') {
      const cashVal = parseInt(cash.replace(/\D/g, '')) || 0;
      if (cashVal < subtotal) return showNotification('Uang Kurang!', 'Nominal uang tunai tidak mencukupi tagihan.', 'error');
      onProcess({ method, cash: cashVal, change: cashVal - subtotal, customerName: '-' });
    } else if (method === 'QRIS') {
      onProcess({ method, cash: subtotal, change: 0, customerName: '-' });
    } else if (method === 'Kasbon') {
      if (!selectedCustomer) return showNotification('Pilih Pelanggan!', 'Anda harus memilih pelanggan untuk metode Kasbon.', 'error');
      onProcess({ method, cash: 0, change: 0, customerName: selectedCustomer });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 print:hidden animate-scaleIn">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
        <div className={`p-6 ${thm.primary} text-white text-center`}>
          <h3 className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Total Tagihan</h3>
          <div className="text-4xl font-black tracking-tight">Rp {subtotal.toLocaleString('id-ID')}</div>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {['Tunai', 'QRIS', 'Kasbon'].map(m => (
                <button 
                  key={m} onClick={() => setMethod(m)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${method === m ? `${thm.primary} text-white border-transparent shadow-md` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {method === 'Tunai' && (
            <div className="animate-scaleIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Terima Uang</label>
              <input 
                type="text" autoFocus value={cash}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCash(val ? parseInt(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className={`w-full text-right text-2xl font-black p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} text-gray-800 transition-all`}
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                 <button onClick={() => setCash(subtotal.toLocaleString('id-ID'))} className="py-2.5 rounded-lg font-bold text-sm bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors">Uang Pas</button>
                 <button onClick={() => setCash('100.000')} className="py-2.5 rounded-lg font-bold text-sm bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Rp 100.000</button>
              </div>
            </div>
          )}

          {method === 'Kasbon' && (
            <div className="animate-scaleIn">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Pelanggan (Wajib)</label>
               <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-700`}>
                 <option value="">-- Pilih Nama --</option>
                 {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>)}
               </select>
            </div>
          )}

          <div className="flex space-x-3 pt-3 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
            <button onClick={handleProcess} className={`flex-1 py-3 ${thm.primary} ${thm.hover} text-white font-black rounded-xl shadow-md transition-transform active:scale-95`}>Proses Bayar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ transaction, settings, onClose, thm }) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 print:p-0 print:bg-white print:block animate-scaleIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none border border-gray-200 overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 print:hidden">
          <h3 className="font-black text-gray-800">Preview Struk</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto print:p-0 font-mono text-sm text-gray-800 bg-white">
          <div className="text-center mb-5">
            {settings.receiptLogo && <img src={settings.receiptLogo} alt="Logo Toko" className="h-16 mx-auto mb-3 object-contain" />}
            <h2 className="text-xl font-black uppercase tracking-widest">{settings.storeName}</h2>
            <p className="text-xs text-gray-500 whitespace-pre-wrap mt-1 font-sans">{settings.address}</p>
            <p className="text-xs text-gray-500 font-sans">{settings.phone}</p>
          </div>
          
          <div className="border-b border-dashed border-gray-300 pb-2 mb-2 text-xs space-y-1">
            <div className="flex justify-between"><span>No:</span><span className="font-bold">{transaction.id}</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>{new Date(transaction.date).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span>{transaction.cashier}</span></div>
            <div className="flex justify-between"><span>Metode:</span><span className="font-bold">{transaction.paymentMethod}</span></div>
            {transaction.paymentMethod === 'Kasbon' && <div className="flex justify-between text-red-500"><span>Pelanggan:</span><span className="font-bold">{transaction.customerName}</span></div>}
          </div>

          <div className="border-b border-dashed border-gray-300 pb-2 mb-2 space-y-1.5">
            {transaction.items.map(item => (
              <div key={item.id}>
                <div className="font-bold">{item.name}</div>
                <div className="flex justify-between text-xs mt-0.5 text-gray-600">
                  <span>{item.qty} x {item.sellPrice.toLocaleString('id-ID')}</span>
                  <span className="font-bold text-gray-800">{(item.qty * item.sellPrice).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-6 text-sm">
            <div className="flex justify-between text-base font-black mt-1 pt-1">
              <span>TOTAL</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && (
              <>
                <div className="flex justify-between font-medium text-gray-500"><span>Tunai</span><span>Rp {transaction.cash.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between font-medium text-gray-500"><span>Kembali</span><span>Rp {transaction.change.toLocaleString('id-ID')}</span></div>
              </>
            )}
            {transaction.paymentMethod === 'Kasbon' && (
              <div className="text-center mt-3 bg-gray-100 p-1.5 rounded border border-gray-200 text-xs font-bold uppercase tracking-wider">Status: Belum Lunas</div>
            )}
          </div>

          <div className="text-center text-xs font-bold text-gray-400 italic whitespace-pre-wrap mt-4">
            {settings.receiptFooter || '*** Terima Kasih ***'}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex space-x-2 print:hidden">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition shadow-sm">Selesai</button>
          <button onClick={() => window.print()} className={`flex-1 flex items-center justify-center py-3 ${thm.primary} ${thm.hover} text-white font-bold rounded-xl transition shadow-md`}>
            <Printer size={18} className="mr-2" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomersView({ customers, setCustomers, thm, showNotification, authUser, showConfirm }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newCust = { 
      id: editingCust ? editingCust.id : 'CUST-'+Date.now(), 
      name: data.get('name'), 
      phone: data.get('phone'), 
      address: data.get('address') 
    };

    if (editingCust) {
      setCustomers(customers.map(c => c.id === editingCust.id ? newCust : c));
      showNotification('Berhasil', 'Data pelanggan diperbarui.', 'success');
    } else {
      setCustomers([newCust, ...customers]);
      showNotification('Berhasil', 'Pelanggan baru ditambahkan.', 'success');
    }
    setShowAdd(false);
    setEditingCust(null);
  };

  const handleDelete = (id) => {
    showConfirm('Hapus Pelanggan', 'Pelanggan ini akan dihapus dari data?', () => {
      setCustomers(customers.filter(c => c.id !== id));
      showNotification('Berhasil', 'Pelanggan dihapus.', 'success');
    });
  };

  return (
    <div className="p-6 md:p-8 animate-scaleIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Data Pelanggan</h2>
        <button onClick={() => { setEditingCust(null); setShowAdd(true); }} className={`${thm.primary} ${thm.hover} text-white px-4 py-2.5 rounded-xl flex items-center font-bold shadow-md transition-transform active:scale-95`}><Plus size={18} className="mr-2"/> Tambah</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-4">Nama Pelanggan</th><th className="p-4">No. HP</th><th className="p-4">Alamat</th>{authUser.role === 'owner' && <th className="p-4 text-center">Aksi</th>}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{c.name}</td>
                <td className="p-4 font-medium text-gray-600">{c.phone}</td>
                <td className="p-4 text-gray-500 text-sm whitespace-normal min-w-[200px]">{c.address}</td>
                {authUser.role === 'owner' && (
                  <td className="p-4 text-center flex justify-center space-x-2">
                    <button onClick={() => { setEditingCust(c); setShowAdd(true); }} className={`p-1.5 bg-white border border-gray-200 rounded-lg ${thm.text} hover:bg-gray-50 transition shadow-sm`}><Edit size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition shadow-sm"><Trash2 size={16}/></button>
                  </td>
                )}
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={authUser.role === 'owner' ? "4" : "3"} className="p-8 text-center text-gray-400 font-bold text-sm">Belum ada data pelanggan.</td></tr>}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 animate-scaleIn">
            <h3 className="font-black text-xl text-gray-800 mb-5">{editingCust ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required name="name" defaultValue={editingCust?.name} placeholder="Nama Lengkap" className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-700`} />
              <input required name="phone" defaultValue={editingCust?.phone} placeholder="No. WhatsApp" className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} />
              <textarea name="address" defaultValue={editingCust?.address} placeholder="Alamat Lengkap" className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} rows="3" />
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-100 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                <button type="submit" className={`flex-1 py-3 ${thm.primary} ${thm.hover} text-white font-black rounded-xl shadow-md`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsView({ transactions, setTransactions, thm, showConfirm, authUser }) {
  const debts = transactions.filter(t => t.paymentMethod === 'Kasbon');
  const payDebt = (id) => {
    showConfirm('Pelunasan Kasbon', 'Tandai hutang ini sebagai LUNAS?', () => {
      setTransactions(transactions.map(t => t.id === id ? { ...t, paymentStatus: 'Lunas' } : t));
    });
  };
  return (
    <div className="p-6 md:p-8 animate-scaleIn">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-6">Buku Kasbon / Piutang</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-4">Tanggal</th><th className="p-4">Pelanggan</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {debts.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-500">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                <td className="p-4 font-bold text-gray-800">{d.customerName}</td>
                <td className="p-4 font-black text-gray-800">Rp {d.total.toLocaleString('id-ID')}</td>
                <td className="p-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${d.paymentStatus === 'Lunas' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>{d.paymentStatus}</span></td>
                <td className="p-4 text-center">
                  {d.paymentStatus !== 'Lunas' && <button onClick={() => payDebt(d.id)} className={`px-4 py-1.5 ${thm.primary} ${thm.hover} text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-transform`}>Lunas!</button>}
                </td>
              </tr>
            ))}
            {debts.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold text-sm">Tidak ada catatan kasbon.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryView({ products, setProducts, thm, showConfirm, showNotification }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const handleDelete = (id) => {
    showConfirm('Hapus Produk', 'Yakin ingin menghapus produk ini secara permanen?', () => {
      setProducts(products.filter(p => p.id !== id));
      showNotification('Berhasil', 'Produk berhasil dihapus.', 'success');
    });
  };

  const exportCSV = () => {
    let csv = 'ID,Barcode,Nama Produk,Kategori,Stok,Modal Dus,Modal Satuan,Harga Jual\n';
    products.forEach(p => {
      csv += `"${p.id}","${p.barcode || ''}","${p.name}","${p.category}","${p.stock}","${p.buyPriceBox}","${p.buyPriceUnit}","${p.sellPrice}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Inventaris.csv`;
    link.click();
    showNotification('Berhasil', 'Data inventaris berhasil di-export ke CSV.', 'success');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prod = {
      id: editingProd ? editingProd.id : 'PRD-' + Date.now(),
      barcode: fd.get('barcode'),
      name: fd.get('name'),
      category: fd.get('category'),
      stock: parseInt(fd.get('stock')),
      buyPriceBox: parseInt(fd.get('buyPriceBox')),
      buyPriceUnit: parseInt(fd.get('buyPriceUnit')),
      sellPrice: parseInt(fd.get('sellPrice')),
    };

    if (editingProd) {
      setProducts(products.map(p => p.id === prod.id ? prod : p));
      showNotification('Berhasil', 'Produk berhasil diubah.', 'success');
    } else {
      setProducts([prod, ...products]);
      showNotification('Berhasil', 'Produk baru ditambahkan.', 'success');
    }
    setShowAdd(false);
    setEditingProd(null);
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showNotification('Simulasi Import', 'File spreadsheet CSV berhasil dibaca. Fitur ini siap berfungsi di mode live.', 'success');
  };

  return (
    <div className="p-6 md:p-8 animate-scaleIn print:hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Manajemen Inventaris</h2>
        <div className="flex space-x-3">
          <button onClick={exportCSV} className="cursor-pointer bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl flex items-center hover:bg-gray-50 transition shadow-sm font-bold text-sm">
            <Download size={18} className="mr-2"/> Export Data (.csv)
          </button>
          <button 
            onClick={() => { setEditingProd(null); setShowAdd(true); }}
            className={`${thm.primary} ${thm.hover} text-white px-4 py-2.5 rounded-xl flex items-center shadow-md transition-transform active:scale-95 font-bold text-sm`}
          >
            <Plus size={18} className="mr-2"/> Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="p-4">Kode/Barcode</th>
              <th className="p-4">Nama Produk</th>
              <th className="p-4 text-center">Stok</th>
              <th className="p-4">Harga Beli</th>
              <th className="p-4">Harga Jual</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-gray-500 text-sm">{p.barcode || '-'}</td>
                <td className="p-4 font-bold text-gray-800">{p.name} <span className="block text-[10px] font-bold text-gray-400 mt-0.5 uppercase">{p.category}</span></td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${p.stock <= 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-500 text-sm">Rp {p.buyPriceUnit.toLocaleString('id-ID')}</td>
                <td className="p-4 font-black text-gray-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                <td className="p-4 text-center flex justify-center space-x-2">
                  <button onClick={() => { setEditingProd(p); setShowAdd(true); }} className={`p-1.5 bg-white border border-gray-200 rounded-lg ${thm.text} hover:bg-gray-50 transition shadow-sm`}><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition shadow-sm"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-bold text-sm">Belum ada produk.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800">{editingProd ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kode Barcode</label>
                  <input name="barcode" defaultValue={editingProd?.barcode} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-mono text-gray-700`} placeholder="Scan/Ketik..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Produk</label>
                  <input required name="name" defaultValue={editingProd?.name} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-700`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori</label>
                  <input required name="category" defaultValue={editingProd?.category} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stok Awal</label>
                  <input required type="number" name="stock" defaultValue={editingProd?.stock} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Modal (Per Dus)</label>
                  <input required type="number" name="buyPriceBox" defaultValue={editingProd?.buyPriceBox} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Modal (Satuan)</label>
                  <input required type="number" name="buyPriceUnit" defaultValue={editingProd?.buyPriceUnit} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-700`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Harga Jual</label>
                <input required type="number" name="sellPrice" defaultValue={editingProd?.sellPrice} className={`w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-black text-gray-800`} />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 bg-gray-100 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                <button type="submit" className={`px-5 py-2.5 ${thm.primary} ${thm.hover} text-white font-black rounded-xl shadow-md`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryView({ transactions, setTransactions, settings, thm, showConfirm, showNotification, authUser }) {
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Filter Tanggal
  const today = new Date().toISOString().split('T')[0];
  const threeYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(threeYearsAgo);
  const [endDate, setEndDate] = useState(today);

  const filteredTx = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
  });

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showNotification('Simulasi Import', 'Data Riwayat Transaksi berhasil di-import.', 'success');
  };

  const handleDelete = (id) => {
    showConfirm('Hapus Transaksi', 'Catatan ini akan dihapus secara permanen. Lanjutkan?', () => {
      setTransactions(transactions.filter(t => t.id !== id));
      showNotification('Dihapus', 'Riwayat transaksi berhasil dihapus.', 'success');
    });
  };

  const downloadExcel = () => {
    let csv = 'Tanggal,ID Transaksi,Metode Pembayaran,Status Pembayaran,Nama Pelanggan,Kasir,Total Penjualan,Detail Item Terjual\n';
    filteredTx.forEach(tx => {
      const items = tx.items.map(i => `${i.name} (${i.qty}x)`).join(' | ');
      csv += `"${new Date(tx.date).toLocaleString('id-ID')}","${tx.id}","${tx.paymentMethod}","${tx.paymentStatus}","${tx.customerName || '-'}","${tx.cashier}","${tx.total}","${items}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Transaksi_${startDate}_sampai_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="p-6 md:p-8 animate-scaleIn">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-sm font-bold text-gray-400 mt-1">Ditemukan {filteredTx.length} nota</p>
        </div>
        
        {authUser.role === 'owner' && (
          <label className={`cursor-pointer flex items-center px-4 py-2.5 ${thm.primary} ${thm.hover} text-white font-bold rounded-xl shadow-md transition-transform active:scale-95`}>
            <Upload size={18} className="mr-2"/> Import Data (.csv)
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </label>
        )}
      </div>

      {/* Filter Section */}
      <div className="flex items-center space-x-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 max-w-fit">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Dari:</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 ${thm.ring} focus:border-transparent outline-none p-2 font-bold`} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Sampai:</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 ${thm.ring} focus:border-transparent outline-none p-2 font-bold`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-4">Waktu</th><th className="p-4">ID Transaksi</th><th className="p-4">Pembayaran</th><th className="p-4">Total</th><th className="p-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTx.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-sm text-gray-500">{new Date(tx.date).toLocaleString('id-ID')}</td>
                <td className="p-4 font-bold text-gray-800 text-sm">{tx.id}</td>
                <td className="p-4">
                  <div className="font-bold text-gray-600 text-sm flex items-center space-x-2">
                    <span>{tx.paymentMethod}</span>
                    {tx.paymentMethod === 'Kasbon' && (
                      <span className={`px-2 py-0.5 text-[10px] uppercase rounded-md border ${tx.paymentStatus === 'Lunas' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>{tx.paymentStatus}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-black text-gray-800">Rp {tx.total.toLocaleString('id-ID')}</td>
                <td className="p-4 text-center flex justify-center space-x-2">
                  <button onClick={() => setSelectedTx(tx)} className={`p-2 bg-white border border-gray-200 rounded-lg ${thm.text} hover:bg-gray-50 transition shadow-sm`}><FileText size={16}/></button>
                  {authUser.role === 'owner' && (
                    <button onClick={() => handleDelete(tx.id)} className="p-2 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition shadow-sm"><Trash2 size={16}/></button>
                  )}
                </td>
              </tr>
            ))}
            {filteredTx.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold text-sm">Tidak ada transaksi di rentang tanggal ini.</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedTx && <ReceiptModal transaction={selectedTx} settings={settings} onClose={() => setSelectedTx(null)} thm={thm} />}
    </div>
  );
}

function SettingsView({ settings, setSettings, themeColors, thm, showNotification }) {
  const [formData, setFormData] = useState(settings);
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setSettings(formData); 
    showNotification('Tersimpan', 'Pengaturan toko berhasil diperbarui.', 'success'); 
  };
  return (
    <div className="p-6 md:p-8 max-w-3xl animate-scaleIn">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-6">Pengaturan Toko</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Profil Usaha</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-800`} placeholder="Nama Toko" />
            <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-800`} placeholder="No WhatsApp" />
            <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`col-span-2 w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-800`} placeholder="Alamat (Untuk Struk)" rows="2" />
            <input required value={formData.cashierName} onChange={e => setFormData({...formData, cashierName: e.target.value})} className={`col-span-2 w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-800`} placeholder="Nama Admin Default" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Printer Struk</h3>
          <div className="grid grid-cols-2 gap-4">
             <select value={formData.printerType} onChange={e => setFormData({...formData, printerType: e.target.value})} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-700`}>
               <option value="bluetooth">Bluetooth Thermal</option>
               <option value="usb">USB Printer</option>
             </select>
             <select value={formData.paperSize} onChange={e => setFormData({...formData, paperSize: e.target.value})} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-bold text-gray-700`}>
               <option value="58mm">Kertas 58mm</option>
               <option value="80mm">Kertas 80mm</option>
             </select>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Logo & Footer Struk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Upload Logo (Opsional)</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => setFormData({...formData, receiptLogo: event.target.result});
                  reader.readAsDataURL(file);
                }
              }} className={`w-full p-2 bg-white border border-gray-200 rounded-xl ${thm.ring} text-sm`} />
              {formData.receiptLogo && <button type="button" onClick={() => setFormData({...formData, receiptLogo: null})} className="text-xs text-red-500 font-bold mt-2">Hapus Logo</button>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Teks Pesan Footer</label>
              <textarea value={formData.receiptFooter || ''} onChange={e => setFormData({...formData, receiptFooter: e.target.value})} className={`w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${thm.ring} font-medium text-gray-800`} placeholder="Misal: Terima kasih telah berbelanja!" rows="2" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Warna Tema UI</h3>
          <div className="flex space-x-3">
            {Object.keys(themeColors).map(color => (
              <button type="button" key={color} onClick={() => setFormData({...formData, themeColor: color})} className={`w-12 h-12 rounded-xl ${themeColors[color].primary} flex items-center justify-center transform transition-all hover:scale-105 shadow-sm ${formData.themeColor === color ? 'ring-4 ring-offset-2 ring-gray-200 scale-105' : ''}`}>
                {formData.themeColor === color && <CheckCircle className="text-white" size={20} />}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className={`w-full py-3.5 ${thm.primary} ${thm.hover} text-white font-black rounded-xl shadow-md hover:-translate-y-0.5 transform transition-all active:scale-95`}>Simpan Pengaturan</button>
      </form>
    </div>
  );
}