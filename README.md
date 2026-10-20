# সাতক্ষীরা ঘর (Satkhira Ghor) - Organic E-Commerce Platform

> Comprehensive Next.js 14+ (App Router) e-commerce boilerplate built for **Satkhira Ghor** (সাতক্ষীরা ঘর), featuring pure & organic food products from the Sundarbans and coastal Satkhira region of Bangladesh.

---

## 🎨 Custom Brand Color Palette

Configured in `tailwind.config.js` and `app/globals.css`:

| Brand Color | Hex Code | Tailwind Token | Description |
| :--- | :--- | :--- | :--- |
| **Forest Green** | `#1b4332` | `bg-brandGreen` / `text-brandGreen` | গাঢ় জঙ্গল সবুজ (Deep Forest Green) |
| **Honey Gold** | `#ffb703` | `bg-brandHoney` / `text-brandHoney` | মধুর সোনালী রঙ (Honey Gold) |
| **Mustard / Ochre** | `#e65f2b` | `bg-brandMustard` / `text-brandMustard` | সরিষা বা কাঁকড়ার টেক্সচার রঙ (Mustard/Ochre) |
| **Creamy Off-white**| `#faf9f6` | `bg-brandOrganic` / `text-brandOrganic` | অফ-হোয়াইট ব্যাকগ্রাউন্ড (Creamy Organic) |

**Bangla Typography**: `font-bangla` (`['SolaimanLipi', 'sans-serif']`)

---

## 📁 Project Architecture & Folder Structure

```
satkhir-ghor/
├── app/
│   ├── layout.js                     # Root layout with fonts, metadata, Header, Footer, and CartDrawer
│   ├── page.js                       # Home landing page with hero, categories, featured, trust badges
│   ├── globals.css                   # Tailwind CSS v4 directives, color tokens, and custom animations
│   ├── shop/
│   │   └── page.js                   # Shop catalog with category filter, search, and sorting
│   ├── products/
│   │   └── [slug]/
│   │       └── page.js               # Dynamic product details route, image gallery, specs, add-to-cart
│   ├── about-us/
│   │   └── page.js                   # About Satkhira Ghor, Sundarbans story, Mouyal support, mission
│   ├── about/
│   │   └── page.js                   # Compatibility route re-exporting AboutUsPage
│   └── cart/
│       └── page.js                   # Dedicated cart review, coupon voucher, and checkout form
├── components/
│   ├── common/
│   │   ├── Header.js                 # Sticky responsive navigation with live Zustand cart badge
│   │   ├── Footer.js                 # Brand story, customer support hotline, trust pillars, links
│   │   ├── CartDrawer.js             # Slide-over cart drawer with quantity stepper & free shipping bar
│   │   └── Badge.js                  # Organic badge tag component
│   ├── home/
│   │   ├── HeroBanner.js             # Hero section with CTA, stats, and floating trust elements
│   │   ├── CategorySection.js        # Interactive category cards (Honey, Ghee, Mustard Oil, Sweets)
│   │   ├── FeaturedProducts.js       # Top-rated products showcase
│   │   ├── WhyChooseUs.js            # Purity pillars (Zero Adulteration, Direct Sourcing, Lab Tested)
│   │   └── Testimonials.js           # Verified customer reviews
│   └── product/
│       ├── ProductCard.js            # Card with hover zoom, discount badges, ratings, quick add-to-cart
│       ├── ProductGrid.js            # Responsive grid presentation
│       ├── ProductGallery.js         # Interactive product image viewer with thumbnails
│       └── AddToCartButton.js        # Quantity stepper, add-to-cart trigger, and instant buy-now
├── data/
│   └── products.js                   # Rich product catalog, categories, pricing, health benefits & nutrition
├── store/
│   └── cartStore.js                  # Zustand store with localStorage persistence for cart state
├── jsconfig.json                     # Path alias `@/*` configuration
├── next.config.mjs                   # Next.js image domain configuration
├── postcss.config.mjs                # PostCSS configuration for Tailwind
├── tailwind.config.js                # Custom organic colors, typography, and shadow tokens
├── package.json                      # Next.js 14, React 18, Zustand, Lucide-react, Tailwind CSS
└── README.md                         # Documentation
```

---

## 🛒 Shopping Cart State (Zustand)

Location: [`store/cartStore.js`](store/cartStore.js)

```javascript
import { useCartStore } from '@/store/cartStore';

// Accessing state
const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice, openCart } = useCartStore();

// Adding an item:
addItem(product, 1);
```

- **Persistence**: Automatically synced with browser `localStorage` under `satkhira-ghor-cart-storage`.
- **Drawer Controls**: `openCart()`, `closeCart()`, `toggleCart()`.
- **Selectors**: `getTotalItems()`, `getTotalPrice()`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```
# Satkhira-ghor
