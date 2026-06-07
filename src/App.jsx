import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Home, ShoppingCart, Package, FileText, Settings as SettingsIcon, 
  LogOut, Plus, Minus, Trash2, Search, ScanLine, Printer, Download,
  TrendingUp, CheckCircle, Upload, Users, BookOpen, CreditCard, Wallet, QrCode
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

// --- CUSTOM ANIMATIONS STYLE ---
const CustomStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
    .animate-popIn { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.15); }
  `}</style>
);

export default function App() {
  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('pos_logged_in', false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [products, setProducts] = useLocalStorage('pos_products', [
    { id: '1', name: 'Nasi Gudeg Spesial', stock: 50, buyPriceBox: 100000, buyPriceUnit: 10000, sellPrice: 15000, category: 'Makanan' },
    { id: '2', name: 'Es Teh Manis', stock: 100, buyPriceBox: 20000, buyPriceUnit: 2000, sellPrice: 5000, category: 'Minuman' },
    { id: '3', name: 'Keripik Singkong', stock: 5, buyPriceBox: 50000, buyPriceUnit: 5000, sellPrice: 8000, category: 'Cemilan' },
    { id: '4', name: 'Soto Ayam', stock: 25, buyPriceBox: 120000, buyPriceUnit: 12000, sellPrice: 18000, category: 'Makanan' },
  ]);
  
  const [customers, setCustomers] = useLocalStorage('pos_customers', [
    { id: 'CUST-0', name: 'Pelanggan Umum', phone: '-', address: '-' }
  ]);

  const [transactions, setTransactions] = useLocalStorage('pos_transactions', []);
  const [settings, setSettings] = useLocalStorage('pos_settings', {
    storeName: 'Toko KasirGo',
    address: 'Jl. Merdeka No. 45, Jakarta',
    phone: '081234567890',
    cashierName: 'Admin Utama',
    themeColor: 'green',
    printerType: 'Bluetooth',
    paperSize: '58mm'
  });

  // --- THEME CONFIG ---
  const themeColors = {
    green: { primary: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', border: 'border-green-600', light: 'bg-green-50', gradient: 'from-green-600 to-green-400' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50', gradient: 'from-blue-600 to-blue-400' },
    red: { primary: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', border: 'border-red-600', light: 'bg-red-50', gradient: 'from-red-600 to-red-400' },
    dark: { primary: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-gray-800', border: 'border-gray-800', light: 'bg-gray-200', gradient: 'from-gray-800 to-gray-600' },
    caramel: { primary: 'bg-[#867233]', hover: 'hover:bg-[#6b5b29]', text: 'text-[#867233]', border: 'border-[#867233]', light: 'bg-[#f7f4ec]', gradient: 'from-[#867233] to-[#b3994c]' },
  };
  const thm = themeColors[settings.themeColor] || themeColors.green;

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPERS ---
  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // --- RENDERERS ---
  if (!isLoggedIn) {
    return (
      <>
        <CustomStyles />
        <LoginScreen onLogin={() => setIsLoggedIn(true)} thm={thm} />
      </>
    );
  }

  return (
    <>
      <CustomStyles />
      <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className={`flex items-center justify-between p-5 bg-gradient-to-r ${thm.gradient} text-white`}>
            <h2 className={`text-xl font-bold`}>KasirGo Admin</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition"><X size={20} /></button>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'dashboard', icon: <Home size={20}/>, label: 'Dashboard' },
              { id: 'pos', icon: <ShoppingCart size={20}/>, label: 'Mesin Kasir (POS)' },
              { id: 'inventory', icon: <Package size={20}/>, label: 'Produk & Inventaris' },
              { id: 'customers', icon: <Users size={20}/>, label: 'Data Pelanggan' },
              { id: 'debts', icon: <BookOpen size={20}/>, label: 'Buku Kasbon / Hutang' },
              { id: 'history', icon: <FileText size={20}/>, label: 'Riwayat Transaksi' },
              { id: 'settings', icon: <SettingsIcon size={20}/>, label: 'Pengaturan Toko' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id ? `${thm.primary} text-white shadow-md transform scale-[1.02]` : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t bg-white">
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
            >
              <LogOut size={20} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>

        {/* Overlay when sidebar open */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden print:bg-white">
          {/* Header */}
          <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 z-10 print:hidden">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors bg-gray-50 border border-gray-100">
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${thm.gradient} hidden sm:block tracking-tight`}>
                {settings.storeName}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100">
                <p className="text-sm font-bold text-gray-800">{formatTime(currentTime)}</p>
                <p className="text-xs text-gray-500 font-medium">{formatDate(currentTime)}</p>
              </div>
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${thm.gradient} flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white`}>
                {settings.cashierName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Main View Area */}
          <main className="flex-1 overflow-auto bg-gray-50/50 print:bg-white print:overflow-visible relative">
            <div className="min-h-[calc(100vh-140px)]">
              {activeTab === 'dashboard' && <DashboardView transactions={transactions} products={products} customers={customers} thm={thm} />}
              {activeTab === 'pos' && <POSView products={products} setProducts={setProducts} customers={customers} transactions={transactions} setTransactions={setTransactions} settings={settings} thm={thm} />}
              {activeTab === 'inventory' && <InventoryView products={products} setProducts={setProducts} thm={thm} />}
              {activeTab === 'customers' && <CustomerView customers={customers} setCustomers={setCustomers} thm={thm} />}
              {activeTab === 'debts' && <DebtView transactions={transactions} setTransactions={setTransactions} customers={customers} thm={thm} />}
              {activeTab === 'history' && <HistoryView transactions={transactions} settings={settings} thm={thm} />}
              {activeTab === 'settings' && <SettingsView settings={settings} setSettings={setSettings} themeColors={themeColors} thm={thm} />}
            </div>
            
            {/* COPYRIGHT FOOTER */}
            <div className="py-8 text-center text-xs font-bold text-gray-400 print:hidden animate-fadeInUp">
              © 2026 M. Ghozzin Dirham | All Right Reserved
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ==========================================
// 1. LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin, thm }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'adminkasir1727' && password === '1sampai1727') {
      onLogin();
    } else {
      setError('Username atau sandi salah! (Petunjuk: adminkasir1727 / 1sampai1727)');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md animate-popIn">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto bg-gradient-to-tr ${thm.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${thm.primary}/30 transform -translate-y-4`}>
            <ShoppingCart size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">KasirGo</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Sistem Manajemen Retail Pintar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Username / Email (Spreadsheet)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium animate-pulse text-center bg-red-50 p-3 rounded-xl">{error}</p>}
          <button 
            type="submit" 
            className={`w-full bg-gradient-to-r ${thm.gradient} hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-${thm.primary}/30 transition-all transform active:scale-95 text-lg`}
          >
            Masuk Sekarang
          </button>
        </form>
        <p className="mt-8 text-center text-xs font-semibold text-gray-400">
          Cloud Sync Ready • Vercel Deployed<br/><br/>
          © 2026 M. Ghozzin Dirham | All Right Reserved
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW (With New Features)
// ==========================================
function DashboardView({ transactions, products, customers, thm }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const calcStats = (filterDateFn) => {
    return transactions.filter(t => filterDateFn(new Date(t.date))).reduce((acc, curr) => {
      acc.revenue += curr.total;
      acc.items += curr.items.reduce((sum, item) => sum + item.qty, 0);
      acc.margin += curr.items.reduce((sum, item) => sum + ((item.sellPrice - item.buyPriceUnit) * item.qty), 0);
      return acc;
    }, { revenue: 0, items: 0, margin: 0 });
  };

  const todayStats = calcStats((d) => d >= today);
  const monthStats = calcStats((d) => d >= startOfMonth);

  // Hitung Kasbon / Hutang Belum Lunas Keseluruhan
  const totalUnpaid = transactions
    .filter(t => t.paymentMethod === 'Kasbon' && t.status === 'Belum Lunas')
    .reduce((sum, t) => sum + t.total, 0);

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
        day: d.toLocaleDateString('id-ID', { weekday: 'short' }), 
        total: dayTotal 
      });
    }
    return data;
  }, [transactions]);

  const maxChartVal = Math.max(...chartData.map(d => d.total), 1);

  // LOGIKA TAMBAHAN: Stok Menipis & Tagihan Belum Lunas Per Pelanggan
  const lowStockProducts = products.filter(p => p.stock <= 10).sort((a, b) => a.stock - b.stock);
  
  const unpaidDebtsList = transactions
    .filter(t => t.paymentMethod === 'Kasbon' && t.status === 'Belum Lunas')
    .reduce((acc, t) => {
      const existing = acc.find(x => x.customerId === t.customerId);
      if (existing) {
        existing.total += t.total;
      } else {
        const cust = customers.find(c => c.id === t.customerId);
        acc.push({ customerId: t.customerId, customerName: t.customerName, total: t.total, phone: cust?.phone || '-' });
      }
      return acc;
    }, []);

  return (
    <div className="p-6 animate-fadeInUp">
      <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Ringkasan Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 hover-lift relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${thm.gradient} opacity-10 rounded-bl-full`} />
          <div className="flex items-center space-x-3 mb-4 relative">
            <div className={`p-3 rounded-2xl ${thm.light} ${thm.text}`}><TrendingUp size={24} /></div>
            <h3 className="text-lg font-bold text-gray-700">Hari Ini</h3>
          </div>
          <div className="space-y-3 relative">
            <div><p className="text-sm text-gray-500 font-medium">Penjualan</p><p className="text-2xl font-black text-gray-800">Rp {todayStats.revenue.toLocaleString('id-ID')}</p></div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl"><span className="text-gray-500 text-sm">Barang Keluar</span><span className="font-bold text-gray-700">{todayStats.items} Item</span></div>
            <div className="flex justify-between items-center p-2"><span className="text-gray-500 text-sm font-medium">Margin Bersih</span><span className="font-bold text-green-500">+ Rp {todayStats.margin.toLocaleString('id-ID')}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 hover-lift relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${thm.gradient} opacity-10 rounded-bl-full`} />
          <div className="flex items-center space-x-3 mb-4 relative">
            <div className={`p-3 rounded-2xl ${thm.light} ${thm.text}`}><Wallet size={24} /></div>
            <h3 className="text-lg font-bold text-gray-700">Bulan Ini</h3>
          </div>
          <div className="space-y-3 relative">
            <div><p className="text-sm text-gray-500 font-medium">Penjualan</p><p className="text-2xl font-black text-gray-800">Rp {monthStats.revenue.toLocaleString('id-ID')}</p></div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl"><span className="text-gray-500 text-sm">Barang Keluar</span><span className="font-bold text-gray-700">{monthStats.items} Item</span></div>
            <div className="flex justify-between items-center p-2"><span className="text-gray-500 text-sm font-medium">Margin Bersih</span><span className="font-bold text-green-500">+ Rp {monthStats.margin.toLocaleString('id-ID')}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-sm p-6 text-white hover-lift relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-bl-full" />
          <div className="flex items-center space-x-3 mb-4 relative">
            <div className={`p-3 rounded-2xl bg-white/20 text-white`}><BookOpen size={24} /></div>
            <h3 className="text-lg font-bold">Piutang / Kasbon</h3>
          </div>
          <div className="space-y-3 relative">
            <div><p className="text-red-100 font-medium text-sm">Total Belum Tertagih</p><p className="text-3xl font-black">Rp {totalUnpaid.toLocaleString('id-ID')}</p></div>
            <p className="text-sm text-red-100 mt-4 leading-relaxed">Uang yang masih ada di luar. Cek menu "Buku Kasbon" untuk melihat rincian penagihan pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 mb-6">
        <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tight">Grafik Penjualan (7 Hari Terakhir)</h3>
        <div className="space-y-5">
          {chartData.map((data, idx) => (
            <div key={idx} className="flex items-center group">
              <span className="w-14 text-sm font-bold text-gray-400 group-hover:text-gray-700 transition-colors">{data.day}</span>
              <div className="flex-1 mx-4 bg-gray-100 rounded-full h-5 overflow-hidden flex items-center relative shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${thm.gradient} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${(data.total / maxChartVal) * 100}%` }}
                />
              </div>
              <span className="w-28 text-right text-sm font-black text-gray-700">Rp {data.total.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD BARU: Peringatan Stok & Daftar Hutang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Stok Menipis */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600"><Package size={20} /></div>
            <h3 className="text-lg font-black text-gray-800">Peringatan Stok Menipis</h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover-lift">
                <span className="font-bold text-gray-800">{p.name}</span>
                <span className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-sm font-black animate-pulse">Sisa {p.stock}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <CheckCircle size={40} className="mb-2 opacity-30 text-green-500" />
                <p className="font-medium text-sm">Semua stok produk aman.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Tagihan Belum Lunas */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><Users size={20} /></div>
            <h3 className="text-lg font-black text-gray-800">Tagihan Belum Lunas</h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {unpaidDebtsList.length > 0 ? unpaidDebtsList.map(d => (
              <div key={d.customerId} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover-lift">
                <div>
                  <div className="font-bold text-gray-800">{d.customerName}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">📞 {d.phone}</div>
                </div>
                <span className="font-black text-red-600 text-lg">Rp {d.total.toLocaleString('id-ID')}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <CheckCircle size={40} className="mb-2 opacity-30 text-green-500" />
                <p className="font-medium text-sm">Yeay! Tidak ada tagihan tertunggak.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. POS VIEW (KASIR)
// ==========================================
function POSView({ products, setProducts, customers, transactions, setTransactions, settings, thm }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [camPermissionMsg, setCamPermissionMsg] = useState('');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stok habis!');
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

  const clearCart = () => setCart([]);
  const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);
  
  const handleScanClick = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCamPermissionMsg('Kamera aktif. Arahkan ke Barcode (Simulasi).');
      setTimeout(() => setCamPermissionMsg(''), 3000);
    } catch (err) {
      setCamPermissionMsg('Izin kamera ditolak.');
      setTimeout(() => setCamPermissionMsg(''), 3000);
    }
  };

  const processCheckout = (checkoutData) => {
    // checkoutData = { method: 'Tunai'|'QRIS'|'Kasbon', cashAmount, customerId }
    
    if (checkoutData.method === 'Tunai' && checkoutData.cashAmount < subtotal) {
      return alert('Uang yang diterima kurang!');
    }
    
    let cashRcv = checkoutData.cashAmount;
    let chg = cashRcv - subtotal;
    
    if (checkoutData.method === 'QRIS' || checkoutData.method === 'Kasbon') {
      cashRcv = subtotal; // Uang pas secara sistem
      chg = 0;
    }

    const selectedCust = customers.find(c => c.id === checkoutData.customerId) || customers[0];

    const newTx = {
      id: 'TRX-' + Date.now(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: subtotal,
      total: subtotal,
      cash: cashRcv,
      change: chg,
      paymentMethod: checkoutData.method,
      customerName: selectedCust.name,
      customerId: selectedCust.id,
      status: checkoutData.method === 'Kasbon' ? 'Belum Lunas' : 'Lunas',
      cashier: settings.cashierName
    };

    // Reduce Stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });

    setProducts(updatedProducts);
    setTransactions(prev => [newTx, ...prev]);
    setLastTransaction(newTx);
    
    setCart([]);
    setShowCheckout(false);
    setShowReceipt(true);
  };

  return (
    <div className="flex h-full print:block print:h-auto animate-fadeInUp">
      {/* KIRI - Produk */}
      <div className="flex-1 flex flex-col bg-gray-50/50 border-r print:hidden">
        <div className="p-4 bg-white shadow-sm z-10 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-none bg-gray-100 focus:outline-none focus:ring-4 focus:ring-green-500/20 font-medium"
            />
            <button onClick={handleScanClick} className={`absolute right-2 top-2 p-2 rounded-xl ${thm.light} ${thm.text} hover:scale-105 transition-transform`}>
              <ScanLine size={18} />
            </button>
          </div>
        </div>
        {camPermissionMsg && <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium text-center">{camPermissionMsg}</div>}

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {filteredProducts.map((product, idx) => (
            <div 
              key={product.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover-lift cursor-pointer group" 
              onClick={() => addToCart(product)}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg group-hover:text-black transition-colors">{product.name}</span>
                <span className="text-sm text-gray-500 mt-0.5">Stok: <span className={product.stock > 10 ? 'text-green-600 font-bold' : 'text-red-500 font-black'}>{product.stock}</span></span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-black text-lg ${thm.text}`}>Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className={`p-2.5 rounded-xl ${thm.light} ${thm.text} group-hover:${thm.primary} group-hover:text-white transition-all transform active:scale-90`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-medium flex flex-col items-center">
              <Package size={48} className="mb-4 opacity-20" />
              Produk tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* KANAN - Keranjang */}
      <div className="w-[400px] bg-white flex flex-col shadow-2xl z-20 print:hidden relative">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <ShoppingCart className={thm.text} size={24} />
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Keranjang</h2>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-red-500 text-sm font-bold flex items-center hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 size={16} className="mr-1.5"/> Kosongkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={64} className="mb-4 opacity-10" />
              <p className="font-medium">Belum ada pesanan.</p>
              <p className="text-sm mt-1">Klik produk di sebelah kiri.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl animate-fadeInUp">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                  <div className="text-gray-500 text-sm font-medium mt-0.5">Rp {item.sellPrice.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Minus size={18}/></button>
                  <span className="font-black w-6 text-center text-gray-800">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition"><Plus size={18}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between mb-2 text-gray-500 font-medium">
            <span>Total Item</span>
            <span>{cart.reduce((s, i) => s + i.qty, 0)} Item</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-black text-2xl text-gray-800">Total</span>
            <span className={`font-black text-2xl ${thm.text}`}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all transform active:scale-95 ${cart.length === 0 ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed' : `bg-gradient-to-r ${thm.gradient} hover:opacity-90`}`}
          >
            Pilih Pembayaran
          </button>
        </div>
      </div>

      {showCheckout && <CheckoutModal subtotal={subtotal} customers={customers} onClose={() => setShowCheckout(false)} onProcess={processCheckout} thm={thm} />}
      {showReceipt && <ReceiptModal transaction={lastTransaction} settings={settings} onClose={() => setShowReceipt(false)} thm={thm} />}
    </div>
  );
}

function CheckoutModal({ subtotal, customers, onClose, onProcess, thm }) {
  const [method, setMethod] = useState('Tunai'); // Tunai, QRIS, Kasbon
  const [cash, setCash] = useState('');
  const [selectedCust, setSelectedCust] = useState(customers[0].id);

  const suggestions = useMemo(() => {
    const list = [subtotal];
    const commonBills = [50000, 100000];
    const nearest10k = Math.ceil(subtotal / 10000) * 10000;
    const nearest50k = Math.ceil(subtotal / 50000) * 50000;

    if (nearest10k > subtotal && !list.includes(nearest10k)) list.push(nearest10k);
    if (nearest50k > subtotal && !list.includes(nearest50k)) list.push(nearest50k);
    commonBills.forEach(bill => { if (bill > subtotal && !list.includes(bill)) list.push(bill); });

    return list.sort((a,b) => a - b).slice(0, 4);
  }, [subtotal]);

  const handleProcess = () => {
    const cashVal = method === 'Tunai' ? (parseInt(cash.replace(/\D/g, '')) || 0) : subtotal;
    onProcess({ method, cashAmount: cashVal, customerId: selectedCust });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden transition-all">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-popIn">
        <div className={`p-8 bg-gradient-to-br ${thm.gradient} text-white text-center relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 p-2 rounded-full hover:bg-black/40 transition"><X size={20}/></button>
          <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Tagihan</h3>
          <div className="text-5xl font-black tracking-tight">Rp {subtotal.toLocaleString('id-ID')}</div>
        </div>
        
        <div className="p-6">
          {/* Method Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
            {['Tunai', 'QRIS', 'Kasbon'].map(m => (
              <button 
                key={m} 
                onClick={() => setMethod(m)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${method === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'Tunai' && <Wallet size={16} className="inline mr-1.5 mb-0.5"/>}
                {m === 'QRIS' && <QrCode size={16} className="inline mr-1.5 mb-0.5"/>}
                {m === 'Kasbon' && <BookOpen size={16} className="inline mr-1.5 mb-0.5"/>}
                {m}
              </button>
            ))}
          </div>

          {/* Dynamic Content based on Method */}
          {method === 'Tunai' && (
            <div className="animate-fadeInUp">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Terima Uang</label>
              <input 
                type="text" autoFocus value={cash}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCash(val ? parseInt(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className="w-full text-right text-3xl font-black p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:bg-white focus:outline-none mb-4 transition-all"
              />
              <div className="grid grid-cols-2 gap-3 mb-6">
                {suggestions.map((sug, idx) => (
                  <button 
                    key={idx} onClick={() => setCash(sug.toLocaleString('id-ID'))}
                    className={`py-3 px-4 rounded-xl border-2 ${idx === 0 ? 'border-green-500 text-green-700 bg-green-50 font-black' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-bold'} transition-all hover-lift`}
                  >
                    {idx === 0 ? 'Uang Pas' : `Rp ${sug.toLocaleString('id-ID')}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === 'QRIS' && (
            <div className="text-center py-6 animate-fadeInUp">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <QrCode size={64} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-800">Menunggu Pembayaran QRIS / Transfer</p>
              <p className="text-sm text-gray-500 mt-1">Pastikan dana sudah masuk ke rekening.</p>
            </div>
          )}

          {method === 'Kasbon' && (
            <div className="py-2 animate-fadeInUp">
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-bold flex items-center mb-4 border border-red-100">
                <BookOpen size={18} className="mr-2"/> Mode Pencatatan Hutang
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Pilih Pelanggan Penghutang</label>
              <select 
                value={selectedCust} onChange={e => setSelectedCust(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none font-bold text-gray-800 mb-6"
              >
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Action Button */}
          {method === 'Tunai' && (
            <select 
              value={selectedCust} onChange={e => setSelectedCust(e.target.value)}
              className="w-full p-3 mb-6 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium"
            >
              <option disabled>Pilih Pelanggan (Opsional)</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          <button 
            onClick={handleProcess} 
            className={`w-full py-4 ${method==='Kasbon'? 'bg-red-600 hover:bg-red-700' : `bg-gradient-to-r ${thm.gradient} hover:opacity-90`} text-white font-black text-lg rounded-2xl shadow-xl transition-transform transform active:scale-95`}
          >
            {method === 'Tunai' ? 'Proses Pembayaran' : method === 'QRIS' ? 'Konfirmasi QRIS Berhasil' : 'Catat Sebagai Hutang'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ transaction, settings, onClose, thm }) {
  const printRef = useRef();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:block animate-fadeInUp">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-popIn">
        
        <div className="flex justify-between items-center p-5 border-b bg-gray-50 print:hidden rounded-t-3xl">
          <h3 className="font-black text-lg text-gray-800">Preview Struk</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 bg-white p-1 rounded-lg shadow-sm border"><X size={20}/></button>
        </div>

        <div className={`p-6 overflow-y-auto print:p-0 print:overflow-visible font-mono text-gray-800 ${settings.paperSize === '80mm' ? 'text-base print:w-[80mm]' : 'text-sm print:w-[58mm]'}`} ref={printRef} id="receipt-print-area">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest">{settings.storeName}</h2>
            <p className="text-xs text-gray-500 whitespace-pre-wrap mt-1 font-sans">{settings.address}</p>
            <p className="text-xs text-gray-500 font-sans">{settings.phone}</p>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-300 pb-3 mb-3 text-xs space-y-1">
            <div className="flex justify-between"><span>No:</span><span className="font-bold">{transaction.id}</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>{new Date(transaction.date).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span className="font-bold uppercase">{transaction.cashier}</span></div>
            <div className="flex justify-between"><span>Pelanggan:</span><span className="font-bold">{transaction.customerName}</span></div>
          </div>

          <div className="border-b-2 border-dashed border-gray-300 pb-3 mb-3">
            {transaction.items.map(item => (
              <div key={item.id} className="mb-2">
                <div className="font-bold">{item.name}</div>
                <div className="flex justify-between text-xs mt-0.5">
                  <span>{item.qty} x {item.sellPrice.toLocaleString('id-ID')}</span>
                  <span className="font-bold">{(item.qty * item.sellPrice).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 mb-6 text-sm">
            <div className="flex justify-between font-black text-base border-b border-gray-200 pb-1 mb-1">
              <span>TOTAL</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Metode Bayar</span>
              <span className="uppercase font-bold">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Status</span>
              <span className={transaction.status === 'Belum Lunas' ? 'text-red-600 font-black' : 'font-bold'}>{transaction.status}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && (
              <>
                <div className="flex justify-between"><span>Tunai Diterima</span><span>Rp {transaction.cash.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>Kembali</span><span>Rp {transaction.change.toLocaleString('id-ID')}</span></div>
              </>
            )}
          </div>

          <div className="text-center text-xs font-medium text-gray-500 italic mt-8 border-t border-gray-200 pt-4">
            Terima kasih atas kunjungan Anda!<br/>Barang yang sudah dibeli tidak dapat ditukar.
          </div>
        </div>

        <div className="p-5 border-t flex space-x-3 print:hidden bg-gray-50 rounded-b-3xl">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-sm"
          >
            Selesai
          </button>
          <button 
            onClick={() => window.print()} 
            className={`flex-1 flex items-center justify-center py-3 bg-gradient-to-r ${thm.gradient} text-white font-bold rounded-xl hover:opacity-90 transition shadow-md`}
          >
            <Printer size={20} className="mr-2" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. INVENTORY VIEW
// ==========================================
function InventoryView({ products, setProducts, thm }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const handleDelete = (id) => {
    if(window.confirm('Hapus produk ini?')) setProducts(products.filter(p => p.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const prod = {
      id: editingProd ? editingProd.id : 'PRD-' + Date.now(),
      name: formData.get('name'),
      category: formData.get('category'),
      stock: parseInt(formData.get('stock')),
      buyPriceBox: parseInt(formData.get('buyPriceBox')),
      buyPriceUnit: parseInt(formData.get('buyPriceUnit')),
      sellPrice: parseInt(formData.get('sellPrice')),
    };
    setProducts(editingProd ? products.map(p => p.id === prod.id ? prod : p) : [prod, ...products]);
    setShowAdd(false);
    setEditingProd(null);
  };

  return (
    <div className="p-6 animate-fadeInUp print:hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Manajemen Inventaris</h2>
        <div className="flex space-x-3">
          <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center hover:bg-gray-50 transition shadow-sm font-bold">
            <Upload size={18} className="mr-2"/> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={() => alert('Fitur CSV Ready for Deployment.')} />
          </label>
          <button 
            onClick={() => { setEditingProd(null); setShowAdd(true); }}
            className={`bg-gradient-to-r ${thm.gradient} text-white px-5 py-2.5 rounded-xl flex items-center shadow-md hover:opacity-90 transition font-black`}
          >
            <Plus size={18} className="mr-1.5"/> Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-5 font-bold uppercase">Nama Produk</th>
                <th className="p-5 font-bold uppercase text-center">Stok</th>
                <th className="p-5 font-bold uppercase">Kategori</th>
                <th className="p-5 font-bold uppercase text-right">Modal</th>
                <th className="p-5 font-bold uppercase text-right">Harga Jual</th>
                <th className="p-5 font-bold uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition animate-fadeInUp`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="p-5 font-bold text-gray-800">{p.name}</td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${p.stock <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-5 text-gray-500 font-medium">{p.category}</td>
                  <td className="p-5 text-right text-gray-500 font-medium">Rp {p.buyPriceUnit.toLocaleString('id-ID')}</td>
                  <td className="p-5 text-right font-black text-gray-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                  <td className="p-5 text-center">
                    <button onClick={() => { setEditingProd(p); setShowAdd(true); }} className="text-blue-600 hover:text-blue-800 font-bold mr-4 transition">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold transition">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-popIn">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-xl text-gray-800">{editingProd ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 bg-white p-1.5 rounded-lg shadow-sm border hover:text-gray-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Nama Produk</label><input required name="name" defaultValue={editingProd?.name} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-bold text-gray-800" /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Kategori</label><input required name="category" defaultValue={editingProd?.category} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Stok Awal</label><input required type="number" name="stock" defaultValue={editingProd?.stock} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-black text-center" /></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Harga Beli (Per Dus)</label><input required type="number" name="buyPriceBox" defaultValue={editingProd?.buyPriceBox} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-right" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Harga Beli (Satuan)</label><input required type="number" name="buyPriceUnit" defaultValue={editingProd?.buyPriceUnit} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-right" /></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Harga Jual Konsumen</label><input required type="number" name="sellPrice" defaultValue={editingProd?.sellPrice} className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-black text-2xl text-green-700 text-right" /></div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className={`px-8 py-3 bg-gradient-to-r ${thm.gradient} text-white font-black rounded-xl hover:opacity-90 shadow-lg`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. CUSTOMER VIEW
// ==========================================
function CustomerView({ customers, setCustomers, thm }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cust = {
      id: editingCust ? editingCust.id : 'CUST-' + Date.now(),
      name: fd.get('name'), phone: fd.get('phone'), address: fd.get('address')
    };
    setCustomers(editingCust ? customers.map(c => c.id === cust.id ? cust : c) : [...customers, cust]);
    setShowAdd(false); setEditingCust(null);
  };

  return (
    <div className="p-6 animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Database Pelanggan</h2>
        <button onClick={() => { setEditingCust(null); setShowAdd(true); }} className={`bg-gradient-to-r ${thm.gradient} text-white px-5 py-2.5 rounded-xl flex items-center shadow-md font-black hover:opacity-90 transition`}>
          <Users size={18} className="mr-2"/> Tambah Pelanggan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customers.map((c, i) => (
          <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover-lift relative" style={{ animationDelay: `${i * 0.05}s` }}>
            {c.id === 'CUST-0' && <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Default Sistem</div>}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${thm.gradient} text-white flex items-center justify-center text-xl font-black mb-4 shadow-md`}>
              {c.name.charAt(0)}
            </div>
            <h3 className="text-lg font-black text-gray-800">{c.name}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">📞 {c.phone}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">🏠 {c.address}</p>
            
            {c.id !== 'CUST-0' && (
              <div className="mt-6 pt-4 border-t flex space-x-3">
                <button onClick={() => { setEditingCust(c); setShowAdd(true); }} className="text-blue-600 font-bold text-sm">Edit</button>
                <button onClick={() => setCustomers(customers.filter(x => x.id !== c.id))} className="text-red-500 font-bold text-sm">Hapus</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl animate-popIn">
            <h3 className="font-black text-xl mb-6">{editingCust ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="font-bold text-sm">Nama Pelanggan</label><input required name="name" defaultValue={editingCust?.name} className="w-full p-3 bg-gray-50 border rounded-xl mt-1 outline-none font-bold" /></div>
              <div><label className="font-bold text-sm">No. HP / WA</label><input required name="phone" defaultValue={editingCust?.phone} className="w-full p-3 bg-gray-50 border rounded-xl mt-1 outline-none font-bold" /></div>
              <div><label className="font-bold text-sm">Alamat</label><textarea required name="address" defaultValue={editingCust?.address} className="w-full p-3 bg-gray-50 border rounded-xl mt-1 outline-none font-bold" /></div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Batal</button>
                <button type="submit" className={`flex-1 py-3 bg-gradient-to-r ${thm.gradient} text-white font-black rounded-xl`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. DEBT VIEW (BUKU HUTANG)
// ==========================================
function DebtView({ transactions, setTransactions, customers, thm }) {
  const unpaidTx = transactions.filter(t => t.paymentMethod === 'Kasbon' && t.status === 'Belum Lunas');

  const handlePayDebt = (txId) => {
    if(window.confirm('Tandai tagihan ini sebagai LUNAS?')) {
      setTransactions(transactions.map(t => t.id === txId ? { ...t, status: 'Lunas', paymentMethod: 'Tunai' } : t));
    }
  };

  return (
    <div className="p-6 animate-fadeInUp">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Buku Kasbon / Piutang</h2>
        <p className="text-gray-500 font-medium mt-1">Kelola dan tagih hutang pelanggan.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-red-50 text-red-700 border-b border-red-100">
            <tr>
              <th className="p-5 font-bold uppercase text-sm">Pelanggan</th>
              <th className="p-5 font-bold uppercase text-sm">Tanggal Kasbon</th>
              <th className="p-5 font-bold uppercase text-sm">No. Transaksi</th>
              <th className="p-5 font-bold uppercase text-right text-sm">Nominal Tagihan</th>
              <th className="p-5 font-bold uppercase text-center text-sm">Aksi Penagihan</th>
            </tr>
          </thead>
          <tbody>
            {unpaidTx.map((tx, i) => {
              const cust = customers.find(c => c.id === tx.customerId);
              return (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="p-5">
                    <div className="font-black text-gray-800 text-lg">{tx.customerName}</div>
                    <div className="text-sm text-gray-500 font-medium">📞 {cust?.phone || '-'}</div>
                  </td>
                  <td className="p-5 font-bold text-gray-600">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-5 text-sm font-medium text-gray-500">{tx.id}</td>
                  <td className="p-5 text-right font-black text-red-600 text-xl">Rp {tx.total.toLocaleString('id-ID')}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => handlePayDebt(tx.id)} 
                      className="bg-green-100 text-green-700 hover:bg-green-500 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                    >
                      Terima Pembayaran
                    </button>
                  </td>
                </tr>
              );
            })}
            {unpaidTx.length === 0 && (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold">Yeay! Tidak ada pelanggan yang ngutang.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 7. HISTORY VIEW
// ==========================================
function HistoryView({ transactions, settings, thm }) {
  const today = new Date();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(today.getFullYear() - 3);

  const [startDate, setStartDate] = useState(threeYearsAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedTx, setSelectedTx] = useState(null);

  const filteredTx = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
  });

  const totalNominal = filteredTx.reduce((sum, tx) => sum + tx.total, 0);

  const downloadExcel = () => {
    let csv = 'ID Transaksi,Tanggal,Status,Metode,Total Tagihan,Kasir,Pelanggan,Daftar Barang\n';
    filteredTx.forEach(tx => {
      const items = tx.items.map(i => `${i.name} (${i.qty})`).join(' | ');
      csv += `"${tx.id}","${new Date(tx.date).toLocaleString('id-ID')}","${tx.status}","${tx.paymentMethod}","${tx.total}","${tx.cashier}","${tx.customerName}","${items}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Transaksi_${startDate}.csv`;
    link.click();
  };

  return (
    <div className="p-6 animate-fadeInUp print:hidden">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-gray-500 font-medium mt-1">Total {filteredTx.length} transaksi (Rp {totalNominal.toLocaleString('id-ID')})</p>
        </div>
        <button onClick={downloadExcel} className={`bg-gradient-to-r ${thm.gradient} text-white px-5 py-3 rounded-xl flex items-center shadow-md font-black hover:opacity-90 transition`}>
          <Download size={18} className="mr-2"/> Download Laporan (.csv)
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6 mb-6">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-bold text-gray-500 uppercase">Dari Tanggal:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-50 border p-2.5 rounded-xl outline-none font-bold text-gray-700" />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-bold text-gray-500 uppercase">Sampai:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-50 border p-2.5 rounded-xl outline-none font-bold text-gray-700" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500">
            <tr>
              <th className="p-5 font-bold uppercase text-sm">Waktu</th>
              <th className="p-5 font-bold uppercase text-sm">No. Transaksi</th>
              <th className="p-5 font-bold uppercase text-sm">Pelanggan & Pembayaran</th>
              <th className="p-5 font-bold uppercase text-right text-sm">Total Tagihan</th>
              <th className="p-5 font-bold uppercase text-center text-sm">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((tx, i) => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition animate-fadeInUp" style={{ animationDelay: `${i * 0.02}s` }}>
                <td className="p-5 font-bold text-gray-600">{new Date(tx.date).toLocaleString('id-ID')}</td>
                <td className="p-5 font-medium text-gray-800 text-sm">{tx.id}</td>
                <td className="p-5">
                  <div className="font-bold text-gray-800">{tx.customerName}</div>
                  <div className="flex space-x-2 mt-1 text-xs">
                    <span className="bg-gray-200 px-2 py-0.5 rounded-md font-bold">{tx.paymentMethod}</span>
                    <span className={tx.status === 'Belum Lunas' ? 'bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-black' : 'bg-green-100 text-green-600 px-2 py-0.5 rounded-md font-bold'}>{tx.status}</span>
                  </div>
                </td>
                <td className="p-5 text-right font-black text-gray-800 text-lg">Rp {tx.total.toLocaleString('id-ID')}</td>
                <td className="p-5 text-center">
                  <button onClick={() => setSelectedTx(tx)} className={`px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold flex items-center justify-center mx-auto hover:bg-gray-200 transition text-gray-700`}>
                    <FileText size={16} className="mr-1.5"/> Struk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedTx && <ReceiptModal transaction={selectedTx} settings={settings} onClose={() => setSelectedTx(null)} thm={thm} />}
    </div>
  );
}

// ==========================================
// 8. SETTINGS VIEW
// ==========================================
function SettingsView({ settings, setSettings, themeColors, thm }) {
  const [formData, setFormData] = useState(settings);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl animate-fadeInUp print:hidden">
      <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Pengaturan Toko</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8">
        
        <div>
          <h3 className="text-lg font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5 uppercase tracking-wider">Profil Usaha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nama Toko</label><input required value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">No. WhatsApp Toko</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Alamat Lengkap (Tampil di Struk)</label><textarea rows="2" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-medium" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nama Kasir Bertugas</label><input required value={formData.cashierName} onChange={e => setFormData({...formData, cashierName: e.target.value})} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-800" /></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5 uppercase tracking-wider">Pengaturan Printer & Struk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Koneksi Printer</label>
              <select value={formData.printerType || 'Bluetooth'} onChange={e => setFormData({...formData, printerType: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700">
                <option value="Bluetooth">Bluetooth Printer</option>
                <option value="USB">USB / Kabel</option>
                <option value="Sistem">Default Sistem (Browser)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Ukuran Kertas Struk</label>
              <select value={formData.paperSize || '58mm'} onChange={e => setFormData({...formData, paperSize: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700">
                <option value="58mm">Kertas 58mm (Kecil)</option>
                <option value="80mm">Kertas 80mm (Besar)</option>
              </select>
            </div>
            {formData.printerType === 'Bluetooth' && (
              <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between animate-fadeInUp">
                <span className="text-sm font-bold text-blue-800">Status Bluetooth: Belum Terhubung</span>
                <button type="button" onClick={() => alert('Mencari perangkat Bluetooth di sekitar... (Simulasi Web Bluetooth API)')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-colors shadow-md">
                  Cari Printer
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-gray-800 border-b-2 border-gray-100 pb-3 mb-5 uppercase tracking-wider">Warna Tema Aplikasi</h3>
          <div className="flex space-x-6">
            {Object.keys(themeColors).map(colorKey => (
              <label key={colorKey} className="flex flex-col items-center cursor-pointer group hover-lift">
                <input type="radio" name="theme" value={colorKey} checked={formData.themeColor === colorKey} onChange={e => setFormData({...formData, themeColor: e.target.value})} className="hidden" />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${themeColors[colorKey].gradient} flex items-center justify-center transition-all ${formData.themeColor === colorKey ? 'ring-4 ring-offset-4 ring-gray-800 shadow-xl scale-110' : 'opacity-80 group-hover:opacity-100'}`}>
                  {formData.themeColor === colorKey && <CheckCircle className="text-white drop-shadow-md" size={28} />}
                </div>
                <span className={`mt-3 text-sm font-black capitalize ${formData.themeColor === colorKey ? 'text-gray-800' : 'text-gray-400'}`}>{colorKey}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t-2 border-gray-100 flex items-center justify-end">
          {savedMsg && <span className="text-green-600 font-black mr-6 flex items-center animate-fadeInUp"><CheckCircle size={20} className="mr-1.5"/> Pengaturan Disimpan!</span>}
          <button type="submit" className={`px-10 py-4 bg-gradient-to-r ${thm.gradient} text-white font-black text-lg rounded-2xl shadow-xl hover:opacity-90 transition-transform transform active:scale-95`}>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}