/**
 * High-Performance Non-Blocking Analytics & E-Commerce Event Dispatcher
 * Dispatches standard events to Google Tag Manager (dataLayer), GA4, and Meta (Facebook) Pixel
 * Guaranteed safe execution without blocking UI rendering or main-thread performance.
 */

export const trackPageView = (url) => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Google Tag Manager / GA4 DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: url || window.location.pathname,
      page_title: document.title,
    });

    // 2. Meta (Facebook) Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  } catch (err) {
    // Silent fail to ensure application stability
  }
};

export const trackViewItem = (product) => {
  if (typeof window === 'undefined' || !product) return;

  try {
    const id = String(product.id || product._id || product.slug);
    const name = product.name || 'Product';
    const price = Number(product.price) || 0;
    const category = product.categoryName || product.category || 'Food';

    // 1. GTM / GA4 E-commerce Event: view_item
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: price,
        items: [
          {
            item_id: id,
            item_name: name,
            item_category: category,
            price: price,
            quantity: 1,
          },
        ],
      },
    });

    // 2. Meta Pixel Standard Event: ViewContent
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: name,
        content_category: category,
        content_ids: [id],
        content_type: 'product',
        value: price,
        currency: 'BDT',
      });
    }
  } catch (err) {}
};

export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window === 'undefined' || !product) return;

  try {
    const id = String(product.id || product._id || product.slug);
    const name = product.name || 'Product';
    const price = Number(product.price) || 0;
    const qty = Number(quantity) || 1;
    const category = product.categoryName || product.category || 'Food';

    // 1. GTM / GA4 E-commerce Event: add_to_cart
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: price * qty,
        items: [
          {
            item_id: id,
            item_name: name,
            item_category: category,
            price: price,
            quantity: qty,
          },
        ],
      },
    });

    // 2. Meta Pixel Standard Event: AddToCart
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_name: name,
        content_category: category,
        content_ids: [id],
        content_type: 'product',
        value: price * qty,
        currency: 'BDT',
      });
    }
  } catch (err) {}
};

export const trackInitiateCheckout = (items = [], totalValue = 0) => {
  if (typeof window === 'undefined' || !Array.isArray(items) || items.length === 0) return;

  try {
    const value = Number(totalValue) || 0;
    const contentIds = items.map((item) => String(item.id || item.slug || item._id));

    // 1. GTM / GA4 E-commerce Event: begin_checkout
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: value,
        items: items.map((item) => ({
          item_id: String(item.id || item.slug || item._id),
          item_name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
      },
    });

    // 2. Meta Pixel Standard Event: InitiateCheckout
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: items.length,
        value: value,
        currency: 'BDT',
      });
    }
  } catch (err) {}
};

export const trackPurchase = (order) => {
  if (typeof window === 'undefined' || !order) return;

  try {
    const orderId = order.orderNumber || order._id || order.id || `SKG-${Date.now()}`;
    const totalAmount = Number(order.totalAmount || order.total || order.subtotal || 0);
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const contentIds = orderItems.map((item) => String(item.id || item.slug || item.productId || item._id));

    // 1. GTM / GA4 E-commerce Event: purchase
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: String(orderId),
        value: totalAmount,
        currency: 'BDT',
        shipping: Number(order.deliveryFee || order.shippingFee || 0),
        coupon: order.couponCode || '',
        items: orderItems.map((item) => ({
          item_id: String(item.id || item.slug || item.productId || item._id),
          item_name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
      },
    });

    // 2. Meta Pixel Standard Event: Purchase
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: orderItems.length,
        value: totalAmount,
        currency: 'BDT',
      });
    }
  } catch (err) {}
};
