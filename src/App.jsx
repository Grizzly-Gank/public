import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Home, ShoppingCart, Package, FileText, Settings as SettingsIcon, 
  LogOut, Plus, Minus, Trash2, Search, ScanLine, Printer, Download,
  ChevronRight, Calendar, DollarSign, TrendingUp, CheckCircle, Upload
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
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('pos_logged_in', false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [products, setProducts] = useLocalStorage('pos_products', [
    { id: '1', name: 'Nasi Gudeg Spesial', stock: 50, buyPriceBox: 100000, buyPriceUnit: 10000, sellPrice: 15000, category: 'Makanan' },
    { id: '2', name: 'Es Teh Manis', stock: 100, buyPriceBox: 20000, buyPriceUnit: 2000, sellPrice: 5000, category: 'Minuman' },
    { id: '3', name: 'Keripik Singkong', stock: 30, buyPriceBox: 50000, buyPriceUnit: 5000, sellPrice: 8000, category: 'Cemilan' },
    { id: '4', name: 'Soto Ayam', stock: 25, buyPriceBox: 120000, buyPriceUnit: 12000, sellPrice: 18000, category: 'Makanan' },
  ]);
  const [transactions, setTransactions] = useLocalStorage('pos_transactions', []);
  const [settings, setSettings] = useLocalStorage('pos_settings', {
    storeName: 'Toko Kasir Pro',
    address: 'Jl. Merdeka No. 45, Jakarta',
    phone: '081234567890',
    cashierName: 'Admin Utama',
    themeColor: 'green'
  });

  // --- THEME CONFIG ---
  const themeColors = {
    green: { primary: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', border: 'border-green-600', light: 'bg-green-50' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-50' },
    red: { primary: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', border: 'border-red-600', light: 'bg-red-50' },
    dark: { primary: 'bg-gray-800', hover: 'hover:bg-gray-900', text: 'text-gray-800', border: 'border-gray-800', light: 'bg-gray-200' },
  };
  const thm = themeColors[settings.themeColor] || themeColors.green;

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPERS ---
  const formatRp = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');
  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // --- RENDERERS ---
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} thm={thm} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar (Hidden by default, slides in) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`text-xl font-bold ${thm.text}`}>POS Admin</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: <Home size={20}/>, label: 'Dashboard' },
            { id: 'pos', icon: <ShoppingCart size={20}/>, label: 'Mesin Kasir (POS)' },
            { id: 'inventory', icon: <Package size={20}/>, label: 'Manajemen Inventaris' },
            { id: 'history', icon: <FileText size={20}/>, label: 'Riwayat Transaksi' },
            { id: 'settings', icon: <SettingsIcon size={20}/>, label: 'Pengaturan Toko' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === item.id ? `${thm.primary} text-white` : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay when sidebar open */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:bg-white">
        {/* Header (Hidden in Print) */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 z-10 print:hidden">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu size={24} className="text-gray-700" />
            </button>
            <h1 className={`text-xl font-bold ${thm.text} hidden sm:block`}>{settings.storeName}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{formatTime(currentTime)}</p>
              <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
            </div>
            <div className={`h-10 w-10 rounded-full ${thm.primary} flex items-center justify-center text-white font-bold shadow-md`}>
              {settings.cashierName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-auto bg-gray-50 print:bg-white print:overflow-visible relative">
          {activeTab === 'dashboard' && <DashboardView transactions={transactions} thm={thm} />}
          {activeTab === 'pos' && <POSView products={products} setProducts={setProducts} setTransactions={setTransactions} settings={settings} thm={thm} />}
          {activeTab === 'inventory' && <InventoryView products={products} setProducts={setProducts} thm={thm} />}
          {activeTab === 'history' && <HistoryView transactions={transactions} settings={settings} thm={thm} />}
          {activeTab === 'settings' && <SettingsView settings={settings} setSettings={setSettings} themeColors={themeColors} thm={thm} />}
        </main>
      </div>
    </div>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto ${thm.primary} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
            <ShoppingCart size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">POS Kasir Pro</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk ke sistem manajemen toko Anda</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email (Spreadsheet)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              placeholder="Masukkan sandi"
            />
          </div>
          {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}
          <button 
            type="submit" 
            className={`w-full ${thm.primary} ${thm.hover} text-white font-bold py-3 rounded-xl shadow-md transition-colors`}
          >
            Masuk
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          Terkoneksi dengan Google Sheet API & Drive Backup<br/>
          (Versi LocalStorage Deploy Ready)
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW
// ==========================================
function DashboardView({ transactions, thm }) {
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

  // Chart data (Last 7 days)
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

  const maxChartVal = Math.max(...chartData.map(d => d.total), 1); // avoid div by 0

  return (
    <div className="p-6 animate-fadeIn print:hidden">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-full ${thm.light} ${thm.text}`}><Calendar size={24} /></div>
            <h3 className="text-lg font-bold text-gray-700">Hari Ini</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-gray-500">Penjualan</span><span className="text-2xl font-bold text-gray-800">Rp {todayStats.revenue.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500">Barang Terjual</span><span className="font-semibold text-gray-700">{todayStats.items} Item</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="text-gray-500 font-medium">Margin / Laba</span><span className="font-bold text-green-500">Rp {todayStats.margin.toLocaleString('id-ID')}</span></div>
          </div>
        </div>

        {/* Month Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-full ${thm.light} ${thm.text}`}><TrendingUp size={24} /></div>
            <h3 className="text-lg font-bold text-gray-700">Bulan Ini</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-gray-500">Penjualan</span><span className="text-2xl font-bold text-gray-800">Rp {monthStats.revenue.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500">Barang Terjual</span><span className="font-semibold text-gray-700">{monthStats.items} Item</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="text-gray-500 font-medium">Margin / Laba</span><span className="font-bold text-green-500">Rp {monthStats.margin.toLocaleString('id-ID')}</span></div>
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-700 mb-6">Grafik Penjualan (7 Hari Terakhir)</h3>
        <div className="space-y-4">
          {chartData.map((data, idx) => (
            <div key={idx} className="flex items-center">
              <span className="w-12 text-sm font-medium text-gray-500">{data.day}</span>
              <div className="flex-1 ml-4 bg-gray-100 rounded-full h-4 overflow-hidden flex items-center">
                <div 
                  className={`h-full ${thm.primary} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${(data.total / maxChartVal) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right text-sm font-bold text-gray-700">Rp {data.total.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. POS VIEW (KASIR)
// ==========================================
function POSView({ products, setProducts, setTransactions, settings, thm }) {
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
        if (newQty > item.stock) return item; // Max stock check
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);
  
  // Camera simulation
  const handleScanClick = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCamPermissionMsg('Kamera diizinkan. Scanner aktif (Simulasi).');
      setTimeout(() => setCamPermissionMsg(''), 3000);
    } catch (err) {
      setCamPermissionMsg('Izin kamera ditolak atau tidak ada kamera.');
      setTimeout(() => setCamPermissionMsg(''), 3000);
    }
  };

  // Checkout Modal logic
  const processCheckout = (cashAmount) => {
    if (cashAmount < subtotal) return alert('Uang kurang!');
    
    const newTx = {
      id: 'TRX-' + Date.now(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: subtotal,
      total: subtotal, // PPN is removed for simplicity based on settings request
      cash: cashAmount,
      change: cashAmount - subtotal,
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
    <div className="flex h-full print:block print:h-auto">
      {/* Left Area - Products (Hidden on print) */}
      <div className="flex-1 flex flex-col bg-gray-50 border-r print:hidden">
        {/* Search Bar */}
        <div className="p-4 bg-white shadow-sm z-10 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
            <button onClick={handleScanClick} className={`absolute right-2 top-2 p-1.5 rounded-lg ${thm.light} ${thm.text} hover:opacity-80 transition`}>
              <ScanLine size={20} />
            </button>
          </div>
        </div>
        {camPermissionMsg && <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium">{camPermissionMsg}</div>}

        {/* Product List Ribbon View */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer" onClick={() => addToCart(product)}>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">{product.name}</span>
                <span className="text-sm text-gray-500 mt-1">Stok: <span className={product.stock > 10 ? 'text-green-600 font-medium' : 'text-red-500 font-bold'}>{product.stock}</span></span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold ${thm.text}`}>Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className={`p-2 rounded-full ${thm.light} ${thm.text} hover:bg-opacity-80`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400">Produk tidak ditemukan.</div>
          )}
        </div>
      </div>

      {/* Right Area - Cart (Hidden on print) */}
      <div className="w-96 bg-white flex flex-col shadow-lg z-20 print:hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Keranjang</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-red-500 text-sm flex items-center hover:bg-red-50 px-2 py-1 rounded">
              <Trash2 size={16} className="mr-1"/> Kosongkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Belum ada produk di keranjang.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <div className="text-gray-500 text-xs">Rp {item.sellPrice.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 border">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1 rounded bg-white shadow-sm text-gray-600 hover:text-red-500"><Minus size={16}/></button>
                  <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1 rounded bg-white shadow-sm text-gray-600 hover:text-green-500"><Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between mb-2 text-gray-600">
            <span>Total Item</span>
            <span className="font-medium">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="font-bold text-xl text-gray-800">Total</span>
            <span className={`font-bold text-xl ${thm.text}`}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform transform active:scale-95 ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : `${thm.primary} ${thm.hover}`}`}
          >
            Bayar
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal 
          subtotal={subtotal} 
          onClose={() => setShowCheckout(false)} 
          onProcess={processCheckout} 
          thm={thm}
        />
      )}

      {/* Receipt Preview Modal / Print Area */}
      {showReceipt && (
        <ReceiptModal 
          transaction={lastTransaction} 
          settings={settings}
          onClose={() => setShowReceipt(false)} 
          thm={thm}
        />
      )}
    </div>
  );
}

function CheckoutModal({ subtotal, onClose, onProcess, thm }) {
  const [cash, setCash] = useState('');

  // Cash suggestions logic
  const suggestions = useMemo(() => {
    const list = [subtotal]; // Exact
    const commonBills = [50000, 100000];
    
    // Find nearest 10k, 50k, 100k
    const nearest10k = Math.ceil(subtotal / 10000) * 10000;
    const nearest50k = Math.ceil(subtotal / 50000) * 50000;

    if (nearest10k > subtotal && !list.includes(nearest10k)) list.push(nearest10k);
    if (nearest50k > subtotal && !list.includes(nearest50k)) list.push(nearest50k);
    
    commonBills.forEach(bill => {
      if (bill > subtotal && !list.includes(bill)) list.push(bill);
    });

    return list.sort((a,b) => a - b).slice(0, 4); // Max 4 buttons
  }, [subtotal]);

  const handleProcess = () => {
    const cashVal = parseInt(cash.replace(/\D/g, '')) || 0;
    onProcess(cashVal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeInDown">
        <div className={`p-6 ${thm.primary} text-white text-center`}>
          <h3 className="text-lg font-medium opacity-80">Total Tagihan</h3>
          <div className="text-4xl font-bold mt-2">Rp {subtotal.toLocaleString('id-ID')}</div>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Terima Uang</label>
          <input 
            type="text" 
            autoFocus
            value={cash}
            onChange={(e) => {
              // Basic numeric format
              const val = e.target.value.replace(/\D/g, '');
              setCash(val ? parseInt(val).toLocaleString('id-ID') : '');
            }}
            placeholder="0"
            className="w-full text-right text-2xl font-bold p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mb-4"
          />

          <div className="grid grid-cols-2 gap-3 mb-6">
            {suggestions.map((sug, idx) => (
              <button 
                key={idx}
                onClick={() => setCash(sug.toLocaleString('id-ID'))}
                className={`py-2 px-4 rounded-lg border-2 ${idx === 0 ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-200 text-gray-700 hover:border-gray-300'} font-bold transition-colors`}
              >
                {idx === 0 ? 'Uang Pas' : `Rp ${sug.toLocaleString('id-ID')}`}
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
            <button 
              onClick={handleProcess} 
              className={`flex-1 py-3 ${thm.primary} text-white font-bold rounded-xl ${thm.hover} transition-colors`}
            >
              Proses Bayar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ transaction, settings, onClose, thm }) {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-fadeInUp">
        
        {/* Receipt Header (Hidden on screen UI, shown in print) */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h3 className="font-bold text-lg">Preview Struk</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        {/* Scrollable Printable Area */}
        <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible font-mono text-sm text-gray-800" ref={printRef} id="receipt-print-area">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase">{settings.storeName}</h2>
            <p className="text-xs text-gray-500 whitespace-pre-wrap">{settings.address}</p>
            <p className="text-xs text-gray-500">{settings.phone}</p>
          </div>
          
          <div className="border-b border-dashed border-gray-300 pb-2 mb-2 text-xs">
            <div className="flex justify-between"><span>No:</span><span>{transaction.id}</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>{new Date(transaction.date).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span>{transaction.cashier}</span></div>
          </div>

          <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
            {transaction.items.map(item => (
              <div key={item.id} className="mb-2">
                <div className="font-semibold">{item.name}</div>
                <div className="flex justify-between text-xs">
                  <span>{item.qty} x {item.sellPrice.toLocaleString('id-ID')}</span>
                  <span>{(item.qty * item.sellPrice).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-6 text-sm font-bold">
            <div className="flex justify-between text-lg">
              <span>TOTAL</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-normal">
              <span>Tunai</span>
              <span>Rp {transaction.cash.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-normal">
              <span>Kembali</span>
              <span>Rp {transaction.change.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 italic">
            Terima kasih atas kunjungan Anda!
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="p-4 bg-gray-50 border-t flex space-x-3 print:hidden">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Selesai / Kembali
          </button>
          <button 
            onClick={handlePrint} 
            className={`flex-1 flex items-center justify-center py-3 ${thm.primary} text-white font-bold rounded-xl ${thm.hover} transition shadow-md`}
          >
            <Printer size={20} className="mr-2" /> Cetak Struk
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
    if(window.confirm('Hapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
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

    if (editingProd) {
      setProducts(products.map(p => p.id === prod.id ? prod : p));
    } else {
      setProducts([prod, ...products]);
    }
    setShowAdd(false);
    setEditingProd(null);
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      // Basic CSV parsing simulation
      alert('Simulasi Import Spreadsheet Berhasil!\nDalam mode deploy Vercel/Netlify, ini akan membaca file .csv dan memperbarui state array produk.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 animate-fadeIn print:hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Inventaris</h2>
        <div className="flex space-x-3">
          <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl flex items-center hover:bg-gray-50 transition shadow-sm font-medium">
            <Upload size={18} className="mr-2"/> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </label>
          <button 
            onClick={() => { setEditingProd(null); setShowAdd(true); }}
            className={`${thm.primary} text-white px-4 py-2 rounded-xl flex items-center shadow-md ${thm.hover} transition font-bold`}
          >
            <Plus size={18} className="mr-1"/> Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold">Nama Produk</th>
                <th className="p-4 font-semibold text-center">Stok</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold text-right">Harga Beli (Satuan)</th>
                <th className="p-4 font-semibold text-right">Harga Jual</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock <= 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{p.category}</td>
                  <td className="p-4 text-right text-gray-600 text-sm">Rp {p.buyPriceUnit.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right font-bold text-gray-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => { setEditingProd(p); setShowAdd(true); }} className={`text-blue-500 hover:text-blue-700 mr-3`}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">Hapus</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada produk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeInUp">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingProd ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400"><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input required name="name" defaultValue={editingProd?.name} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input required name="category" defaultValue={editingProd?.category} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                  <input required type="number" name="stock" defaultValue={editingProd?.stock} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Per Dus)</label>
                  <input required type="number" name="buyPriceBox" defaultValue={editingProd?.buyPriceBox} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Satuan)</label>
                  <input required type="number" name="buyPriceUnit" defaultValue={editingProd?.buyPriceUnit} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input required type="number" name="sellPrice" defaultValue={editingProd?.sellPrice} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                <button type="submit" className={`px-5 py-2.5 ${thm.primary} text-white font-bold rounded-xl ${thm.hover}`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. HISTORY VIEW
// ==========================================
function HistoryView({ transactions, settings, thm }) {
  // Max 3 years calculation
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
    let csv = 'ID Transaksi,Tanggal,Total Tagihan,Metode,Kasir,Daftar Barang\n';
    filteredTx.forEach(tx => {
      const items = tx.items.map(i => `${i.name} (${i.qty})`).join(' | ');
      csv += `"${tx.id}","${new Date(tx.date).toLocaleString('id-ID')}","${tx.total}","Cash","${tx.cashier}","${items}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Riwayat_Transaksi_${startDate}_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="p-6 animate-fadeIn print:hidden">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <p className="text-gray-500 text-sm mt-1">Total {filteredTx.length} transaksi (Rp {totalNominal.toLocaleString('id-ID')})</p>
        </div>
        <button 
          onClick={downloadExcel}
          className={`${thm.primary} text-white px-4 py-2.5 rounded-xl flex items-center shadow-md ${thm.hover} transition font-bold`}
        >
          <Download size={18} className="mr-2"/> Download Laporan (.csv)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600">Dari:</label>
          <input 
            type="date" 
            min={threeYearsAgo.toISOString().split('T')[0]}
            max={today.toISOString().split('T')[0]}
            value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border p-2 rounded-lg outline-none focus:border-green-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600">Sampai:</label>
          <input 
            type="date" 
            min={startDate}
            max={today.toISOString().split('T')[0]}
            value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border p-2 rounded-lg outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 font-semibold">Waktu</th>
              <th className="p-4 font-semibold">ID Transaksi</th>
              <th className="p-4 font-semibold">Item</th>
              <th className="p-4 font-semibold text-right">Total</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map(tx => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4 text-sm text-gray-700">{new Date(tx.date).toLocaleString('id-ID')}</td>
                <td className="p-4 font-medium text-gray-800 text-sm">{tx.id}</td>
                <td className="p-4 text-sm text-gray-600">{tx.items.length} macam</td>
                <td className="p-4 text-right font-bold text-gray-800">Rp {tx.total.toLocaleString('id-ID')}</td>
                <td className="p-4 text-center">
                  <button onClick={() => setSelectedTx(tx)} className={`text-sm ${thm.text} font-medium flex items-center justify-center mx-auto hover:opacity-80`}>
                    <FileText size={16} className="mr-1"/> Lihat Struk
                  </button>
                </td>
              </tr>
            ))}
            {filteredTx.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">Tidak ada transaksi di rentang tanggal ini.</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedTx && (
        <ReceiptModal 
          transaction={selectedTx} 
          settings={settings}
          onClose={() => setSelectedTx(null)} 
          thm={thm}
        />
      )}
    </div>
  );
}

// ==========================================
// 6. SETTINGS VIEW
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
    <div className="p-6 max-w-3xl animate-fadeIn print:hidden">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Toko</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        <div>
          <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Profil Usaha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input required value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone (WhatsApp)</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Toko (Struk)</label>
              <textarea rows="2" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kasir Saat Ini</label>
              <input required value={formData.cashierName} onChange={e => setFormData({...formData, cashierName: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Nama ini akan tercetak di struk alih-alih username login.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Tema Aplikasi UI/UX</h3>
          <div className="flex space-x-4">
            {Object.keys(themeColors).map(colorKey => (
              <label key={colorKey} className="flex flex-col items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value={colorKey}
                  checked={formData.themeColor === colorKey}
                  onChange={e => setFormData({...formData, themeColor: e.target.value})}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-full ${themeColors[colorKey].primary} flex items-center justify-center border-4 ${formData.themeColor === colorKey ? 'border-gray-800 scale-110 shadow-lg' : 'border-transparent'}`}>
                  {formData.themeColor === colorKey && <CheckCircle className="text-white" size={20} />}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-600 capitalize">{colorKey}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-end">
          {savedMsg && <span className="text-green-600 font-medium mr-4 flex items-center"><CheckCircle size={18} className="mr-1"/> Pengaturan Disimpan!</span>}
          <button type="submit" className={`px-8 py-3 ${thm.primary} text-white font-bold rounded-xl shadow-lg ${thm.hover} transition-transform transform active:scale-95`}>
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}