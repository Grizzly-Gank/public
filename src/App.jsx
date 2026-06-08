import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Home, ShoppingCart, Package, FileText, Settings as SettingsIcon, 
  LogOut, Plus, Minus, Trash2, Search, ScanLine, Printer, Download,
  Calendar, DollarSign, TrendingUp, CheckCircle, Upload, Users, BookOpen, Eye, EyeOff
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

export default function App() {
  // --- STATES ---
  const [authUser, setAuthUser] = useLocalStorage('pos_auth_user', null); 
  // authUser format: { role: 'owner' | 'cashier', username: string }

  const [activeTab, setActiveTab] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [products, setProducts] = useLocalStorage('pos_products', [
    { id: '1', name: 'Nasi Gudeg Spesial', stock: 50, buyPriceBox: 100000, buyPriceUnit: 10000, sellPrice: 15000, category: 'Makanan' },
    { id: '2', name: 'Es Teh Manis', stock: 100, buyPriceBox: 20000, buyPriceUnit: 2000, sellPrice: 5000, category: 'Minuman' },
    { id: '3', name: 'Keripik Singkong', stock: 5, buyPriceBox: 50000, buyPriceUnit: 5000, sellPrice: 8000, category: 'Cemilan' },
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

  // --- THEME CONFIG ---
  const themeColors = {
    caramel: { primary: 'bg-[#867233]', hover: 'hover:bg-[#6b5b29]', text: 'text-[#867233]', border: 'border-[#867233]', light: 'bg-[#f4efe1]' },
    green: { primary: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', border: 'border-green-600', light: 'bg-green-50' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50' },
    dark: { primary: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-gray-800', border: 'border-gray-800', light: 'bg-gray-200' },
  };
  const thm = themeColors[settings.themeColor] || themeColors.caramel;

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Default tab based on role when logged in
    if (authUser) {
      if (authUser.role === 'owner' && activeTab === 'pos' && !window.localStorage.getItem('tab_set')) {
        setActiveTab('dashboard');
        window.localStorage.setItem('tab_set', 'true');
      }
    } else {
      window.localStorage.removeItem('tab_set');
    }
  }, [authUser, activeTab]);

  // --- RENDERERS ---
  if (!authUser) {
    return <LoginScreen onLogin={(user) => setAuthUser(user)} thm={thm} />;
  }

  // Define Navigation based on Roles
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
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className={`text-2xl font-black ${thm.text} tracking-tight`}>{settings.storeName}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id ? `${thm.primary} text-white shadow-md transform scale-[1.02]` : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <div className="mb-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Masuk sebagai: <span className={`font-bold ${thm.text}`}>{authUser.role === 'owner' ? 'Owner' : 'Kasir'}</span>
          </div>
          <button 
            onClick={() => setAuthUser(null)}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:bg-white">
        <header className="bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-20 flex items-center justify-between px-6 z-10 print:hidden">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-2xl ${thm.light} ${thm.text} hover:opacity-80 transition-colors`}>
              <Menu size={24} />
            </button>
            <h1 className={`text-2xl font-black ${thm.text} hidden sm:block tracking-tight`}>{settings.storeName}</h1>
          </div>
          <div className="flex items-center space-x-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs font-medium text-gray-400">{currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className={`h-11 w-11 rounded-2xl ${thm.primary} flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-105 transition-transform`}>
              {authUser.role === 'owner' ? 'OW' : 'KS'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50/50 print:bg-white print:overflow-visible relative">
          {activeTab === 'dashboard' && authUser.role === 'owner' && <DashboardView transactions={transactions} products={products} thm={thm} />}
          {activeTab === 'pos' && <POSView products={products} setProducts={setProducts} transactions={transactions} setTransactions={setTransactions} customers={customers} settings={settings} thm={thm} authUser={authUser} />}
          {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} thm={thm} />}
          {activeTab === 'debts' && <DebtsView transactions={transactions} setTransactions={setTransactions} thm={thm} />}
          {activeTab === 'inventory' && authUser.role === 'owner' && <InventoryView products={products} setProducts={setProducts} thm={thm} />}
          {activeTab === 'history' && <HistoryView transactions={transactions} settings={settings} thm={thm} />}
          {activeTab === 'settings' && authUser.role === 'owner' && <SettingsView settings={settings} setSettings={setSettings} themeColors={themeColors} thm={thm} />}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 1. LOGIN SCREEN (WITH RBAC & EYE ICON)
// ==========================================
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md transform transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 mx-auto ${thm.light} rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner`}>
            <ShoppingCart size={40} className={thm.text} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">KasirGo</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Sistem Manajemen Retail Modern</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 transition-all outline-none font-medium text-gray-700"
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
                className="w-full p-4 pr-12 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 transition-all outline-none font-medium text-gray-700"
                placeholder="Masukkan sandi"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-xl animate-pulse">{error}</p>}
          <button 
            type="submit" 
            className={`w-full ${thm.primary} ${thm.hover} text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#867233]/20 transition-all transform hover:-translate-y-1 active:scale-95`}
          >
            Masuk Sistem
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-xs font-medium text-gray-400">
        © 2026 M. Ghozzin Dirham | All Right Reserved
      </p>
    </div>
  );
}

