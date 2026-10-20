'use client';

import { useState, useEffect } from 'react';
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
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import OrderInvoiceModal from '@/components/admin/OrderInvoiceModal';
import ImageUploadInput from '@/components/common/ImageUploadInput';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'customers'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form state
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
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);

  // Reviews state
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingAdminReviews, setLoadingAdminReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');

  // Feedback states
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role !== 'admin') {
        router.push('/my-orders');
      } else {
        loadDashboardData();
      }
    }
  }, [user, isLoading, router]);

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  const loadDashboardData = async () => {
    await Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchAdminReviews()]);
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

  const handleDeleteAdminReview = async (id) => {
    if (!confirm('আপনি কি এই রিভিউটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/reviews/my-reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('রিভিউ মুছে ফেলা হয়েছে');
        fetchAdminReviews();
      }
    } catch (e) {
      showNotification('মুছতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
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
      const res = await fetch('/api/products?limit=100');
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
      const res = await fetch('/api/orders?limit=100');
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

  // Product Save (Create or Update)
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

  // Update Order Status
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

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="w-10 h-10 border-4 border-[#1B4D3E] border-t-[#E5A93C] rounded-full animate-spin" />
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategory === 'all' || p.category === productCategory;
    return matchesSearch && matchesCat;
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

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-[#102E25] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E5A93C] text-[#102E25] font-serif font-black text-xl flex items-center justify-center">
                স
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight">
                সাতক্ষীরা ঘর <span className="text-[#E5A93C] font-normal text-xs ml-1 px-2 py-0.5 bg-white/10 rounded-full">এডমিন প্যানেল</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleSeedDatabase}
              title="ডাটাবেজ সিড/রিসেট"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-amber-300"
            >
              <Database className="w-3.5 h-3.5" />
              <span>ডাটা সিড করুন</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3 h-3 text-[#E5A93C]" />
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

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all flex items-center gap-2 ${
            actionMessage.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-[#1B4D3E] text-[#FAF0D4]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#EFE9DC] shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1B4D3E] text-[#FAF0D4] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#FAF8F4]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#1B4D3E] text-[#FAF0D4] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#FAF8F4]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>পণ্য ব্যবস্থাপনা ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#1B4D3E] text-[#FAF0D4] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#FAF8F4]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডার সমূহ ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#1B4D3E] text-[#FAF0D4] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#FAF8F4]'
              }`}
            >
              <Star className="w-4 h-4 text-[#E5A93C] fill-current" />
              <span>লাইভ রিভিউ ও ফিডব্যাক ({adminReviews.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2 text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#FAF8F4] rounded-xl transition-colors"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'products' && (
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
                  });
                  setProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#E5A93C] hover:bg-[#d6982b] text-[#102E25] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পণ্য যুক্ত করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Revenue */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[#4A5B53] text-xs font-bold">
                  <span>মোট বিক্রয়</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1B4D3E]">
                  ৳{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('bn-BD') : 0}
                </div>
                <div className="text-[11px] text-[#8C9C93]">সম্পন্ন ও লাইভ অর্ডার থেকে</div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[#4A5B53] text-xs font-bold">
                  <span>মোট অর্ডার</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1B4D3E]">
                  {stats?.totalOrders || 0} টি
                </div>
                <div className="text-[11px] text-[#8C9C93]">
                  ডেলিভার্ড: {stats?.deliveredOrders || 0} টি
                </div>
              </div>

              {/* Card 3: Pending Orders */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[#4A5B53] text-xs font-bold">
                  <span>পেন্ডিং অর্ডার</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {stats?.pendingOrders || 0} টি
                </div>
                <div className="text-[11px] text-[#8C9C93]">যাচাই বা প্রসেসিং আবশ্যক</div>
              </div>

              {/* Card 4: Products & Stock Alert */}
              <div className="bg-white p-5 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[#4A5B53] text-xs font-bold">
                  <span>মোট পণ্য</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1B4D3E]">
                  {stats?.totalProducts || products.length} টি
                </div>
                <div className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>লো-স্টক পণ্য: {stats?.lowStockProducts || 0} টি</span>
                </div>
              </div>
            </div>

            {/* Recent Orders in Overview */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE9DC] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[#1B4D3E] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E5A93C]" />
                  <span>সাম্প্রতিক অর্ডারসমূহ</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#C86D3B] hover:underline"
                >
                  সব অর্ডার দেখুন →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-[#8C9C93] py-4 text-center">এখনো কোনো অর্ডার আসেনি</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF8F4] text-[#4A5B53] font-bold border-b border-[#EFE9DC]">
                      <tr>
                        <th className="py-3 px-4">অর্ডার আইডি</th>
                        <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                        <th className="py-3 px-4">পণ্য সংখ্যা</th>
                        <th className="py-3 px-4">মোট টাকা</th>
                        <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DC]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id || order.orderNumber} className="hover:bg-[#FAF8F4]/50">
                          <td className="py-3 px-4 font-mono font-bold text-[#1B4D3E]">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#102E25]">{order.customer?.name}</div>
                            <div className="text-[#8C9C93] text-[11px]">{order.customer?.phone}</div>
                          </td>
                          <td className="py-3 px-4">{order.items?.length || 0} টি</td>
                          <td className="py-3 px-4 font-bold text-[#1B4D3E]">
                            ৳{order.totalAmount}
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize font-bold text-[11px]">
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setPrintingOrder(order)}
                              className="px-2 py-1 bg-[#E5A93C] text-[#102E25] rounded-lg text-[11px] font-bold hover:bg-[#d6982b]"
                              title="ভাউচার প্রিন্ট করুন"
                            >
                              ভাউচার
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrderDetails(order);
                              }}
                              className="px-2.5 py-1 bg-[#1B4D3E] text-[#FAF0D4] rounded-lg text-[11px] font-bold"
                            >
                              বিস্তারিত
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: PRODUCTS CRUD ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DC] shadow-sm flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C9C93] absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE9DC] text-xs outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#EFE9DC] text-xs bg-white text-[#102E25] outline-none"
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
            <div className="bg-white rounded-3xl border border-[#EFE9DC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F4] text-[#4A5B53] font-bold border-b border-[#EFE9DC]">
                    <tr>
                      <th className="py-3 px-4">ছবি</th>
                      <th className="py-3 px-4">পণ্যের নাম</th>
                      <th className="py-3 px-4">ক্যাটাগরি</th>
                      <th className="py-3 px-4">মূল্য (৳)</th>
                      <th className="py-3 px-4">স্টক</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DC]">
                    {filteredProducts.map((prod) => (
                      <tr key={prod._id || prod.id} className="hover:bg-[#FAF8F4]/50">
                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF0D4] border border-[#EFE9DC]">
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
                          <div className="font-bold text-[#1B4D3E] text-xs">{prod.name}</div>
                          <div className="text-[11px] text-[#8C9C93]">{prod.unit}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF0D4] text-[#153D31] text-[11px] font-semibold">
                            {prod.categoryName || prod.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1B4D3E]">৳{prod.price}</div>
                          {prod.originalPrice && (
                            <div className="text-[11px] text-[#8C9C93] line-through">
                              ৳{prod.originalPrice}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              (prod.stock ?? 10) <= 5
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prod.stock ?? 10} টি
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: ORDERS MANAGEMENT ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DC] shadow-sm flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C9C93] absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="অর্ডার আইডি (SKG-...) বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE9DC] text-xs outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#EFE9DC] text-xs bg-white text-[#102E25] outline-none"
                >
                  <option value="all">সব অর্ডার</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                  <option value="shipped">শিপড (Shipped)</option>
                  <option value="delivered">ডেলিভার্ড (Delivered)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#EFE9DC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F4] text-[#4A5B53] font-bold border-b border-[#EFE9DC]">
                    <tr>
                      <th className="py-3 px-4">অর্ডার আইডি</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                      <th className="py-3 px-4">ঠিকানা</th>
                      <th className="py-3 px-4">আইটেম</th>
                      <th className="py-3 px-4">মোট টাকা</th>
                      <th className="py-3 px-4">স্ট্যাটাস পরিবর্তন</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DC]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-[#8C9C93]">
                          কোনো অর্ডার পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id || order.orderNumber} className="hover:bg-[#FAF8F4]/50">
                          <td className="py-3 px-4 font-mono font-bold text-[#1B4D3E]">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-[#8C9C93]">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : 'আজ'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#102E25]">{order.customer?.name}</div>
                            <a
                              href={`tel:${order.customer?.phone}`}
                              className="text-[#C86D3B] hover:underline font-mono"
                            >
                              {order.customer?.phone}
                            </a>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate" title={order.customer?.address}>
                            {order.customer?.address}, {order.customer?.city}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold">{order.items?.length || 0} টি</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1B4D3E]">
                            ৳{order.totalAmount}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order._id, e.target.value)
                              }
                              className={`py-1 px-2.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                                order.orderStatus === 'pending'
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
                              title="সাতক্ষীরা ঘর ভাউচার ও পার্সেল লেবেল প্রিন্ট করুন"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="p-1.5 text-[#1B4D3E] hover:bg-[#FAF0D4] rounded-lg transition-colors"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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

        {/* ===================== TAB: CUSTOMER REVIEWS & FEEDBACK ===================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-6 rounded-3xl border border-[#EFE9DC] shadow-sm">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1B4D3E] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#E5A93C] fill-current" />
                  <span>গ্রাহকদের লাইভ প্রোডাক্ট রিভিউ ও ফিডব্যাক ({adminReviews.length})</span>
                </h3>
                <p className="text-xs text-[#8C9C93] mt-0.5">
                  ওয়েবসাইটে প্রদর্শিত সকল কাস্টমার রিভিউ ও রেটিং পর্যবেক্ষণ করুন
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C9C93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="পণ্য বা গ্রাহকের নাম..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EFE9DC] bg-[#FAF8F4] outline-none focus:border-[#1B4D3E]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#EFE9DC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F4] text-[#1B4D3E] border-b border-[#EFE9DC] font-bold">
                    <tr>
                      <th className="p-4">পণ্য</th>
                      <th className="p-4">গ্রাহক</th>
                      <th className="p-4">রেটিং</th>
                      <th className="p-4">রিভিউ ও ছবি</th>
                      <th className="p-4">তারিখ</th>
                      <th className="p-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DC]">
                    {loadingAdminReviews ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-[#8C9C93]">
                          রিভিউ লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : adminReviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-[#8C9C93]">
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
                          <tr key={rev._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#FAF0D4] flex-shrink-0 border border-[#EFE9DC]">
                                  {rev.productImage ? (
                                    <img
                                      src={rev.productImage}
                                      alt={rev.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">🍯</div>
                                  )}
                                </div>
                                <span className="font-bold text-[#1B4D3E]">{rev.productName}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-[#102E25]">{rev.userName}</div>
                              {rev.userPhone && (
                                <div className="text-[11px] text-[#8C9C93]">{rev.userPhone}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-[#E5A93C]">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= rev.rating ? 'fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-[11px] font-bold text-[#1B4D3E] ml-1">
                                  {rev.rating}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <p className="text-[#4A5B53] line-clamp-2">{rev.comment}</p>
                              {rev.images && rev.images.length > 0 && (
                                <div className="flex gap-1.5 mt-1.5">
                                  {rev.images.map((img, i) => (
                                    <a
                                      key={i}
                                      href={img}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#EFE9DC] hover:opacity-80 inline-block"
                                    >
                                      <img
                                        src={img}
                                        alt="Review pic"
                                        className="w-full h-full object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-[#8C9C93]">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteAdminReview(rev._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#EFE9DC] shadow-2xl my-8">
              <div className="flex justify-between items-center pb-4 border-b border-[#EFE9DC] mb-4">
                <h3 className="text-base font-bold text-[#1B4D3E]">
                  {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যুক্ত করুন'}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-[#8C9C93] hover:text-[#102E25]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      পণ্যের নাম (ইংরেজি / URL Slug)
                    </label>
                    <input
                      type="text"
                      value={productFormData.nameEn}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, nameEn: e.target.value })
                      }
                      placeholder="যেমন: Sundarbans Raw Honey"
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                    >
                      <option value="honey">সুন্দরবনের মধু</option>
                      <option value="ghee">খাঁটি গাওয়া ঘি</option>
                      <option value="oil">সরিষার তেল</option>
                      <option value="sweets">সাতক্ষীরার সন্দেশ</option>
                      <option value="pickles">আচার ও মশলা</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      পরিমাপ ইউনিট
                    </label>
                    <input
                      type="text"
                      value={productFormData.unit}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, unit: e.target.value })
                      }
                      placeholder="১ কেজি (1 kg)"
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      স্টক পরিমাণ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={productFormData.stock}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, stock: e.target.value })
                      }
                      placeholder="20"
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                    />
                  </div>
                </div>

                {/* Product Image with Folder / Gallery Upload */}
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
                  <label className="block font-bold text-[#1B4D3E] mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1B4D3E] mb-1">
                    বিস্তারিত বিবরণ
                  </label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="পণ্যের পূর্ণ বিবরণ, উপকারিতা ও ব্যবহার পদ্ধতি..."
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#EFE9DC] text-[#4A5B53] font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl font-bold hover:bg-[#153D31] transition-colors shadow-sm"
                  >
                    {editingProduct ? 'আপডেট সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== ORDER DETAIL MODAL ===================== */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#EFE9DC] shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EFE9DC]">
                <div>
                  <h3 className="text-base font-bold text-[#1B4D3E]">
                    অর্ডার বিস্তারিত: #{selectedOrderDetails.orderNumber}
                  </h3>
                  <span className="text-[11px] text-[#8C9C93]">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-[#8C9C93] hover:text-[#102E25]"
                >
                  ✕
                </button>
              </div>

              {/* Customer Box */}
              <div className="bg-[#FAF8F4] p-3.5 rounded-2xl text-xs space-y-1 border border-[#EFE9DC]">
                <div><strong>গ্রাহকের নাম:</strong> {selectedOrderDetails.customer?.name}</div>
                <div><strong>মোবাইল নম্বর:</strong> {selectedOrderDetails.customer?.phone}</div>
                <div><strong>ঠিকানা:</strong> {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
                {selectedOrderDetails.customer?.notes && (
                  <div><strong>গ্রাহকের নোট:</strong> {selectedOrderDetails.customer.notes}</div>
                )}
                <div><strong>পেমেন্ট মাধ্যম:</strong> {selectedOrderDetails.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন'}</div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1B4D3E]">অর্ডারকৃত আইটেম:</h4>
                <div className="divide-y divide-[#EFE9DC] max-h-48 overflow-y-auto">
                  {selectedOrderDetails.items?.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-[#102E25]">{it.name}</div>
                        <div className="text-[11px] text-[#8C9C93]">
                          ৳{it.price} × {it.quantity} {it.unit}
                        </div>
                      </div>
                      <div className="font-bold text-[#1B4D3E]">
                        ৳{it.price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE9DC] flex justify-between items-center text-sm font-bold text-[#1B4D3E]">
                <span>সর্বমোট বিল:</span>
                <span>৳{selectedOrderDetails.totalAmount}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setPrintingOrder(selectedOrderDetails);
                  }}
                  className="w-full py-3 bg-[#E5A93C] hover:bg-[#d6982b] text-[#102E25] font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>সাতক্ষীরা ঘর ভাউচার ও পার্সেল স্লিপ প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== PRINTABLE VOUCHER MODAL ===================== */}
        {printingOrder && (
          <OrderInvoiceModal
            order={printingOrder}
            onClose={() => setPrintingOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
