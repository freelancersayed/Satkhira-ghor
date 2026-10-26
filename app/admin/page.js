'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database,
  Eye,
  Filter,
  DollarSign,
  TrendingUp,
  Printer,
  Star,
  Tag,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Bell,
  Send,
  ShieldCheck,
  Check,
  X,
  Layers,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import OrderInvoiceModal from '@/components/admin/OrderInvoiceModal';
import ImageUploadInput from '@/components/common/ImageUploadInput';
import CourierFraudBadge from '@/components/admin/CourierFraudBadge';
import CustomerSecurityCard from '@/components/admin/CustomerSecurityCard';
import SalesAnalyticsChart from '@/components/admin/SalesAnalyticsChart';
import SalesReportView from '@/components/admin/SalesReportView';
import CustomerCRMView from '@/components/admin/CustomerCRMView';
import CouponsAndCartView from '@/components/admin/CouponsAndCartView';
import BulkProductUploadModal from '@/components/admin/BulkProductUploadModal';
import ProductVariationEditor from '@/components/admin/ProductVariationEditor';
import {
  initAudioOnUserGesture,
  playCashRegisterSound,
  setMuted,
  isMuted,
} from '@/lib/audioAlert';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout, checkAuth } = useAuthStore();

  // Navigation tab: 'overview' | 'products' | 'orders' | 'reports' | 'crm' | 'marketing' | 'reviews'
  const [activeTab, setActiveTab] = useState('overview');

  // Audio & Notification state
  const [audioMuted, setAudioMuted] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null); // Floating push notification toast

  // Analytics Stats state
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Product Form state (with variation matrix)
  const [productFormData, setProductFormData] = useState({
    name: '',
    nameEn: '',
    category: 'honey',
    categoryName: 'সুন্দরবনের মধু',
    price: '',
    originalPrice: '',
    unit: '১ কেজি (1 kg)',
    stock: 20,
    badge: '',
    badgeType: 'forest',
    image: '',
    shortDescription: '',
    description: '',
    hasVariations: false,
    variations: [],
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [bookingCourierLoading, setBookingCourierLoading] = useState(false);

  // Reviews state
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingAdminReviews, setLoadingAdminReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');

  // General Action feedback
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Live polling tracker
  const lastPolledRef = useRef(new Date().toISOString());

  // Role check helpers
  const isPrivileged = user && ['admin', 'manager', 'staff'].includes(user.role);
  const isManagerOrAdmin = user && ['admin', 'manager'].includes(user.role);
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    checkAuth();
    // Initialize audio context on first user click/interaction
    initAudioOnUserGesture();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!isPrivileged) {
        router.push('/my-orders');
      } else {
        loadDashboardData();
      }
    }
  }, [user, isLoading, router]);

  // Real-time Live Orders Poller (1 to 2.5-second latency pipeline)
  useEffect(() => {
    if (!user || !isPrivileged) return;

    const interval = setInterval(async () => {
      try {
        const since = lastPolledRef.current;
        const res = await fetch(`/api/admin/live-orders?since=${encodeURIComponent(since)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.serverTime) {
            lastPolledRef.current = data.serverTime;
          }

          if (data.newOrders && data.newOrders.length > 0) {
            // New orders received in real-time!
            const incoming = data.newOrders;

            // 1. Play Cash Register Chime Audio
            playCashRegisterSound();

            // 2. Prepend dynamically to top of Orders state
            setOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o._id));
              const uniqueNew = incoming.filter((o) => !existingIds.has(o._id));
              return [...uniqueNew, ...prev];
            });

            // 3. Trigger modern push toast alert
            const latest = incoming[0];
            setNewOrderAlert({
              orderNumber: latest.orderNumber,
              customerName: latest.customer?.name || 'নতুন ক্রেতা',
              phone: latest.customer?.phone || '',
              totalAmount: latest.totalAmount,
              fraudRisk: latest.fraudRisk,
              itemsCount: latest.items?.length || 1,
            });

            // 4. Silently refresh stats
            fetchStats();
          }
        }
      } catch (err) {
        // network silent fallback
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [user, isPrivileged]);

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  const handleToggleMute = () => {
    const nextState = !audioMuted;
    setAudioMuted(nextState);
    setMuted(nextState);
    if (!nextState) {
      playCashRegisterSound();
    }
  };

  const loadDashboardData = async () => {
    await Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchAdminReviews()]);
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (e) {
      console.error('Fetch stats failed:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products?limit=150');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Fetch products failed:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders?limit=150');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Fetch orders failed:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAdminReviews = async () => {
    try {
      setLoadingAdminReviews(true);
      const res = await fetch('/api/reviews?all=true');
      if (res.ok) {
        const data = await res.json();
        setAdminReviews(data.reviews || []);
      }
    } catch (e) {
      console.error('Fetch reviews failed:', e);
    } finally {
      setLoadingAdminReviews(false);
    }
  };

  // Seed / Initialize Database
  const handleSeedDatabase = async () => {
    if (!confirm('আপনি কি ডাটাবেজে প্রাথমিক পণ্য ও অ্যাডমিন সিড করতে চান?')) return;
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'success');
        loadDashboardData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (e) {
      showNotification('সিড করতে সমস্যা হয়েছে: ' + e.message, 'error');
    }
  };

  // One-click Parcel Booking to Couriers (Steadfast / Pathao)
  const handleBookCourier = async (orderId) => {
    try {
      setBookingCourierLoading(true);
      const res = await fetch(`/api/orders/${orderId}/book-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName: 'Steadfast Courier' }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'success');
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails(data.order);
        }
        fetchOrders();
        fetchStats();
      } else {
        showNotification(data.message || 'বুকিং ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      showNotification('কুরিয়ার বুকিং এরর: ' + err.message, 'error');
    } finally {
      setBookingCourierLoading(false);
    }
  };

  // Product Save (Create or Update with variation matrix)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingProduct;
      const url = isEdit
        ? `/api/products/${editingProduct._id || editingProduct.id}`
        : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি');
      }

      showNotification(data.message, 'success');
      setProductModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
      fetchStats();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name || '',
      nameEn: prod.nameEn || '',
      category: prod.category || 'honey',
      categoryName: prod.categoryName || 'সুন্দরবনের মধু',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      unit: prod.unit || '১ কেজি (1 kg)',
      stock: prod.stock !== undefined ? prod.stock : 20,
      badge: prod.badge || '',
      badgeType: prod.badgeType || 'forest',
      image: prod.image || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      hasVariations: !!prod.hasVariations,
      variations: prod.variations || [],
    });
    setProductModalOpen(true);
  };

  // Delete Product
  const handleDeleteProduct = async (prodId, prodName) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${prodName}" পণ্যটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে', 'success');
        fetchProducts();
        fetchStats();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('পণ্য মুছতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  // Update Order Status (including Hold, Processing, Shipped, Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`অর্ডার স্ট্যাটাস "${newStatus}" এ পরিবর্তন করা হয়েছে`, 'success');
        fetchOrders();
        fetchStats();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  if (isLoading || !user || !isPrivileged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin" />
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategory === 'all' || p.category === productCategory;
    const stockVal = p.stock !== undefined ? p.stock : 10;
    const matchesStock =
      productStockFilter === 'all'
        ? true
        : productStockFilter === 'low'
        ? stockVal > 0 && stockVal <= 5
        : stockVal <= 0;
    return matchesSearch && matchesCat && matchesStock;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.phone?.includes(orderSearch) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderFilter === 'all' || o.orderStatus === orderFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = statsData?.stats;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-slate-900">
      {/* ================= ADMIN TOP NAVIGATION ================= */}
      <header className="bg-[#0A2B20] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-slate-950 font-serif font-black text-xl flex items-center justify-center">
                স
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight">
                  সাতক্ষীরা ঘর
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-[#F59E0B]">
                  {isAdmin ? 'এডমিন (Admin)' : user.role === 'manager' ? 'ম্যানেজার (Manager)' : 'স্টাফ (Staff)'}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Live Audio Engine Toggle */}
            <button
              onClick={handleToggleMute}
              title={audioMuted ? 'সাউন্ড নিঃশব্দ আছে (চালু করতে ক্লিক করুন)' : 'লাইভ সাউন্ড সক্রিয় আছে'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                audioMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span className="hidden md:inline">{audioMuted ? 'সাউন্ড বন্ধ' : 'লাইভ অডিও চালু'}</span>
            </button>

            {/* Test sound button */}
            <button
              onClick={() => playCashRegisterSound()}
              title="ক্যাশ রেজিস্টার সাউন্ড টেস্ট করুন"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-amber-300 font-bold transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>টেস্ট</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleSeedDatabase}
                title="ডাটাবেজ সিড/রিসেট"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-amber-300"
              >
                <Database className="w-3.5 h-3.5" />
                <span>সিড</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="hidden sm:inline">ওয়েবসাইট</span>
              <ExternalLink className="w-3 h-3 text-[#F59E0B]" />
            </Link>

            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-xl transition-colors font-bold"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= REAL-TIME PUSH NOTIFICATION TOAST ================= */}
      {newOrderAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-[#0A2B20] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#F59E0B] animate-in slide-in-from-top-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="font-black text-sm text-[#F59E0B] flex items-center gap-1">
                <span>নতুন অর্ডার এসেছে! 🎉</span>
              </h4>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between font-mono font-bold">
              <span>#{newOrderAlert.orderNumber}</span>
              <span className="text-amber-400 text-sm">৳{newOrderAlert.totalAmount}</span>
            </div>
            <div className="text-emerald-200">
              {newOrderAlert.customerName} ({newOrderAlert.phone})
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <CourierFraudBadge fraudRisk={newOrderAlert.fraudRisk} compact={true} />
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setOrderSearch(newOrderAlert.orderNumber);
                  setNewOrderAlert(null);
                }}
                className="font-bold underline text-amber-300"
              >
                অর্ডারটি দেখুন →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all flex items-center gap-2 ${
            actionMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0F3D2E] text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Low Stock Automated Warning Banner (Requirement 5) */}
        {(stats?.lowStockProducts > 0 || stats?.outOfStockProducts > 0) && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                ইনভেন্টরি সতর্কতা: {stats?.lowStockProducts || 0} টি পণ্যে স্টক ৫ এর নিচে রয়েছে এবং {stats?.outOfStockProducts || 0} টি পণ্য স্টক-আউট!
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('products');
                setProductStockFilter('low');
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all whitespace-nowrap"
            >
              লো-স্টক পণ্য দেখুন →
            </button>
          </div>
        )}

        {/* High Risk Hold Orders Alert */}
        {(stats?.holdOrders > 0) && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-red-900 font-bold">
              <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
              <span>
                অ্যান্টি-ফ্রড ইঞ্জিন সতর্কতা: {stats.holdOrders} টি অর্ডার উচ্চ ঝুঁকির কারণে স্বয়ংক্রিয়ভাবে হোল্ডে রাখা হয়েছে।
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('orders');
                setOrderFilter('hold');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all whitespace-nowrap"
            >
              হোল্ড অর্ডার রিভিউ করুন →
            </button>
          </div>
        )}

        {/* ================= NAVIGATION TABS BAR ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E8E2D5] shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#0F3D2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#0F3D2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডার সমূহ ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#0F3D2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>পণ্য ও ইনভেন্টরি ({products.length})</span>
            </button>

            {/* RBAC: Sales Report restricted to Admin & Manager */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#0F3D2E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                <span>সেলস রিপোর্ট</span>
              </button>
            )}

            {/* RBAC: Customer CRM restricted to Admin & Manager */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'crm'
                    ? 'bg-[#0F3D2E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>কাস্টমার CRM ও LTV</span>
              </button>
            )}

            {/* RBAC: Marketing & Coupons */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('marketing')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'marketing'
                    ? 'bg-[#0F3D2E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>কুপন ও কার্ট</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#0F3D2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0F3D2E] hover:bg-emerald-50/50'
              }`}
            >
              <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
              <span>লাইভ রিভিউ ({adminReviews.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2 text-slate-500 hover:text-[#0F3D2E] hover:bg-emerald-50 rounded-xl transition-colors"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'products' && isManagerOrAdmin && (
              <>
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#F59E0B]" />
                  <span className="hidden sm:inline">বাল্ক আপলোড (CSV)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      name: '',
                      nameEn: '',
                      category: 'honey',
                      categoryName: 'সুন্দরবনের মধু',
                      price: '',
                      originalPrice: '',
                      unit: '১ কেজি (1 kg)',
                      stock: 20,
                      badge: '',
                      badgeType: 'forest',
                      image: '',
                      shortDescription: '',
                      description: '',
                      hasVariations: false,
                      variations: [],
                    });
                    setProductModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>নতুন পণ্য</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Modern KPI Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Today's Live Sales (MongoDB Aggregation Pipeline) */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                  <span>আজকের লাইভ বিক্রয়</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#0F3D2E]">
                  ৳{stats?.todaySales ? stats.todaySales.toLocaleString('bn-BD') : 0}
                </div>
                <div className="text-[11px] text-slate-400">
                  আজকের অর্ডার: {stats?.todayOrders || 0} টি
                </div>
              </div>

              {/* Card 2: Active Orders (Pending + Processing + Hold) */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                  <span>সক্রিয় অর্ডার সমূহ</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-700">
                  {stats?.activeOrders || 0} টি
                </div>
                <div className="text-[11px] text-slate-400">
                  পেন্ডিং: {stats?.pendingOrders || 0} • হোল্ড: {stats?.holdOrders || 0}
                </div>
              </div>

              {/* Card 3: Total Pending Tasks (Hold orders + Low Stock + Pending) */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                  <span>পেন্ডিং টাস্ক ও সতর্কতা</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {stats?.pendingTasks || 0} টি
                </div>
                <div className="text-[11px] text-slate-400">যাচাই, কল অথবা রিস্টক আবশ্যক</div>
              </div>

              {/* Card 4: Total Revenue (or Total Stock for Staff) */}
              {isManagerOrAdmin ? (
                <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                    <span>সর্বমোট সর্বকালীন বিক্রয়</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0F3D2E]">
                    ৳{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('bn-BD') : 0}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    মোট ডেলিভার্ড: {stats?.deliveredOrders || 0} টি
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                    <span>ইনভেন্টরি সামারি</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0F3D2E]">
                    {stats?.totalProducts || products.length} টি
                  </div>
                  <div className="text-[11px] text-red-600 font-bold">
                    লো-স্টক পণ্য: {stats?.lowStockProducts || 0} টি
                  </div>
                </div>
              )}
            </div>

            {/* Visual Analytics Chart (MongoDB Aggregation Pipelines) */}
            {isManagerOrAdmin && statsData && (
              <SalesAnalyticsChart
                salesTrend={statsData.salesTrend || []}
                bestSellingProducts={statsData.bestSellingProducts || []}
                stagnantProducts={statsData.stagnantProducts || []}
                statusDistribution={statsData.statusDistribution || {}}
              />
            )}

            {/* Recent Orders in Overview */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>সাম্প্রতিক লাইভ অর্ডারসমূহ</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  সব অর্ডার দেখুন →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">এখনো কোনো অর্ডার আসেনি</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FDFBF7] text-slate-600 font-bold border-b border-[#E8E2D5]">
                      <tr>
                        <th className="py-3 px-4">অর্ডার আইডি</th>
                        <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                        <th className="py-3 px-4">অ্যান্টি-ফ্রড রিক্স</th>
                        <th className="py-3 px-4">মোট বিল</th>
                        <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D5]">
                      {orders.slice(0, 6).map((order) => {
                        const isHighRisk = order.fraudRisk === 'high' || order.orderStatus === 'hold';
                        return (
                          <tr
                            key={order._id || order.orderNumber}
                            className={`transition-colors ${
                              isHighRisk
                                ? 'bg-red-50/80 border-l-4 border-red-500 hover:bg-red-100/50'
                                : 'hover:bg-emerald-50/20'
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-[#0F3D2E]">
                              #{order.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{order.customer?.name}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{order.customer?.phone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <CourierFraudBadge
                                fraudRisk={order.fraudRisk}
                                successRate={order.courierHistory?.successRate}
                                cancelledDeliveries={order.courierHistory?.cancelledDeliveries}
                                compact={true}
                              />
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0F3D2E]">
                              ৳{order.totalAmount}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                  order.orderStatus === 'hold'
                                    ? 'bg-red-600 text-white'
                                    : order.orderStatus === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[11px] font-bold hover:bg-amber-600 shadow-2xs"
                                title="ভাউচার বা কুরিয়ার লেবেল প্রিন্ট করুন"
                              >
                                ভাউচার
                              </button>
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="px-2.5 py-1 bg-[#0F3D2E] text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800"
                              >
                                বিস্তারিত
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ORDERS MANAGEMENT ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="অর্ডার আইডি (#SKG-...), গ্রাহক বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#0F3D2E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none"
                >
                  <option value="all">সব অর্ডার</option>
                  <option value="hold">🔴 হোল্ড (Anti-Fraud Hold)</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                  <option value="shipped">শিপড (Shipped)</option>
                  <option value="delivered">ডেলিভার্ড (Delivered)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FDFBF7] text-slate-600 font-bold border-b border-[#E8E2D5]">
                    <tr>
                      <th className="py-3 px-4">অর্ডার আইডি</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                      <th className="py-3 px-4">কুরিয়ার হিস্টোরি ও ফ্রড রিক্স</th>
                      <th className="py-3 px-4">ঠিকানা</th>
                      <th className="py-3 px-4">মোট বিল</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400">
                          কোনো অর্ডার পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isHighRisk = order.fraudRisk === 'high' || order.orderStatus === 'hold';
                        return (
                          <tr
                            key={order._id || order.orderNumber}
                            className={`transition-colors ${
                              isHighRisk
                                ? 'bg-red-50/80 border-l-4 border-red-500 hover:bg-red-100/50'
                                : 'hover:bg-emerald-50/20'
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-[#0F3D2E]">
                              #{order.orderNumber}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : 'আজ'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{order.customer?.name}</div>
                              <a
                                href={`tel:${order.customer?.phone}`}
                                className="text-amber-700 hover:underline font-mono"
                              >
                                {order.customer?.phone}
                              </a>
                            </td>
                            <td className="py-3 px-4">
                              <CourierFraudBadge
                                fraudRisk={order.fraudRisk}
                                successRate={order.courierHistory?.successRate}
                                cancelledDeliveries={order.courierHistory?.cancelledDeliveries}
                                compact={true}
                              />
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate" title={order.customer?.address}>
                              {order.customer?.address}, {order.customer?.city}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0F3D2E]">
                              ৳{order.totalAmount}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order._id, e.target.value)
                                }
                                className={`py-1 px-2 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                                  order.orderStatus === 'hold'
                                    ? 'bg-red-600 text-white border-red-700'
                                    : order.orderStatus === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : order.orderStatus === 'processing'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : order.orderStatus === 'shipped'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : order.orderStatus === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-red-50 text-red-800 border-red-300'
                                }`}
                              >
                                <option value="hold">🔴 হোল্ড (Hold)</option>
                                <option value="pending">পেন্ডিং (Pending)</option>
                                <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                                <option value="shipped">শিপড (Shipped)</option>
                                <option value="delivered">ডেলিভার্ড (Delivered)</option>
                                <option value="cancelled">বাতিল (Cancelled)</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                                title="ভাউচার ও কুরিয়ার শিপিং লেবেল প্রিন্ট করুন"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="p-1.5 text-[#0F3D2E] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                                title="সিকিউরিটি লগ ও বিস্তারিত দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: PRODUCTS & INVENTORY CRUD ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#0F3D2E]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Stock threshold filter */}
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none"
                >
                  <option value="all">সকল স্টক লেভেল</option>
                  <option value="low">⚠️ লো-স্টক (১-৫ টি)</option>
                  <option value="out">⛔ স্টক-আউট (০ টি)</option>
                </select>

                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  <option value="honey">সুন্দরবনের মধু</option>
                  <option value="ghee">খাঁটি গাওয়া ঘি</option>
                  <option value="oil">সরিষার তেল</option>
                  <option value="sweets">সাতক্ষীরার সন্দেশ</option>
                  <option value="pickles">আচার ও মশলা</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FDFBF7] text-slate-600 font-bold border-b border-[#E8E2D5]">
                    <tr>
                      <th className="py-3 px-4">ছবি</th>
                      <th className="py-3 px-4">পণ্যের নাম ও ভ্যারিয়েশন</th>
                      <th className="py-3 px-4">ক্যাটাগরি</th>
                      <th className="py-3 px-4">মূল্য (৳)</th>
                      <th className="py-3 px-4">স্টক মনিটর</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]">
                    {filteredProducts.map((prod) => {
                      const stockVal = prod.stock !== undefined ? prod.stock : 10;
                      const isLowStock = stockVal > 0 && stockVal <= 5;
                      const isOutOfStock = stockVal <= 0;

                      return (
                        <tr key={prod._id || prod.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FEF3C7] border border-[#E8E2D5]">
                              <Image
                                src={prod.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0F3D2E] text-xs">{prod.name}</div>
                            <div className="text-[11px] text-slate-400">{prod.unit}</div>
                            {prod.hasVariations && prod.variations?.length > 0 && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="bg-purple-100 text-purple-900 font-bold text-[9px] px-1.5 py-0.5 rounded">
                                  {prod.variations.length} টি ভ্যারিয়েশন ম্যাট্রিক্স
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-900 text-[11px] font-semibold">
                              {prod.categoryName || prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0F3D2E]">৳{prod.price}</div>
                            {prod.originalPrice && (
                              <div className="text-[11px] text-slate-400 line-through">
                                ৳{prod.originalPrice}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-1 rounded-full font-black text-[11px] bg-red-100 text-red-700 border border-red-300 animate-pulse flex items-center gap-1 w-fit">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>স্টক শেষ (0)</span>
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-1 rounded-full font-black text-[11px] bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>লো-স্টক ({stockVal} টি)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                                {stockVal} টি উপলব্ধ
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {isManagerOrAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: SALES REPORTS (RBAC: Admin & Manager) ===================== */}
        {activeTab === 'reports' && isManagerOrAdmin && (
          <SalesReportView />
        )}

        {/* ===================== TAB 5: CUSTOMER CRM DIRECTORY (RBAC: Admin & Manager) ===================== */}
        {activeTab === 'crm' && isManagerOrAdmin && (
          <CustomerCRMView isManagerOrAdmin={isManagerOrAdmin} />
        )}

        {/* ===================== TAB 6: MARKETING & COUPONS ===================== */}
        {activeTab === 'marketing' && isManagerOrAdmin && (
          <CouponsAndCartView />
        )}

        {/* ===================== TAB 7: LIVE REVIEWS & FEEDBACK ===================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                  <span>গ্রাহকদের লাইভ প্রোডাক্ট রিভিউ ও ফিডব্যাক ({adminReviews.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ওয়েবসাইটে প্রদর্শিত সকল কাস্টমার রিভিউ ও রেটিং পর্যবেক্ষণ করুন
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="পণ্য বা গ্রাহকের নাম..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] outline-none focus:border-[#0F3D2E]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FDFBF7] text-[#0F3D2E] border-b border-[#E8E2D5] font-bold">
                    <tr>
                      <th className="p-4">পণ্য</th>
                      <th className="p-4">গ্রাহক</th>
                      <th className="p-4">রেটিং</th>
                      <th className="p-4">মন্তব্য</th>
                      <th className="p-4">তারিখ</th>
                      <th className="p-4 text-center">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]">
                    {loadingAdminReviews ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          রিভিউ লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : adminReviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          কোনো রিভিউ পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      adminReviews
                        .filter((r) =>
                          reviewSearch
                            ? r.productName?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                              r.userName?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                              r.comment?.toLowerCase().includes(reviewSearch.toLowerCase())
                            : true
                        )
                        .map((rev) => (
                          <tr key={rev._id} className="hover:bg-emerald-50/20 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-[#0F3D2E]">{rev.productName}</span>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{rev.userName}</div>
                              <div className="text-[10px] text-slate-400">{rev.userPhone}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-[#F59E0B]">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">{rev.comment}</td>
                            <td className="p-4 text-slate-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('bn-BD') : ''}
                            </td>
                            <td className="p-4 text-center">
                              {isManagerOrAdmin && (
                                <button
                                  onClick={async () => {
                                    if (!confirm('রিভিউটি মুছবেন?')) return;
                                    await fetch(`/api/reviews/my-reviews?id=${rev._id}`, { method: 'DELETE' });
                                    fetchAdminReviews();
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== PRODUCT CREATE / EDIT MODAL ===================== */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E2D5] shadow-2xl my-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
                <h3 className="text-base font-bold text-[#0F3D2E]">
                  {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যুক্ত করুন'}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      পণ্যের নাম (বাংলা) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productFormData.name}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, name: e.target.value })
                      }
                      placeholder="যেমন: সুন্দরবনের খাঁটি মধু"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:border-[#0F3D2E]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      পণ্যের নাম (ইংরেজি / URL Slug)
                    </label>
                    <input
                      type="text"
                      value={productFormData.nameEn}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, nameEn: e.target.value })
                      }
                      placeholder="যেমন: Sundarbans Raw Honey"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:border-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      ক্যাটাগরি <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const catNames = {
                          honey: 'সুন্দরবনের মধু',
                          ghee: 'খাঁটি গাওয়া ঘি',
                          oil: 'সরিষার তেল',
                          sweets: 'সাতক্ষীরার সন্দেশ',
                          pickles: 'আচার ও মশলা',
                        };
                        setProductFormData({
                          ...productFormData,
                          category: cat,
                          categoryName: catNames[cat] || 'সাধারণ পণ্য',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                    >
                      <option value="honey">সুন্দরবনের মধু</option>
                      <option value="ghee">খাঁটি গাওয়া ঘি</option>
                      <option value="oil">সরিষার তেল</option>
                      <option value="sweets">সাতক্ষীরার সন্দেশ</option>
                      <option value="pickles">আচার ও মশলা</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      ডিফল্ট পরিমাপ ইউনিট
                    </label>
                    <input
                      type="text"
                      value={productFormData.unit}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, unit: e.target.value })
                      }
                      placeholder="১ কেজি (1 kg)"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      বিক্রয় মূল্য (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={productFormData.price}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, price: e.target.value })
                      }
                      placeholder="1250"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      মূল মূল্য (ছাড় থাকলে)
                    </label>
                    <input
                      type="number"
                      value={productFormData.originalPrice}
                      onChange={(e) =>
                        setProductFormData({
                          ...productFormData,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="1450"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F3D2E] mb-1">
                      মোট স্টক সংখ্যা <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={productFormData.stock}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, stock: e.target.value })
                      }
                      placeholder="20"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                    />
                  </div>
                </div>

                {/* Multi-attribute variation matrix editor (Requirement 5) */}
                <ProductVariationEditor
                  hasVariations={productFormData.hasVariations}
                  variations={productFormData.variations}
                  onChange={(variationState) =>
                    setProductFormData({
                      ...productFormData,
                      hasVariations: variationState.hasVariations,
                      variations: variationState.variations,
                    })
                  }
                />

                {/* Product Image */}
                <ImageUploadInput
                  value={productFormData.image}
                  onChange={(url) =>
                    setProductFormData({ ...productFormData, image: url })
                  }
                  label="পণ্যের ছবি"
                  required={true}
                  helpText="কম্পিউটার ফোল্ডার বা ফোনের গ্যালারি থেকে যেকোনো ছবি সরাসরি আপলোড করুন"
                  allowUrlPaste={true}
                />

                <div>
                  <label className="block font-bold text-[#0F3D2E] mb-1">
                    সংক্ষিপ্ত বিবরণ
                  </label>
                  <textarea
                    rows={2}
                    value={productFormData.shortDescription}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="পণ্যের গুণাগুণ ও বিশেষত্ব..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-slate-600 font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl transition-all shadow-sm hover:scale-[1.02]"
                  >
                    {editingProduct ? 'আপডেট সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== ORDER DETAIL & SECURITY MODAL ===================== */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E2D5] shadow-2xl space-y-4 my-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
                <div>
                  <h3 className="text-base font-bold text-[#0F3D2E]">
                    অর্ডার বিস্তারিত: #{selectedOrderDetails.orderNumber}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              {/* Requirement 2 & 3: Customer Security Info & Anti-Fraud Card */}
              <CustomerSecurityCard
                securityInfo={selectedOrderDetails.securityInfo}
                courierHistory={selectedOrderDetails.courierHistory}
                fraudRisk={selectedOrderDetails.fraudRisk}
                fraudReason={selectedOrderDetails.fraudReason}
              />

              {/* Courier One-Click Booking Status */}
              <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-3.5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#0F3D2E] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>কুরিয়ার পার্সেল বুকিং (Steadfast / Pathao)</span>
                  </span>
                  {selectedOrderDetails.courierBooking?.isBooked ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      বুকিং সম্পন্ন (In-Transit)
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      বুকিং পেন্ডিং
                    </span>
                  )}
                </div>

                {selectedOrderDetails.courierBooking?.isBooked ? (
                  <div className="font-mono text-[11px] bg-white p-2 rounded-xl border border-[#E8E2D5] space-y-0.5">
                    <div>কুরিয়ার: <strong>{selectedOrderDetails.courierBooking.courierName}</strong></div>
                    <div>ট্র্যাকিং কোড: <strong className="text-amber-700">{selectedOrderDetails.courierBooking.trackingCode}</strong></div>
                    <div>কনসাইনমেন্ট নং: <strong>{selectedOrderDetails.courierBooking.consignmentId}</strong></div>
                  </div>
                ) : (
                  <button
                    disabled={bookingCourierLoading}
                    onClick={() => handleBookCourier(selectedOrderDetails._id)}
                    className="w-full py-2 bg-[#0F3D2E] hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>
                      {bookingCourierLoading
                        ? 'বুকিং তৈরি হচ্ছে...'
                        : '১-ক্লিকে স্টিডফাস্ট কুরিয়ারে পার্সেল বুক করুন (One-Click Booking)'}
                    </span>
                  </button>
                )}
              </div>

              {/* Customer Box */}
              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl text-xs space-y-1 border border-[#E8E2D5]">
                <div><strong>গ্রাহকের নাম:</strong> {selectedOrderDetails.customer?.name}</div>
                <div><strong>মোবাইল নম্বর:</strong> {selectedOrderDetails.customer?.phone}</div>
                <div><strong>ঠিকানা:</strong> {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
                {selectedOrderDetails.customer?.notes && (
                  <div><strong>গ্রাহকের নোট:</strong> {selectedOrderDetails.customer.notes}</div>
                )}
                <div><strong>পেমেন্ট মাধ্যম:</strong> {selectedOrderDetails.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : selectedOrderDetails.paymentMethod}</div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0F3D2E]">অর্ডারকৃত আইটেম:</h4>
                <div className="divide-y divide-[#E8E2D5] max-h-40 overflow-y-auto">
                  {selectedOrderDetails.items?.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[11px] text-slate-400">
                          ৳{it.price} × {it.quantity} {it.unit}
                        </div>
                      </div>
                      <div className="font-bold text-[#0F3D2E]">
                        ৳{it.price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D5] flex justify-between items-center text-sm font-bold text-[#0F3D2E]">
                <span>সর্বমোট বিল:</span>
                <span>৳{selectedOrderDetails.totalAmount}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setPrintingOrder(selectedOrderDetails)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>ভাউচার ও ৪×৬ কুরিয়ার শিপিং লেবেল প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== PRINTABLE VOUCHER & SHIPPING LABEL MODAL ===================== */}
        {printingOrder && (
          <OrderInvoiceModal
            order={printingOrder}
            onClose={() => setPrintingOrder(null)}
          />
        )}

        {/* ===================== BULK PRODUCT IMPORT MODAL ===================== */}
        <BulkProductUploadModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onUploadSuccess={(count) => {
            showNotification(`${count} টি পণ্য সফলভাবে বাল্ক আপলোড হয়েছে!`, 'success');
            fetchProducts();
            fetchStats();
          }}
        />
      </div>
    </div>
  );
}
