'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  FolderPlus,
  Flame,
  Palette,
  FileText,
  Sparkles,
  MapPin,
  Calendar,
  Info,
  Loader2,
  Phone,
  MessageSquare,
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
import ProductImageGalleryManager from '@/components/admin/ProductImageGalleryManager';
import AdminCategoriesView from '@/components/admin/AdminCategoriesView';
import AdminFlashSaleView from '@/components/admin/AdminFlashSaleView';
import AdminThemeView from '@/components/admin/AdminThemeView';
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
  const [authReady, setAuthReady] = useState(false);

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
  const [categoriesList, setCategoriesList] = useState([]);

  // Inline Quick-Add Category state inside Product Modal
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatData, setInlineCatData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    icon: '🌿',
    image: '',
    description: '',
  });
  const [savingInlineCat, setSavingInlineCat] = useState(false);
  const [inlineCatError, setInlineCatError] = useState('');

  const effectiveCategories = useMemo(() => {
    return (categoriesList || []).filter(
      (c) => c && c.slug !== 'all' && c.id !== 'all'
    );
  }, [categoriesList]);

  // Clean, versatile Product Form state (No hardcoded honey or static defaults)
  const initialProductFormState = {
    name: '',
    nameEn: '',
    slug: '',
    category: '',
    categoryName: '',
    price: '',
    originalPrice: '',
    unit: '',
    stock: 10,
    badge: '',
    badgeType: 'forest',
    image: '',
    images: [],
    shortDescription: '',
    description: '',
    origin: '',
    harvestDate: '',
    packaging: '',
    purityGuarantee: '',
    paymentTerms: '',
    storageTips: '',
    benefits: [],
    nutritionalInfo: {},
    specialFeatures: [],
    deliveryTimeline: '',
    hasVariations: false,
    variations: [],
  };

  const [productFormData, setProductFormData] = useState(initialProductFormState);
  const [productModalTab, setProductModalTab] = useState('basic'); // 'basic' | 'details' | 'benefits'
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newNutritionKey, setNewNutritionKey] = useState('');
  const [newNutritionValue, setNewNutritionValue] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderRiskFilter, setOrderRiskFilter] = useState('all');
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
    checkAuth().finally(() => {
      setAuthReady(true);
    });
    // Initialize audio context on first user click/interaction
    initAudioOnUserGesture();

    const handleCatUpdate = () => fetchCategories();
    if (typeof window !== 'undefined') {
      window.addEventListener('categories:updated', handleCatUpdate);
      return () => window.removeEventListener('categories:updated', handleCatUpdate);
    }
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && authReady) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!isPrivileged) {
        router.push('/my-orders');
      } else {
        loadDashboardData();
      }
    }
  }, [user, isLoading, authReady, router]);

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
    await Promise.all([
      fetchStats(),
      fetchProducts(),
      fetchOrders(),
      fetchAdminReviews(),
      fetchCategories(),
    ]);
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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
      }
    } catch (e) {
      console.error('Fetch categories failed:', e);
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

  // Inline Quick-Add Category inside Product Modal
  const handleSaveInlineCategory = async () => {
    if (!inlineCatData.name || !inlineCatData.name.trim()) {
      setInlineCatError('ক্যাটাগরির বাংলা নাম লিখুন');
      return;
    }

    try {
      setSavingInlineCat(true);
      setInlineCatError('');

      const cleanName = inlineCatData.name.trim();
      const cleanNameEn = (inlineCatData.nameEn || cleanName).trim();
      const generatedSlug = (inlineCatData.slug || cleanNameEn || cleanName)
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const payload = {
        name: cleanName,
        nameEn: cleanNameEn,
        slug: generatedSlug,
        icon: inlineCatData.icon || '🌿',
        image: inlineCatData.image || '',
        description: inlineCatData.description || '',
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'ক্যাটাগরি তৈরি করা সম্ভব হয়নি');
      }

      // Update categories list in state
      if (Array.isArray(data.categories)) {
        setCategoriesList(data.categories);
      } else {
        setCategoriesList((prev) => [...prev, payload]);
      }

      // Automatically select this newly created category in the active product form!
      setProductFormData((prev) => ({
        ...prev,
        category: payload.slug,
        categoryName: payload.name,
      }));

      // Reset inline form & close
      setInlineCatData({
        name: '',
        nameEn: '',
        slug: '',
        icon: '🌿',
        image: '',
        description: '',
      });
      setShowInlineAddCat(false);
      showNotification(`"${payload.name}" ক্যাটাগরি তৈরি ও নির্বাচিত হয়েছে!`, 'success');

      // Dispatch real-time event for Header, CategorySection, Showcase across site
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categories:updated', { detail: payload }));
      }
    } catch (err) {
      setInlineCatError(err.message);
    } finally {
      setSavingInlineCat(false);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductModalTab('basic');
    setNewBenefitInput('');
    setNewFeatureInput('');
    setNewNutritionKey('');
    setNewNutritionValue('');
    setShowInlineAddCat(false);
    setInlineCatError('');
    setProductFormData({
      name: prod.name || '',
      nameEn: prod.nameEn || '',
      slug: prod.slug || '',
      category: prod.category || (effectiveCategories[0]?.slug || ''),
      categoryName: prod.categoryName || (effectiveCategories.find((c) => (c.slug || c.id) === prod.category)?.name) || '',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      unit: prod.unit || '',
      stock: prod.stock !== undefined ? prod.stock : 10,
      badge: prod.badge || '',
      badgeType: prod.badgeType || 'forest',
      image: prod.image || '',
      images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []),
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      origin: prod.origin || '',
      harvestDate: prod.harvestDate || '',
      packaging: prod.packaging || '',
      purityGuarantee: prod.purityGuarantee || '',
      paymentTerms: prod.paymentTerms || '',
      storageTips: prod.storageTips || '',
      benefits: Array.isArray(prod.benefits) ? [...prod.benefits] : [],
      nutritionalInfo: prod.nutritionalInfo && typeof prod.nutritionalInfo === 'object' ? { ...prod.nutritionalInfo } : {},
      specialFeatures: Array.isArray(prod.specialFeatures) ? [...prod.specialFeatures] : [],
      deliveryTimeline: prod.deliveryTimeline || '',
      hasVariations: !!prod.hasVariations,
      variations: prod.variations || [],
    });
    setProductModalOpen(true);
  };

  // Product specification and nutrition helpers
  const handleAddBenefit = (benefitText) => {
    const text = (benefitText || newBenefitInput).trim();
    if (!text) return;
    if (productFormData.benefits.includes(text)) return;
    setProductFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, text],
    }));
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index) => {
    setProductFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = (featureText) => {
    const text = (featureText || newFeatureInput).trim();
    if (!text) return;
    if (productFormData.specialFeatures.includes(text)) return;
    setProductFormData((prev) => ({
      ...prev,
      specialFeatures: [...prev.specialFeatures, text],
    }));
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index) => {
    setProductFormData((prev) => ({
      ...prev,
      specialFeatures: prev.specialFeatures.filter((_, i) => i !== index),
    }));
  };

  const handleAddNutrition = () => {
    const key = newNutritionKey.trim();
    const val = newNutritionValue.trim();
    if (!key || !val) return;
    setProductFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...(prev.nutritionalInfo || {}),
        [key]: val,
      },
    }));
    setNewNutritionKey('');
    setNewNutritionValue('');
  };

  const handleRemoveNutrition = (key) => {
    setProductFormData((prev) => {
      const updated = { ...(prev.nutritionalInfo || {}) };
      delete updated[key];
      return { ...prev, nutritionalInfo: updated };
    });
  };

  const handleLoadSampleNutrition = () => {
    setProductFormData((prev) => ({
      ...prev,
      nutritionalInfo: {
        'এনার্জি / শক্তি': '৩২০ kcal',
        'প্রাকৃতিক শর্করা': '৮০ গ্রাম',
        'প্রোটিন': '০.৩ গ্রাম',
        'ফ্যাট / চর্বি': '০ গ্রাম',
        'ভিটামিন ও খনিজ': 'প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও এনজাইম',
      },
    }));
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

  // Update Order Status (including Hold, Processing, Shipped, Delivered, Cancelled)
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
        fetchProducts(); // Ensures stock is immediately synced in admin UI
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails((prev) => ({
            ...prev,
            orderStatus: newStatus,
          }));
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // Quick Payment Status Toggle (Unpaid / Paid)
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          `পেমেন্ট স্ট্যাটাস "${newPaymentStatus === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}" করা হয়েছে`,
          'success'
        );
        fetchOrders();
        fetchStats();
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails((prev) => ({
            ...prev,
            paymentStatus: newPaymentStatus,
          }));
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // Safe Order Delete with Automatic Stock Inventory Restoration
  const handleDeleteOrder = async (orderId, orderNum) => {
    if (
      !confirm(
        `আপনি কি নিশ্চিত যে #${orderNum} অর্ডারটি ডিলিট করতে চান?\n\nযদি অর্ডারটি সক্রিয় থাকে, তবে পণ্যের স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফেরত যাবে।`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'অর্ডারটি সফলভাবে ডিলিট করা হয়েছে', 'success');
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails(null);
        }
        fetchOrders();
        fetchStats();
        fetchProducts();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('অর্ডার ডিলিট করতে সমস্যা হয়েছে: ' + err.message, 'error');
    }
  };

  if (!authReady || isLoading || !user || !isPrivileged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-[#016831] border-t-[#F59E0B] rounded-full animate-spin" />
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = (productSearch || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q);

    let matchesCat = productCategory === 'all';
    if (!matchesCat) {
      const selectedCat = categoriesList.find((c) => (c.slug || c.id) === productCategory);
      const catSlug = selectedCat?.slug?.toLowerCase()?.trim() || '';
      const catId = selectedCat?.id?.toLowerCase()?.trim() || '';
      const catName = selectedCat?.name?.toLowerCase()?.trim() || '';
      const norm = (s) => (s ? s.replace(/[^a-z0-9]/g, '') : '');
      const pCat = p.category?.toLowerCase()?.trim() || '';
      const pName = p.categoryName?.toLowerCase()?.trim() || '';
      const target = productCategory.toLowerCase().trim();

      matchesCat =
        pCat === target ||
        pName === target ||
        pName.includes(target) ||
        (selectedCat && (
          (catSlug && pCat === catSlug) ||
          (catId && pCat === catId) ||
          (catSlug && norm(catSlug) && (norm(catSlug).includes(norm(pCat)) || norm(pCat).includes(norm(catSlug)))) ||
          (catName && (pCat === catName || pName === catName || pName.includes(catName) || catName.includes(pName)))
        ));
    }

    const stockVal = p.stock !== undefined ? p.stock : 10;
    const matchesStock =
      productStockFilter === 'all'
        ? true
        : productStockFilter === 'low'
        ? stockVal > 0 && stockVal <= 5
        : stockVal <= 0;
    return matchesSearch && matchesCat && matchesStock;
  });

  // Enhanced Multi-Criteria Filter for Orders (Bengali numerals normalization, phone, items, city, risk, payment)
  const filteredOrders = useMemo(() => {
    const normalizeDigits = (str) =>
      (str || '')
        .toLowerCase()
        .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
        .trim();

    const cleanSearch = normalizeDigits(orderSearch).replace(/^#/, '');

    return orders.filter((o) => {
      const orderNum = normalizeDigits(o.orderNumber);
      const custPhone = normalizeDigits(o.customer?.phone).replace(/[^0-9]/g, '');
      const custName = (o.customer?.name || '').toLowerCase();
      const custCity = (o.customer?.city || '').toLowerCase();
      const itemMatch = o.items?.some((it) => (it.name || '').toLowerCase().includes(cleanSearch));

      const matchesSearch =
        !cleanSearch ||
        orderNum.includes(cleanSearch) ||
        custPhone.includes(cleanSearch) ||
        custName.includes(cleanSearch) ||
        custCity.includes(cleanSearch) ||
        itemMatch;

      const matchesStatus = orderFilter === 'all' || o.orderStatus === orderFilter;
      const matchesPayment = orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;
      const matchesRisk = orderRiskFilter === 'all' || o.fraudRisk === orderRiskFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesRisk;
    });
  }, [orders, orderSearch, orderFilter, orderPaymentFilter, orderRiskFilter]);

  const stats = statsData?.stats;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-slate-900">
      {/* ================= ADMIN TOP NAVIGATION ================= */}
      <header className="bg-[#014D24] text-white sticky top-0 z-40 shadow-md">
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
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-[#014D24] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#F59E0B] animate-in slide-in-from-top-4 space-y-2">
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
            actionMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#016831] text-white'
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
                  ? 'bg-[#016831] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#016831] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডার সমূহ ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#016831] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
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
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
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
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
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
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>কুপন ও কার্ট</span>
              </button>
            )}

            {/* RBAC: Dynamic Category Management */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'categories'
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
                }`}
              >
                <FolderPlus className="w-4 h-4 text-[#FAB116]" />
                <span>ক্যাটাগরি সমূহ</span>
              </button>
            )}

            {/* RBAC: Flash Sale & Dhamaka Offer Management */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('flash-sale')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'flash-sale'
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
                }`}
              >
                <Flame className="w-4 h-4 text-red-500 fill-current" />
                <span>ধামাকা অফার</span>
              </button>
            )}

            {/* RBAC: Dynamic Theme & Color Customizer */}
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'theme'
                    ? 'bg-[#016831] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
                }`}
              >
                <Palette className="w-4 h-4 text-[#FAB116]" />
                <span>কালার ও থিম</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#016831] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#016831] hover:bg-emerald-50/50'
              }`}
            >
              <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
              <span>লাইভ রিভিউ ({adminReviews.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2 text-slate-500 hover:text-[#016831] hover:bg-emerald-50 rounded-xl transition-colors"
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
                    const firstValidCat = effectiveCategories[0];
                    setEditingProduct(null);
                    setProductModalTab('basic');
                    setNewBenefitInput('');
                    setNewFeatureInput('');
                    setNewNutritionKey('');
                    setNewNutritionValue('');
                    setShowInlineAddCat(false);
                    setInlineCatError('');
                    setProductFormData({
                      ...initialProductFormState,
                      category: firstValidCat ? (firstValidCat.slug || firstValidCat.id) : '',
                      categoryName: firstValidCat ? firstValidCat.name : '',
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
                <div className="text-2xl font-black text-[#016831]">
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
                  <div className="text-2xl font-black text-[#016831]">
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
                  <div className="text-2xl font-black text-[#016831]">
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
                <h3 className="text-base font-bold text-[#016831] flex items-center gap-2">
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
                            <td className="py-3 px-4 font-mono font-bold text-[#016831]">
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
                            <td className="py-3 px-4 font-bold text-[#016831]">
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
                                className="px-2.5 py-1 bg-[#016831] text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800"
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
            <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="অর্ডার আইডি (#SKG-...), গ্রাহকের নাম, মোবাইল বা পণ্য দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="all">সব অর্ডার স্ট্যাটাস</option>
                    <option value="hold">🔴 অ্যান্টি-ফ্রড হোল্ড (Hold)</option>
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                    <option value="shipped">শিপড (Shipped)</option>
                    <option value="delivered">ডেলিভার্ড (Delivered)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>

                  {/* Payment Status Filter */}
                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="all">সব পেমেন্ট</option>
                    <option value="unpaid">ক্যাশ অন ডেলিভারি (বকেয়া)</option>
                    <option value="paid">পরিশোধিত (Paid)</option>
                  </select>

                  {/* Anti-Fraud Risk Filter */}
                  <select
                    value={orderRiskFilter}
                    onChange={(e) => setOrderRiskFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="all">সব ফ্রড রিস্ক</option>
                    <option value="high">🔴 উচ্চ ঝুঁকি (High Risk)</option>
                    <option value="medium">🟡 মধ্যম ঝুঁকি (Medium Risk)</option>
                    <option value="low">🟢 নিরাপদ গ্রাহক (Low Risk)</option>
                  </select>

                  {/* Reset Filters if active */}
                  {(orderSearch || orderFilter !== 'all' || orderPaymentFilter !== 'all' || orderRiskFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setOrderSearch('');
                        setOrderFilter('all');
                        setOrderPaymentFilter('all');
                        setOrderRiskFilter('all');
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      রিসেট
                    </button>
                  )}
                </div>
              </div>

              {/* Counter Indicator */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#E8E2D5]/50">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>মোট দৃশ্যমান অর্ডার:</span>
                  <span className="text-[#016831] font-black">{filteredOrders.length} টি</span>
                  {orders.length !== filteredOrders.length && (
                    <span className="text-slate-400"> (মোট ডাটাবেজে {orders.length} টি)</span>
                  )}
                </div>
                <div className="text-slate-400">
                  💡 পরামর্শ: পেমেন্ট স্ট্যাটাস পরিবর্তন করতে বিলের নিচে বকেয়া/পরিশোধিত ব্যাজে ক্লিক করুন।
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FDFBF7] text-slate-600 font-bold border-b border-[#E8E2D5]">
                    <tr>
                      <th className="py-3 px-4">অর্ডার ও কুরিয়ার</th>
                      <th className="py-3 px-4">তারিখ ও সময়</th>
                      <th className="py-3 px-4">গ্রাহক ও যোগাযোগ</th>
                      <th className="py-3 px-4">কুরিয়ার হিস্টোরি ও রিস্ক</th>
                      <th className="py-3 px-4">আইটেম ও ঠিকানা</th>
                      <th className="py-3 px-4">মোট বিল ও পেমেন্ট</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                          কোনো অর্ডার পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isHighRisk = order.fraudRisk === 'high' || order.orderStatus === 'hold';
                        const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
                        return (
                          <tr
                            key={order._id || order.orderNumber}
                            className={`transition-colors ${
                              isHighRisk
                                ? 'bg-red-50/80 border-l-4 border-red-500 hover:bg-red-100/50'
                                : 'hover:bg-emerald-50/20'
                            }`}
                          >
                            {/* 1. Order ID & Courier */}
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-[#016831]">
                                #{order.orderNumber}
                              </div>
                              {order.courierBooking?.isBooked ? (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                    <Truck className="w-3 h-3 text-emerald-600" />
                                    <span>{order.courierBooking.trackingCode}</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  কুরিয়ার বুকিং বাকি
                                </div>
                              )}
                            </td>

                            {/* 2. Date & Time */}
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {order.createdAt ? (
                                <>
                                  <div className="font-semibold text-slate-700">
                                    {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {new Date(order.createdAt).toLocaleTimeString('bn-BD', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </>
                              ) : (
                                'আজ'
                              )}
                            </td>

                            {/* 3. Customer & Contact */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{order.customer?.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <a
                                  href={`tel:${order.customer?.phone}`}
                                  className="text-amber-700 hover:underline font-mono text-xs"
                                  title="সরাসরি কল দিন"
                                >
                                  {order.customer?.phone}
                                </a>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/88${cleanPhone}?text=${encodeURIComponent(
                                      `সালামু আলাইকুম ${order.customer?.name || ''}, সাতক্ষীরা ঘর থেকে আপনার অর্ডারটি (#${order.orderNumber}) নিশ্চিতকরণের জন্য যোগাযোগ করা হয়েছে।`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
                                    title="WhatsApp-এ মেসেজ পাঠান"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* 4. Courier Fraud Badge */}
                            <td className="py-3 px-4">
                              <CourierFraudBadge
                                fraudRisk={order.fraudRisk}
                                successRate={order.courierHistory?.successRate}
                                cancelledDeliveries={order.courierHistory?.cancelledDeliveries}
                                compact={true}
                              />
                            </td>

                            {/* 5. Items & Address */}
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-semibold text-slate-900 truncate" title={order.items?.map((it) => it.name).join(', ')}>
                                {order.items?.length || 1}টি আইটেম (
                                {order.items?.map((it) => it.name).slice(0, 2).join(', ')}
                                {(order.items?.length || 0) > 2 ? '...' : ''})
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5" title={order.customer?.address}>
                                {order.customer?.address}, {order.customer?.city}
                              </div>
                            </td>

                            {/* 6. Total Bill & Payment Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-[#016831] text-sm">
                                ৳{order.totalAmount}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdatePaymentStatus(
                                    order._id,
                                    order.paymentStatus === 'paid' ? 'unpaid' : 'paid'
                                  )
                                }
                                title="পেমেন্ট স্ট্যাটাস টগল করতে ক্লিক করুন"
                                className={`mt-0.5 inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded cursor-pointer border transition-colors ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                }`}
                              >
                                {order.paymentStatus === 'paid' ? '✓ পরিশোধিত' : '⏳ বকেয়া (COD)'}
                              </button>
                            </td>

                            {/* 7. Order Status Dropdown */}
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

                            {/* 8. Actions */}
                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                              {!order.courierBooking?.isBooked && (
                                <button
                                  onClick={() => handleBookCourier(order._id)}
                                  disabled={bookingCourierLoading}
                                  className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                  title="১-ক্লিকে স্টিডফাস্ট কুরিয়ারে বুকিং করুন"
                                >
                                  <Truck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                                title="ভাউচার ও ৪×৬ কুরিয়ার শিপিং লেবেল প্রিন্ট করুন"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="p-1.5 text-[#016831] hover:bg-[#FEF3C7] rounded-lg transition-colors cursor-pointer"
                                title="সিকিউরিটি লগ ও বিস্তারিত দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                title="অর্ডার ডিলিট করুন (ইনভেন্টরি স্টক স্বয়ংক্রিয়ভাবে ফেরত যাবে)"
                              >
                                <Trash2 className="w-4 h-4" />
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
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831]"
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
                  className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none font-medium"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  {effectiveCategories.map((cat) => (
                    <option key={cat.slug || cat.id} value={cat.slug || cat.id}>
                      {cat.name}
                    </option>
                  ))}
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
                            <div className="font-bold text-[#016831] text-xs">{prod.name}</div>
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
                            <div className="font-bold text-[#016831]">৳{prod.price}</div>
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
                <h3 className="text-base sm:text-lg font-bold text-[#016831] flex items-center gap-2">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-[#FDFBF7] outline-none focus:border-[#016831]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FDFBF7] text-[#016831] border-b border-[#E8E2D5] font-bold">
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
                              <span className="font-bold text-[#016831]">{rev.productName}</span>
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

        {/* ===================== TAB 8: CATEGORIES MANAGEMENT ===================== */}
        {activeTab === 'categories' && isManagerOrAdmin && (
          <AdminCategoriesView
            onCategoriesUpdated={(newCats) => {
              if (Array.isArray(newCats)) {
                setCategoriesList(newCats);
              } else {
                fetchCategories();
              }
            }}
          />
        )}

        {/* ===================== TAB 9: FLASH SALE & DHAMAKA OFFERS ===================== */}
        {activeTab === 'flash-sale' && isManagerOrAdmin && (
          <AdminFlashSaleView allProducts={products} />
        )}

        {/* ===================== TAB 10: DYNAMIC THEME & COLOR PICKER ===================== */}
        {activeTab === 'theme' && isManagerOrAdmin && (
          <AdminThemeView showNotification={showNotification} />
        )}

        {/* ===================== PRODUCT CREATE / EDIT MODAL ===================== */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-[#FCFAF7] rounded-3xl p-5 sm:p-7 max-w-3xl w-full border border-[#E8E2D5] shadow-2xl my-6 space-y-4 max-h-[92vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#016831] text-[#F59E0B] flex items-center justify-center font-bold shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#016831]">
                      {editingProduct ? 'পণ্য ও বিস্তারিত বিবরণ সম্পাদনা' : 'নতুন পণ্য ও বিস্তারিত তথ্য যুক্ত করুন'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      পণ্যের মূল্য, ছবি, পূর্ণাঙ্গ বিবরণ, স্পেক্স, পুষ্টি ও সুবিধা ডাইনামিক ভাবে নিয়ন্ত্রণ করুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Step Tabs */}
              <div className="flex items-center gap-1.5 bg-[#EFE9DF] p-1.5 rounded-2xl flex-shrink-0 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setProductModalTab('basic')}
                  className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    productModalTab === 'basic' ? 'bg-[#016831] text-white shadow-xs' : 'text-[#016831] hover:bg-white/60'
                  }`}
                >
                  <Package className="w-4 h-4 text-[#F59E0B]" />
                  <span>১. মৌলিক তথ্য ও দাম</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('details')}
                  className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    productModalTab === 'details' ? 'bg-[#016831] text-white shadow-xs' : 'text-[#016831] hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#F59E0B]" />
                  <span>২. পূর্ণাঙ্গ বিবরণ ও স্পেক্স</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('benefits')}
                  className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    productModalTab === 'benefits' ? 'bg-[#016831] text-white shadow-xs' : 'text-[#016831] hover:bg-white/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>৩. উপকারিতা ও পুষ্টি</span>
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* ─── TAB 1: BASIC INFO & PRICING ─── */}
                {productModalTab === 'basic' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#016831] mb-1">
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
                          className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none focus:border-[#016831]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#016831] mb-1">
                          পণ্যের নাম (ইংরেজি / URL Slug)
                        </label>
                        <input
                          type="text"
                          value={productFormData.nameEn}
                          onChange={(e) =>
                            setProductFormData({ ...productFormData, nameEn: e.target.value })
                          }
                          placeholder="যেমন: Sundarbans Raw Honey"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none focus:border-[#016831]"
                        />
                      </div>
                    </div>

                    {/* Category Selection & Inline Quick Category Creator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-[#016831]">
                          ক্যাটাগরি <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowInlineAddCat(!showInlineAddCat);
                            setInlineCatError('');
                          }}
                          className="text-[11px] font-bold text-[#016831] hover:text-[#0D3528] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-[#016831]" />
                          <span>{showInlineAddCat ? '✕ প্যানেল বন্ধ করুন' : '+ নতুন ক্যাটাগরি তৈরি'}</span>
                        </button>
                      </div>

                      {/* Expandable Inline Quick Category Creation Card */}
                      {showInlineAddCat && (
                        <div className="p-3.5 bg-gradient-to-br from-emerald-50/90 to-amber-50/70 rounded-2xl border-2 border-[#016831]/30 shadow-xs space-y-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                            <span className="font-black text-[#016831] text-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>তাত্ক্ষণিক নতুন ক্যাটাগরি তৈরি করুন (হেডার ও হোমপেজে স্বয়ংক্রিয়ভাবে যুক্ত হবে)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowInlineAddCat(false);
                                setInlineCatError('');
                              }}
                              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>

                          {inlineCatError && (
                            <p className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-200">
                              ⚠️ {inlineCatError}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                                ক্যাটাগরির নাম (বাংলা) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={inlineCatData.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInlineCatData((prev) => ({
                                    ...prev,
                                    name: val,
                                  }));
                                }}
                                placeholder="যেমন: মশলা ও রান্নার উপকরণ"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:border-[#016831]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                                ইংরেজি নাম / Slug
                              </label>
                              <input
                                type="text"
                                value={inlineCatData.nameEn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                  setInlineCatData((prev) => ({
                                    ...prev,
                                    nameEn: val,
                                    slug: slug,
                                  }));
                                }}
                                placeholder="যেমন: Spices (spices)"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs outline-none focus:border-[#016831]"
                              />
                            </div>
                          </div>

                          {/* Quick Icon Selector */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              প্রতীক / আইকন নির্বাচন করুন:
                            </label>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {['🌿', '🍯', '🧈', '🌾', '🌶️', '🥭', '🥛', '🍪', '🐟', '📦', '✨', '☕', '🧂'].map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => setInlineCatData((prev) => ({ ...prev, icon: ic }))}
                                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                    inlineCatData.icon === ic
                                      ? 'bg-[#016831] text-white ring-2 ring-[#016831] scale-110 shadow-xs'
                                      : 'bg-white border border-stone-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {ic}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowInlineAddCat(false);
                                setInlineCatError('');
                              }}
                              className="px-3 py-1 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-50"
                            >
                              বাতিল
                            </button>
                            <button
                              type="button"
                              disabled={savingInlineCat}
                              onClick={handleSaveInlineCategory}
                              className="px-3.5 py-1.5 rounded-xl bg-[#016831] hover:bg-[#0D3528] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {savingInlineCat ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>সংরক্ষণ হচ্ছে...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ক্যাটাগরি তৈরি ও সিলেক্ট করুন</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <select
                            required
                            value={productFormData.category}
                            onChange={(e) => {
                              const catVal = e.target.value;
                              const matched = effectiveCategories.find(
                                (c) => (c.slug || c.id) === catVal
                              );
                              setProductFormData({
                                ...productFormData,
                                category: catVal,
                                categoryName: matched ? (matched.name || matched.nameBn || catVal) : catVal,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none font-medium"
                          >
                            <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
                            {productFormData.category &&
                              !effectiveCategories.some(
                                (c) => (c.slug || c.id) === productFormData.category
                              ) && (
                                <option value={productFormData.category}>
                                  {productFormData.categoryName || productFormData.category} (বর্তমান)
                                </option>
                              )}
                            {effectiveCategories.map((cat) => (
                              <option key={cat.slug || cat.id} value={cat.slug || cat.id}>
                                {cat.name} {cat.nameEn ? `(${cat.nameEn})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={productFormData.unit}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, unit: e.target.value })
                            }
                            placeholder="পরিমাপ একক (যেমন: ১ কেজি, ৫০০ গ্রাম, ১ পিস)"
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-[#016831] mb-1">
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
                          className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#016831] mb-1">
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
                          className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#016831] mb-1">
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
                          className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Multi-attribute variation matrix editor */}
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

                    {/* Product Image & Multi-Image Gallery */}
                    <ProductImageGalleryManager
                      primaryImage={productFormData.image}
                      galleryImages={productFormData.images}
                      onChange={({ primaryImage, galleryImages }) =>
                        setProductFormData({
                          ...productFormData,
                          image: primaryImage,
                          images: galleryImages,
                        })
                      }
                    />

                    {/* Short Description */}
                    <div>
                      <label className="block font-bold text-[#016831] mb-1">
                        সংক্ষিপ্ত বিবরণ (কার্ড ও হেডার সামারি)
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
                        placeholder="পণ্যের এক লাইনের আকর্ষণীয় সংক্ষিপ্ত বিবরণ..."
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: DETAILED DESCRIPTION & SPECS ─── */}
                {productModalTab === 'details' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Full Detailed Description */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-[#016831] text-xs flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#D97706]" />
                          <span>পণ্যের পূর্ণাঙ্গ বিস্তারিত বিবরণ (Full Detailed Description)</span>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {productFormData.description?.length || 0} অক্ষর
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={productFormData.description}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, description: e.target.value })
                        }
                        placeholder="পণ্যের পূর্ণাঙ্গ বিস্তারিত বিবরণ, গুণগত মান, খাঁটি কাঁচামালের উৎস, পুষ্টিগুণ ও প্রস্তুত প্রণালী লিখুন..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#FCFAF7] text-xs text-slate-900 leading-relaxed outline-none focus:border-[#016831]"
                      />
                      <p className="text-[11px] text-slate-500">
                        💡 ডিটেইলস পেজের <strong>&apos;পণ্যের বিবরণ&apos;</strong> ট্যাবে এই লেখাটি বিস্তারিতভাবে প্রদর্শিত হবে।
                      </p>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#016831]">
                        <Info className="w-4 h-4 text-[#D97706]" />
                        <span>এক নজরে স্পেসিফিকেশন তথ্য (Quick Specifications)</span>
                      </div>

                      {/* Origin & Harvest Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            উৎস স্থল (Origin / সংগ্রহ এলাকা)
                          </label>
                          <input
                            type="text"
                            value={productFormData.origin}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, origin: e.target.value })
                            }
                            placeholder="যেমন: সাতক্ষীরা, খুলনা বা সংগৃহীত এলাকা"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['সাতক্ষীরা', 'সুন্দরবন', 'খুলনা', 'যশোর', 'বাগেরহাট', 'দেশি নিজস্ব খামার'].map((txt) => (
                              <button
                                key={txt}
                                type="button"
                                onClick={() => setProductFormData({ ...productFormData, origin: txt })}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-[#016831] border border-slate-200 transition-colors"
                              >
                                {txt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            সংগ্রহ কাল / সিজন (Harvest Date)
                          </label>
                          <input
                            type="text"
                            value={productFormData.harvestDate}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, harvestDate: e.target.value })
                            }
                            placeholder="যেমন: তাজা নতুন সংগ্রহ বা চলতি মৌসুম"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['তাজা নতুন সংগ্রহ', 'চলতি মৌসুমের উৎপাদন', 'অর্গানিক ফার্ম ফ্রেশ', 'তাজা প্রস্তুতকৃত'].map((txt) => (
                              <button
                                key={txt}
                                type="button"
                                onClick={() => setProductFormData({ ...productFormData, harvestDate: txt })}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-[#016831] border border-slate-200 transition-colors"
                              >
                                {txt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Packaging & Purity Guarantee */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            প্যাকেজিং ধরন (Packaging)
                          </label>
                          <input
                            type="text"
                            value={productFormData.packaging}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, packaging: e.target.value })
                            }
                            placeholder="যেমন: বায়ুরোধী ফুড-গ্রেড প্যাকেট, জার বা বোতল"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['বায়ুরোধী ফুড-গ্রেড প্যাকেট', 'ফুড-গ্রেড এয়ারটাইট জার', 'কাঁচের প্রিমিয়াম বোতল', 'এয়ারটাইট কন্টেইনার', 'ইকো-ফ্রেন্ডলি বক্স'].map((txt) => (
                              <button
                                key={txt}
                                type="button"
                                onClick={() => setProductFormData({ ...productFormData, packaging: txt })}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-[#016831] border border-slate-200 transition-colors"
                              >
                                {txt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            মান ও বিশুদ্ধতা নিশ্চয়তা (Purity Guarantee)
                          </label>
                          <input
                            type="text"
                            value={productFormData.purityGuarantee}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, purityGuarantee: e.target.value })
                            }
                            placeholder="যেমন: ১০০% প্রাকৃতিক, অর্গানিক বা বিশুদ্ধতার নিশ্চয়তা"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['১০০% প্রাকৃতিক ও খাঁটি', 'ল্যাব টেস্ট সার্টিফাইড', 'শূন্য ভেজাল গ্যারান্টি', 'অর্গানিক ও প্রিজারভেটিভমুক্ত'].map((txt) => (
                              <button
                                key={txt}
                                type="button"
                                onClick={() => setProductFormData({ ...productFormData, purityGuarantee: txt })}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-[#016831] border border-slate-200 transition-colors"
                              >
                                {txt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Payment Terms & Delivery Timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            পেমেন্ট সুবিধা (Payment Terms)
                          </label>
                          <input
                            type="text"
                            value={productFormData.paymentTerms}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, paymentTerms: e.target.value })
                            }
                            placeholder="যেমন: ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            ডেলিভারি সময়সীমা (Delivery Timeline)
                          </label>
                          <input
                            type="text"
                            value={productFormData.deliveryTimeline}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, deliveryTimeline: e.target.value })
                            }
                            placeholder="যেমন: ঢাকা সিটির ভেতর ২৪-৪৮ ঘণ্টা, সারাদেশে ২-৩ কার্যদিবস"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Storage Advice */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-2">
                      <label className="block font-bold text-[#016831] text-xs">
                        সংরক্ষণ পদ্ধতি ও পরামর্শ (Storage Tips)
                      </label>
                      <textarea
                        rows={2}
                        value={productFormData.storageTips}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, storageTips: e.target.value })
                        }
                        placeholder="যেমন: আর্দ্রতামুক্ত ও শীতল স্থানে স্বাভাবিক তাপমাত্রায় বায়ুরোধী পাত্রে সংরক্ষণ করুন..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: BENEFITS & NUTRITION ─── */}
                {productModalTab === 'benefits' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Benefits Section */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-[#016831] text-xs flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-[#016831]" />
                          <span>মূল স্বাস্থ্য উপকারিতা ও গুণাগুণ ({productFormData.benefits?.length || 0} টি)</span>
                        </label>
                      </div>

                      {/* Add Benefit Input Bar */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBenefitInput}
                          onChange={(e) => setNewBenefitInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBenefit();
                            }
                          }}
                          placeholder="নতুন উপকারিতা লিখুন (যেমন: রোগ প্রতিরোধ ক্ষমতা বাড়ায়)"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddBenefit()}
                          className="px-4 py-2 bg-[#016831] text-white rounded-xl font-bold hover:bg-[#0D3528] transition-colors"
                        >
                          + যোগ করুন
                        </button>
                      </div>

                      {/* Quick Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> দ্রুত যোগ করুন:
                        </span>
                        {[
                          '১০০% খাঁটি ও নির্ভেজাল',
                          'রোগ প্রতিরোধ ক্ষমতা বাড়ায়',
                          'প্রাকৃতিক শক্তি ও পুষ্টি জোগায়',
                          'কোনো ক্ষতিকর প্রিজারভেটিভ নেই',
                          'পারিবারিক সুস্বাস্থ্যের জন্য নিরাপদ',
                          'ঐতিহ্যবাহী সেরা স্বাদের নিশ্চয়তা',
                        ].map((txt) => (
                          <button
                            key={txt}
                            type="button"
                            onClick={() => handleAddBenefit(txt)}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 text-[#016831] hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            + {txt}
                          </button>
                        ))}
                      </div>

                      {/* Benefits Badges */}
                      {productFormData.benefits && productFormData.benefits.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {productFormData.benefits.map((b, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between gap-2"
                            >
                              <span className="text-xs text-[#014D24] font-medium leading-snug">
                                ✓ {b}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBenefit(idx)}
                                className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50 flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          এখনো কোনো নির্দিষ্ট উপকারিতা যুক্ত করা হয়নি। খালি রাখলে ডিফল্ট প্রাকৃতিক গুণাগুণের নোট দেখাবে।
                        </p>
                      )}
                    </div>

                    {/* Nutrition Facts Section */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-[#016831] text-xs flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>পুষ্টি উপাদান চার্ট (Nutrition Facts)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadSampleNutrition}
                          className="text-[11px] text-[#B45309] hover:underline font-bold"
                        >
                          + নমুনা পুষ্টি তালিকা লোড করুন
                        </button>
                      </div>

                      {/* Add Nutrition Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <input
                          type="text"
                          value={newNutritionKey}
                          onChange={(e) => setNewNutritionKey(e.target.value)}
                          placeholder="পুষ্টির নাম (যেমন: ক্যালরি / শক্তি)"
                          className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                        />
                        <input
                          type="text"
                          value={newNutritionValue}
                          onChange={(e) => setNewNutritionValue(e.target.value)}
                          placeholder="পরিমাণ (যেমন: ৩২০ kcal)"
                          className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                        />
                        <button
                          type="button"
                          onClick={handleAddNutrition}
                          className="sm:col-span-1 px-3 py-2 bg-[#016831] text-white rounded-xl font-bold hover:bg-[#0D3528] transition-colors"
                        >
                          + যুক্ত করুন
                        </button>
                      </div>

                      {/* Added Nutrition Items */}
                      {productFormData.nutritionalInfo && Object.keys(productFormData.nutritionalInfo).length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                          {Object.entries(productFormData.nutritionalInfo).map(([k, v]) => (
                            <div
                              key={k}
                              className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between gap-1.5"
                            >
                              <div className="min-w-0">
                                <span className="block text-[10px] text-stone-500 truncate">{k}</span>
                                <span className="block text-xs font-bold text-[#016831] truncate">{v}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNutrition(k)}
                                className="text-red-400 hover:text-red-700 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          কোনো পুষ্টি উপাদান দেওয়া না থাকলে ডিটেইলস পেজে এই সেকশনটি লুকানো থাকবে।
                        </p>
                      )}
                    </div>

                    {/* Special Care Features Section */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                      <label className="block font-bold text-[#016831] text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                        <span>সাতক্ষীরা ঘর স্পেশাল কেয়ার পয়েন্ট (সাইডবার বুলেট পয়েন্ট)</span>
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeatureInput}
                          onChange={(e) => setNewFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          placeholder="যেমন: শতভাগ নিজস্ব তত্ত্বাবধানে সংগৃহীত বা কোনো ক্ষতিকর রাসায়নিক নেই"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] outline-none focus:border-[#016831]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFeature()}
                          className="px-4 py-2 bg-[#016831] text-white rounded-xl font-bold hover:bg-[#0D3528] transition-colors"
                        >
                          + যোগ করুন
                        </button>
                      </div>

                      {productFormData.specialFeatures && productFormData.specialFeatures.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {productFormData.specialFeatures.map((f, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                            >
                              <span className="text-xs text-slate-800">
                                ✓ {f}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="text-red-500 hover:text-red-700 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          খালি রাখলে গ্রাহক সাইট থেকে সাধারণ ৩টি বিশ্বস্ত কেয়ার পয়েন্ট দেখতে পাবেন।
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-3 border-t border-[#E8E2D5] flex-shrink-0">
                  <div className="text-[11px] text-slate-500">
                    {productModalTab === 'basic' && 'পরবর্তী ধাপে স্পেক্স ও পুষ্টি তথ্য যুক্ত করতে উপরে ট্যাবে ক্লিক করুন →'}
                    {productModalTab === 'details' && '← আগের ধাপ: বেসিক তথ্য | পরবর্তী ধাপ: উপকারিতা ও পুষ্টি →'}
                    {productModalTab === 'benefits' && 'সব তথ্য পূরণ সম্পন্ন হলে সংরক্ষণ বাটনে ক্লিক করুন!'}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setProductModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl transition-all shadow-md hover:scale-[1.02]"
                    >
                      {editingProduct ? 'আপডেট সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                    </button>
                  </div>
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
                  <h3 className="text-base font-bold text-[#016831]">
                    অর্ডার বিস্তারিত: #{selectedOrderDetails.orderNumber}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  ✕
                </button>
              </div>

              {/* Anti-Fraud Hold Action Notice */}
              {selectedOrderDetails.orderStatus === 'hold' && (
                <div className="bg-red-50 border border-red-300 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-red-900 font-bold">
                    ⚠️ অ্যান্টি-ফ্রড সতর্কতা: গ্রাহককে ফোন করে ঠিকানা যাচাই করুন।
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails._id, 'processing')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs whitespace-nowrap cursor-pointer transition-colors"
                  >
                    ✓ যাচাই সম্পন্ন (Approve)
                  </button>
                </div>
              )}

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
                  <span className="font-bold text-[#016831] flex items-center gap-1.5">
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
                  <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-[#E8E2D5] space-y-1">
                    <div>কুরিয়ার: <strong>{selectedOrderDetails.courierBooking.courierName}</strong></div>
                    <div>ট্র্যাকিং কোড: <strong className="text-amber-700">{selectedOrderDetails.courierBooking.trackingCode}</strong></div>
                    <div>কনসাইনমেন্ট নং: <strong>{selectedOrderDetails.courierBooking.consignmentId}</strong></div>
                  </div>
                ) : (
                  <button
                    disabled={bookingCourierLoading}
                    onClick={() => handleBookCourier(selectedOrderDetails._id)}
                    className="w-full py-2 bg-[#016831] hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
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

              {/* Customer Box with Direct Call and WhatsApp */}
              <div className="bg-[#FDFBF7] p-4 rounded-2xl text-xs space-y-2 border border-[#E8E2D5]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#016831]">গ্রাহকের যোগাযোগ তথ্য:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedOrderDetails.customer?.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>কল দিন</span>
                    </a>
                    {selectedOrderDetails.customer?.phone && (
                      <a
                        href={`https://wa.me/88${selectedOrderDetails.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `সালামু আলাইকুম ${selectedOrderDetails.customer.name || ''}, সাতক্ষীরা ঘর থেকে আপনার #${selectedOrderDetails.orderNumber} অর্ডারটি নিশ্চিতকরণের জন্য যোগাযোগ করা হয়েছে।`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-slate-800">
                  <div><strong>নাম:</strong> {selectedOrderDetails.customer?.name}</div>
                  <div><strong>মোবাইল:</strong> <span className="font-mono text-amber-800 font-bold">{selectedOrderDetails.customer?.phone}</span></div>
                  <div><strong>ঠিকানা:</strong> {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
                  {selectedOrderDetails.customer?.notes && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 mt-1">
                      <strong>গ্রাহকের নোট:</strong> {selectedOrderDetails.customer.notes}
                    </div>
                  )}
                  <div><strong>পেমেন্ট মাধ্যম:</strong> {selectedOrderDetails.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : selectedOrderDetails.paymentMethod}</div>
                </div>
              </div>

              {/* Status and Payment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-[#E8E2D5]">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">অর্ডার স্ট্যাটাস:</label>
                  <select
                    value={selectedOrderDetails.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails._id, e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="hold">🔴 হোল্ড (Hold)</option>
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
                    <option value="shipped">শিপড (Shipped)</option>
                    <option value="delivered">ডেলিভার্ড (Delivered)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">পেমেন্ট অবস্থা:</label>
                  <select
                    value={selectedOrderDetails.paymentStatus || 'unpaid'}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrderDetails._id, e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="unpaid">ক্যাশ অন ডেলিভারি (বকেয়া - Unpaid)</option>
                    <option value="paid">পরিশোধিত (Paid)</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#016831]">অর্ডারকৃত আইটেম:</h4>
                <div className="divide-y divide-[#E8E2D5] max-h-40 overflow-y-auto">
                  {selectedOrderDetails.items?.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[11px] text-slate-400">
                          ৳{it.price} × {it.quantity} {it.unit}
                        </div>
                      </div>
                      <div className="font-bold text-[#016831]">
                        ৳{it.price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D5] flex justify-between items-center text-sm font-bold text-[#016831]">
                <span>সর্বমোট বিল:</span>
                <span>৳{selectedOrderDetails.totalAmount}</span>
              </div>

              {/* Action Buttons: Print & Delete */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(selectedOrderDetails)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>ভাউচার ও ৪×৬ কুরিয়ার শিপিং লেবেল প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrderDetails._id, selectedOrderDetails.orderNumber)}
                  className="p-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-2xl transition-colors cursor-pointer"
                  title="অর্ডার মুছে ফেলুন (স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফেরত যাবে)"
                >
                  <Trash2 className="w-5 h-5" />
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
          categoriesList={effectiveCategories}
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