// ==========================================
// REST OF VIEWS (DASHBOARD, POS, ETC.)
// (Including minor UI tweaks for borders)
// ==========================================

function DashboardView({ transactions, products, thm }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
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
  
  const lowStockProducts = products.filter(p => p.stock <= 10);
  const unpaidDebts = transactions.filter(t => t.paymentMethod === 'Kasbon' && t.paymentStatus === 'Belum Lunas');
  const totalDebtAmount = unpaidDebts.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="p-8 animate-fadeIn print:hidden">
      <h2 className="text-3xl font-black text-gray-800 mb-8 tracking-tight">Ringkasan Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 border border-gray-50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-4 rounded-2xl ${thm.light} ${thm.text}`}><Calendar size={24} /></div>
            <h3 className="text-lg font-bold text-gray-500">Omset Hari Ini</h3>
          </div>
          <div className="text-3xl font-black text-gray-800">Rp {todayStats.revenue.toLocaleString('id-ID')}</div>
          <div className="mt-2 text-sm font-semibold text-green-500 bg-green-50 inline-block px-3 py-1 rounded-lg">Laba: Rp {todayStats.margin.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 border border-gray-50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-4 rounded-2xl ${thm.light} ${thm.text}`}><TrendingUp size={24} /></div>
            <h3 className="text-lg font-bold text-gray-500">Omset Bulan Ini</h3>
          </div>
          <div className="text-3xl font-black text-gray-800">Rp {monthStats.revenue.toLocaleString('id-ID')}</div>
          <div className="mt-2 text-sm font-semibold text-green-500 bg-green-50 inline-block px-3 py-1 rounded-lg">Laba: Rp {monthStats.margin.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 border border-red-50 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-4 rounded-2xl bg-red-50 text-red-500`}><BookOpen size={24} /></div>
            <h3 className="text-lg font-bold text-gray-500">Total Piutang (Kasbon)</h3>
          </div>
          <div className="text-3xl font-black text-red-500">Rp {totalDebtAmount.toLocaleString('id-ID')}</div>
          <div className="mt-2 text-sm font-semibold text-red-600 bg-red-50 inline-block px-3 py-1 rounded-lg">{unpaidDebts.length} Transaksi Menggantung</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 border border-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Package size={20} className="mr-2 text-orange-500"/> Peringatan Stok Menipis</h3>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? <p className="text-gray-400 text-sm">Semua stok aman.</p> : 
              lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                  <span className="font-semibold text-gray-700">{p.name}</span>
                  <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-xl">Sisa {p.stock}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 border border-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Users size={20} className="mr-2 text-red-500"/> Kasbon Belum Lunas Terbaru</h3>
          <div className="space-y-3">
            {unpaidDebts.length === 0 ? <p className="text-gray-400 text-sm">Tidak ada hutang pelanggan.</p> : 
              unpaidDebts.slice(0,4).map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <div className="font-semibold text-gray-700">{t.customerName}</div>
                    <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('id-ID')}</div>
                  </div>
                  <span className="font-bold text-red-500">Rp {t.total.toLocaleString('id-ID')}</span>
                </div>
              ))
            }
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
      <div className="flex-1 flex flex-col bg-gray-50/50 print:hidden p-4 space-y-4">
        <div className="bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] rounded-3xl p-2 flex items-center space-x-2 border border-gray-50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-none bg-transparent focus:outline-none font-medium text-gray-700"
            />
            <button className={`absolute right-2 top-2 p-1.5 rounded-xl ${thm.light} ${thm.text} hover:opacity-80 transition`}>
              <ScanLine size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-3 pb-20 px-1">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-5 rounded-3xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-50 flex items-center justify-between hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all transform hover:-translate-y-1 cursor-pointer" onClick={() => addToCart(product)}>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">{product.name}</span>
                <span className="text-xs text-gray-400 mt-1 font-medium">Sisa Stok: <span className={product.stock > 10 ? 'text-green-500' : 'text-red-500'}>{product.stock}</span></span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-black text-lg ${thm.text}`}>Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className={`p-2.5 rounded-2xl ${thm.light} ${thm.text} hover:scale-110 transition-transform`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[400px] bg-white flex flex-col shadow-[-10px_0_30px_rgb(0,0,0,0.03)] z-20 print:hidden border-l border-gray-50">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Keranjang</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-red-500 text-sm font-bold flex items-center hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors">
              <Trash2 size={16} className="mr-1"/> Kosongkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5 bg-gray-50/30">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingCart size={64} className="mb-4 opacity-30" />
              <p className="font-medium">Belum ada pesanan.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <div className={`text-sm font-bold ${thm.text} mt-1`}>Rp {item.sellPrice.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-1.5">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-500 hover:text-red-500"><Minus size={16}/></button>
                  <span className="font-bold w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-500 hover:text-green-500"><Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-50 shadow-[0_-10px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-gray-400">Total Item</span>
            <span className="font-black text-gray-800">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-black text-2xl text-gray-800">Total</span>
            <span className={`font-black text-3xl ${thm.text}`}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-4.5 rounded-2xl font-black text-lg text-white shadow-xl transition-all transform active:scale-95 ${cart.length === 0 ? 'bg-gray-200 shadow-none cursor-not-allowed text-gray-400' : `${thm.primary} ${thm.hover} hover:-translate-y-1`}`}
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
  const [cash, setCash] = useState('');
  const [method, setMethod] = useState('Tunai');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleProcess = () => {
    if (method === 'Tunai') {
      const cashVal = parseInt(cash.replace(/\D/g, '')) || 0;
      if (cashVal < subtotal) return alert('Uang kurang!');
      onProcess({ method, cash: cashVal, change: cashVal - subtotal, customerName: '-' });
    } else if (method === 'QRIS') {
      onProcess({ method, cash: subtotal, change: 0, customerName: '-' });
    } else if (method === 'Kasbon') {
      if (!selectedCustomer) return alert('Pilih pelanggan untuk kasbon!');
      onProcess({ method, cash: 0, change: 0, customerName: selectedCustomer });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fadeIn">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-fadeInUp border border-gray-100">
        <div className={`p-8 ${thm.primary} text-white text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Total Tagihan</h3>
          <div className="text-5xl font-black tracking-tight">Rp {subtotal.toLocaleString('id-ID')}</div>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3">
              {['Tunai', 'QRIS', 'Kasbon'].map(m => (
                <button 
                  key={m} onClick={() => setMethod(m)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all border-none ${method === m ? `${thm.primary} text-white shadow-lg` : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {method === 'Tunai' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Terima Uang</label>
              <input 
                type="text" autoFocus value={cash}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCash(val ? parseInt(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className="w-full text-right text-3xl font-black p-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 transition-all outline-none text-gray-800"
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <button onClick={() => setCash(subtotal.toLocaleString('id-ID'))} className="py-2.5 rounded-xl font-bold text-sm bg-green-50 text-green-600 border border-green-100">Uang Pas</button>
                 <button onClick={() => setCash('100.000')} className="py-2.5 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent">Rp 100.000</button>
              </div>
            </div>
          )}

          {method === 'Kasbon' && (
            <div className="animate-fadeIn">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Pelanggan (Wajib)</label>
               <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium text-gray-700 appearance-none">
                 <option value="">-- Pilih Nama Pelanggan --</option>
                 {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>)}
               </select>
            </div>
          )}

          <div className="flex space-x-4 pt-4 border-t border-gray-50">
            <button onClick={onClose} className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors">Batal</button>
            <button onClick={handleProcess} className={`flex-1 py-4 ${thm.primary} text-white font-black rounded-2xl ${thm.hover} shadow-lg transition-transform transform active:scale-95`}>Proses Bayar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ transaction, settings, onClose, thm }) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:block animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-fadeInUp border border-gray-100 overflow-hidden">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-50 bg-gray-50/50 print:hidden">
          <h3 className="font-black text-gray-800">Preview Struk</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-lg shadow-sm"><X size={20}/></button>
        </div>

        <div className="p-8 overflow-y-auto print:p-0 font-mono text-sm text-gray-800 bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest">{settings.storeName}</h2>
            <p className="text-xs text-gray-500 whitespace-pre-wrap mt-1 font-sans">{settings.address}</p>
            <p className="text-xs text-gray-500 font-sans">{settings.phone}</p>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-3 text-xs space-y-1">
            <div className="flex justify-between"><span>No:</span><span className="font-bold">{transaction.id}</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>{new Date(transaction.date).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span>{transaction.cashier}</span></div>
            <div className="flex justify-between"><span>Metode:</span><span className="font-bold">{transaction.paymentMethod}</span></div>
            {transaction.paymentMethod === 'Kasbon' && <div className="flex justify-between text-red-500"><span>Pelanggan:</span><span className="font-bold">{transaction.customerName}</span></div>}
          </div>

          <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-3 space-y-2">
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

          <div className="space-y-1.5 mb-8 text-sm">
            <div className="flex justify-between text-lg font-black mt-2 pt-2">
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
              <div className="text-center mt-4 bg-gray-100 p-2 rounded text-xs font-bold uppercase tracking-wider">Status: Belum Lunas</div>
            )}
          </div>

          <div className="text-center text-xs font-bold text-gray-400 italic">
            *** Terima Kasih ***
          </div>
        </div>

        <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex space-x-3 print:hidden">
          <button onClick={onClose} className="flex-1 py-3.5 bg-white text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition shadow-sm border border-gray-200">Selesai</button>
          <button onClick={() => window.print()} className={`flex-1 flex items-center justify-center py-3.5 ${thm.primary} text-white font-bold rounded-2xl ${thm.hover} transition shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transform`}>
            <Printer size={18} className="mr-2" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CUSTOMERS & DEBTS VIEWS
// ==========================================

function CustomersView({ customers, setCustomers, thm }) {
  const [showAdd, setShowAdd] = useState(false);
  const handleSave = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setCustomers([{ id: 'CUST-'+Date.now(), name: data.get('name'), phone: data.get('phone'), address: data.get('address') }, ...customers]);
    setShowAdd(false);
  };
  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Data Pelanggan</h2>
        <button onClick={() => setShowAdd(true)} className={`${thm.primary} text-white px-5 py-3 rounded-2xl flex items-center font-bold shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transition-transform`}><Plus size={18} className="mr-2"/> Tambah Pelanggan</button>
      </div>
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-5">Nama Pelanggan</th><th className="p-5">No. HP</th><th className="p-5">Alamat</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map(c => <tr key={c.id} className="hover:bg-gray-50/50 transition-colors"><td className="p-5 font-bold text-gray-800">{c.name}</td><td className="p-5 font-medium text-gray-600">{c.phone}</td><td className="p-5 text-gray-500 text-sm">{c.address}</td></tr>)}
            {customers.length === 0 && <tr><td colSpan="3" className="p-10 text-center text-gray-400 font-medium">Belum ada data pelanggan.</td></tr>}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 border border-gray-100">
            <h3 className="font-black text-2xl text-gray-800 mb-6">Tambah Pelanggan</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required name="name" placeholder="Nama Lengkap" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
              <input required name="phone" placeholder="No. WhatsApp" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
              <textarea name="address" placeholder="Alamat" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" rows="3" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl">Batal</button>
                <button type="submit" className={`flex-1 py-4 ${thm.primary} text-white font-black rounded-2xl`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsView({ transactions, setTransactions, thm }) {
  const debts = transactions.filter(t => t.paymentMethod === 'Kasbon');
  const payDebt = (id) => {
    if(window.confirm('Tandai hutang ini sebagai LUNAS?')) {
      setTransactions(transactions.map(t => t.id === id ? { ...t, paymentStatus: 'Lunas' } : t));
    }
  };
  return (
    <div className="p-8 animate-fadeIn">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Buku Kasbon / Piutang</h2>
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-5">Tanggal</th><th className="p-5">Pelanggan</th><th className="p-5">Nominal</th><th className="p-5">Status</th><th className="p-5 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {debts.map(d => (
              <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 text-sm font-medium text-gray-500">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                <td className="p-5 font-bold text-gray-800">{d.customerName}</td>
                <td className="p-5 font-black text-gray-800">Rp {d.total.toLocaleString('id-ID')}</td>
                <td className="p-5"><span className={`px-3 py-1 text-xs font-bold rounded-xl ${d.paymentStatus === 'Lunas' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{d.paymentStatus}</span></td>
                <td className="p-5 text-center">
                  {d.paymentStatus !== 'Lunas' && <button onClick={() => payDebt(d.id)} className={`px-4 py-2 ${thm.primary} text-white font-bold rounded-xl text-xs hover:opacity-90`}>Lunas!</button>}
                </td>
              </tr>
            ))}
            {debts.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">Tidak ada catatan kasbon.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// INVENTORY, HISTORY & SETTINGS VIEWS
// ==========================================
// (Using the modern outline-less styles)

function InventoryView({ products, setProducts, thm }) {
  const [showAdd, setShowAdd] = useState(false);
  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setProducts([{ id: 'PRD-'+Date.now(), name: fd.get('name'), stock: parseInt(fd.get('stock')), category: fd.get('category'), buyPriceBox: parseInt(fd.get('buyPriceBox')), buyPriceUnit: parseInt(fd.get('buyPriceUnit')), sellPrice: parseInt(fd.get('sellPrice')) }, ...products]);
    setShowAdd(false);
  };
  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Manajemen Inventaris</h2>
        <button onClick={() => setShowAdd(true)} className={`${thm.primary} text-white px-5 py-3 rounded-2xl flex items-center font-bold shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transition-transform`}><Plus size={18} className="mr-2"/> Tambah Produk</button>
      </div>
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-5">Produk</th><th className="p-5">Stok</th><th className="p-5">H. Modal</th><th className="p-5">H. Jual</th><th className="p-5 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 font-bold text-gray-800">{p.name} <span className="block text-xs font-medium text-gray-400 mt-0.5">{p.category}</span></td>
                <td className="p-5"><span className={`px-3 py-1 rounded-xl text-xs font-bold ${p.stock <= 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.stock}</span></td>
                <td className="p-5 font-medium text-gray-500">Rp {p.buyPriceUnit.toLocaleString('id-ID')}</td>
                <td className="p-5 font-black text-gray-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                <td className="p-5 text-center"><button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 border border-gray-100">
            <h3 className="font-black text-2xl text-gray-800 mb-6">Tambah Produk</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required name="name" placeholder="Nama Produk" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="category" placeholder="Kategori" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
                <input required type="number" name="stock" placeholder="Stok" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
                <input required type="number" name="buyPriceBox" placeholder="Modal Perdus" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
                <input required type="number" name="buyPriceUnit" placeholder="Modal Satuan" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium" />
              </div>
              <input required type="number" name="sellPrice" placeholder="Harga Jual" className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-black text-lg text-gray-800" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl">Batal</button>
                <button type="submit" className={`flex-1 py-4 ${thm.primary} text-white font-black rounded-2xl`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryView({ transactions, settings, thm }) {
  const [selectedTx, setSelectedTx] = useState(null);
  return (
    <div className="p-8 animate-fadeIn">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Riwayat Transaksi</h2>
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
            <tr><th className="p-5">Waktu</th><th className="p-5">ID Transaksi</th><th className="p-5">Metode</th><th className="p-5">Total</th><th className="p-5 text-center">Struk</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 font-medium text-sm text-gray-500">{new Date(tx.date).toLocaleString('id-ID')}</td>
                <td className="p-5 font-bold text-gray-800 text-sm">{tx.id}</td>
                <td className="p-5 font-bold text-gray-500 text-sm">{tx.paymentMethod}</td>
                <td className="p-5 font-black text-gray-800">Rp {tx.total.toLocaleString('id-ID')}</td>
                <td className="p-5 text-center"><button onClick={() => setSelectedTx(tx)} className={`p-2 bg-gray-50 rounded-xl ${thm.text} hover:bg-gray-100 transition`}><FileText size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedTx && <ReceiptModal transaction={selectedTx} settings={settings} onClose={() => setSelectedTx(null)} thm={thm} />}
    </div>
  );
}

function SettingsView({ settings, setSettings, themeColors, thm }) {
  const [formData, setFormData] = useState(settings);
  const handleSubmit = (e) => { e.preventDefault(); setSettings(formData); alert('Tersimpan!'); };
  return (
    <div className="p-8 max-w-3xl animate-fadeIn">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Pengaturan Toko</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 p-8 space-y-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profil Usaha</h3>
          <div className="grid grid-cols-2 gap-5">
            <input required value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-bold text-gray-800" placeholder="Nama Toko" />
            <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium text-gray-800" placeholder="No WhatsApp" />
            <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2 w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-medium text-gray-800" placeholder="Alamat (Untuk Struk)" rows="2" />
            <input required value={formData.cashierName} onChange={e => setFormData({...formData, cashierName: e.target.value})} className="col-span-2 w-full p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-[#867233]/30 outline-none font-bold text-gray-800" placeholder="Nama Admin" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pengaturan Printer Bluetooth</h3>
          <div className="grid grid-cols-2 gap-5">
             <select value={formData.printerType} onChange={e => setFormData({...formData, printerType: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#867233]/30 outline-none font-bold text-gray-700">
               <option value="bluetooth">Bluetooth Thermal</option>
               <option value="usb">USB Printer</option>
             </select>
             <select value={formData.paperSize} onChange={e => setFormData({...formData, paperSize: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#867233]/30 outline-none font-bold text-gray-700">
               <option value="58mm">Kertas 58mm</option>
               <option value="80mm">Kertas 80mm</option>
             </select>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Warna Tema</h3>
          <div className="flex space-x-4">
            {Object.keys(themeColors).map(color => (
              <button type="button" key={color} onClick={() => setFormData({...formData, themeColor: color})} className={`w-14 h-14 rounded-2xl ${themeColors[color].primary} flex items-center justify-center transform transition-all hover:scale-110 shadow-md ${formData.themeColor === color ? 'ring-4 ring-offset-2 ring-gray-200 scale-110' : ''}`}>
                {formData.themeColor === color && <CheckCircle className="text-white" size={24} />}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className={`w-full py-4 ${thm.primary} text-white font-black rounded-2xl shadow-lg shadow-[#867233]/20 hover:-translate-y-1 transform transition-all active:scale-95`}>Simpan Pengaturan</button>
      </form>
    </div>
  );
}