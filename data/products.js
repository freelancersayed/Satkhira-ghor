export const categories = [
  {
    id: 'all',
    name: 'সব পণ্য',
    nameEn: 'All Products',
    slug: 'all',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    description: 'সাতক্ষীরা ও সুন্দরবনের সকল খাঁটি প্রাকৃতিক খাদ্য সম্ভার'
  },
  {
    id: 'honey',
    name: 'সুন্দরবনের মধু',
    nameEn: 'Sundarbans Honey',
    slug: 'honey',
    icon: '🍯',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    description: 'মৌয়ালদের দ্বারা গভীর সুন্দরবন থেকে সংগৃহীত অপরিশোধিত কাঁচা মধু'
  },
  {
    id: 'ghee',
    name: 'খাঁটি গাওয়া ঘি',
    nameEn: 'Pure Bilona Ghee',
    slug: 'ghee',
    icon: '🧈',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=400',
    description: 'দেশি গাভীর দুধের দই মন্থন করে প্রাচীন বিলোনা পদ্ধতিতে প্রস্তুত দানাদার ঘি'
  },
  {
    id: 'oil',
    name: 'সরিষার তেল',
    nameEn: 'Mustard Oil',
    slug: 'oil',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
    description: 'দেশি মাঘী সরিষা থেকে কাঠের ঘানিতে ধীর চাপে ভাঙা ঝাঁজালো তেল'
  },
  {
    id: 'sweets',
    name: 'সাতক্ষীরার সন্দেশ',
    nameEn: 'Heritage Sweets',
    slug: 'sweets',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400',
    description: 'খাঁটি ছানা ও ক্ষীর দিয়ে শতবর্ষের ঐতিহ্যবাহী রেসিপিতে তৈরি ক্ষীর সন্দেশ'
  },
  {
    id: 'seeds',
    name: 'সুপারফুড ও বীজ',
    nameEn: 'Seeds & Superfoods',
    slug: 'seeds',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=400',
    description: 'চিয়া সিড, কুমড়ার বীজ, সূর্যমুখী বীজ ও খাঁটি অর্গানিক মরিঙ্গা পাউডার'
  },
  {
    id: 'combos',
    name: 'স্পেশাল কম্বো অফার',
    nameEn: 'Mega Combo Deals',
    slug: 'combos',
    icon: '🎁',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
    description: 'একক প্যাকেজে প্রয়োজনীয় খাঁটি খাবার সাশ্রয়ী মূল্যে পান'
  },
  {
    id: 'pickles',
    name: 'ঘরোয়া আচার ও মশলা',
    nameEn: 'Pickles & Spices',
    slug: 'pickles',
    icon: '🌶️',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
    description: 'ঘানি ভাঙা তেলে তৈরি ঘরোয়া সুস্বাদু আচার ও বাছাইকৃত দেশি মশলা'
  },
];

export const products = [
  {
    id: 'prod-001',
    name: 'সুন্দরবনের খাঁটি খলসী ফুলের মধু',
    nameEn: 'Sundarbans Pure Khalsi Flower Raw Honey',
    slug: 'sundarbans-pure-khalsi-honey',
    category: 'honey',
    categoryName: 'সুন্দরবনের মধু',
    price: 1250,
    originalPrice: 1450,
    unit: '১ কেজি (1 kg)',
    rating: 4.9,
    reviewCount: 148,
    stock: 28,
    badge: 'সেরা বিক্রয়',
    badgeType: 'forest',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'সাতক্ষীরার শ্যামনগর সীমান্ত লাগোয়া সুন্দরবনের গভীর অরণ্য থেকে ঐতিহ্যবাহী মৌয়ালদের দ্বারা সংগৃহীত অপ্রক্রিয়াজাত শতভাগ খাঁটি খলসী ফুলের মধু।',
    description: 'খলসী ফুলের মধু সুন্দরবনের মধুর মধ্যে সবচেয়ে হালকা রঙের ও সুস্বাদু। এতে কোনো ধরনের চিনি, প্রিজারভেটিভ বা রাসায়নিক মিশ্রণ নেই। এটি সম্পূর্ণ অপরিশোধিত ও কাঁচা (raw), যা প্রাকৃতিক এনজাইম, পরাগরেণু এবং অ্যান্টিঅক্সিডেন্টে ভরপুর। ঠান্ডা ও কাশি নিরাময়ে এবং রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে অনন্য।',
    origin: 'গভীর সুন্দরবন, শ্যামনগর, সাতক্ষীরা',
    harvestDate: 'মার্চ - এপ্রিল ২০২৬',
    benefits: [
      '১০০% প্রাকৃতিক ও অপরিশোধিত (Unprocessed Raw Honey)',
      'রোগ প্রতিরোধ ক্ষমতা দ্বিগুণ করতে সহায়ক',
      'গলাব্যথা, খুসখুসে কাশি ও শ্বাসকষ্ট উপশমে অত্যন্ত কার্যকর',
      'হজমশক্তি বৃদ্ধি ও শারীরিক ক্লান্তি দূর করে'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৩০৪ কিলোক্যালরি',
      'প্রাকৃতিক শর্করা': '৮২ গ্রাম',
      'প্রোটিন': '০.৩ গ্রাম',
      'পটাশিয়াম': '৫২ মিলিগ্রাম',
      'অ্যান্টিঅক্সিডেন্ট': 'উচ্চ মাত্রায় উপস্থিত'
    }
  },
  {
    id: 'prod-002',
    name: 'সাতক্ষীরার খাঁটি গাওয়া ঘি (বিলোনা পদ্ধতি)',
    nameEn: 'Traditional Bilona Pure Cow Deshi Ghee',
    slug: 'traditional-bilona-pure-cow-ghee',
    category: 'ghee',
    categoryName: 'খাঁটি গাওয়া ঘি',
    price: 1850,
    originalPrice: 2100,
    unit: '১ কেজি (1 kg)',
    rating: 5.0,
    reviewCount: 96,
    stock: 22,
    badge: 'প্রিমিয়াম কোয়ালিটি',
    badgeType: 'honey',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'সাতক্ষীরার প্রত্যন্ত গ্রামের দেশি ঘাস-খাওয়া গরুর দুধের দই মন্থন করে প্রাচীন বিলোনা পদ্ধতিতে প্রস্তুতকৃত খাঁটি দানাদার গাওয়া ঘি।',
    description: 'আমাদের গাওয়া ঘি সরাসরি সাতক্ষীরার খামারিদের দেশি গাভীর কাঁচা দুধ থেকে তৈরি করা হয়। মাখনের মতো মসৃণ টেক্সচার ও মন মাতানো প্রাকৃতিক সুবাস আপনার দৈনন্দিন খাবারের স্বাদ বহুগুণ বাড়িয়ে দেবে। এতে কোনো কৃত্রিম ফ্লেভার বা ডালডার লেশমাত্র নেই।',
    origin: 'তালা ও কলারোয়া উপজেলা, সাতক্ষীরা',
    harvestDate: 'তাজা সংগ্রহীত প্রতি সপ্তাহে',
    benefits: [
      'শতভাগ খাঁটি দেশি গরুর দুধের ননী থেকে প্রস্তুত',
      'মন মাতানো প্রাকৃতিক সুবাস ও আকর্ষণীয় দানাদার টেক্সচার',
      'ওমেগা-৩ ও ওমেগা-৯ ফ্যাটি অ্যাসিডে সমৃদ্ধ',
      'স্মৃতিশক্তি বৃদ্ধি ও জয়েন্টের নমনীয়তা রক্ষায় উপকারী'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৯০০ কিলোক্যালরি',
      'ফ্যাট': '৯৯.৫ গ্রাম',
      'ভিটামিন এ': 'প্রচুর পরিমাণে',
      'কোলেস্টেরল': 'প্রাকৃতিক স্বাস্থ্যকর ফ্যাট'
    }
  },
  {
    id: 'prod-003',
    name: 'কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল',
    nameEn: 'Cold Pressed Traditional Mustard Oil (Ghani)',
    slug: 'cold-pressed-mustard-oil-ghani',
    category: 'oil',
    categoryName: 'সরিষার তেল',
    price: 360,
    originalPrice: 420,
    unit: '১ লিটার (1 L)',
    rating: 4.8,
    reviewCount: 112,
    stock: 50,
    badge: 'ন্যাচারাল ফ্রেশ',
    badgeType: 'ochre',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'দেশি মাঘী সরিষা দানা থেকে কাঠের ঘানিতে ধীর গতিতে ঠান্ডা চাপে প্রস্তুত খাঁটি ঝাঁজালো সরিষার তেল।',
    description: 'উচ্চ তাপে তেলের পুষ্টি নষ্ট হয়, তাই আমরা কাঠের ঘানিতে কোল্ড-প্রেসড উপায়ে তেল সংগ্রহ করি। ভর্তা, ইলিশ ভাজা কিংবা রূপচর্চায় খাঁটি ঘানি ভাঙা সরিষার তেলের তুলনা নেই। কোনো কেমিক্যাল রিফাইনিং করা হয়নি।',
    origin: 'আশাশুনি, সাতক্ষীরা',
    harvestDate: 'নভেম্বর - জানুয়ারি ২০২৬',
    benefits: [
      'প্রাকৃতিক তীব্র ঝাঁজ ও অক্ষুণ্ণ পুষ্টিগুণ',
      'কোল্ড-প্রেসড (Cold Pressed) পদ্ধতিতে নিষ্কাশিত',
      'হৃদযন্ত্র সুস্থ রাখতে ও রক্তসঞ্চালন বাড়াতে সহায়ক',
      'রান্না ও চর্মরোগ সুরক্ষায় অনন্য'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ মিলি ক্যালরি': '৮৮৪ কিলোক্যালরি',
      'মনো-আনস্যাচুরেটেড ফ্যাট': '৬০ গ্রাম',
      'পলি-আনস্যাচুরেটেড ফ্যাট': '২১ গ্রাম',
      'ট্রান্স ফ্যাট': '০ গ্রাম'
    }
  },
  {
    id: 'prod-004',
    name: 'সাতক্ষীরার ঐতিহ্যবাহী খাঁটি ক্ষীর সন্দেশ',
    nameEn: 'Satkhira Heritage Pure Kheer Sandesh Sweet',
    slug: 'satkhira-heritage-kheer-sandesh',
    category: 'sweets',
    categoryName: 'সাতক্ষীরার সন্দেশ',
    price: 850,
    originalPrice: 950,
    unit: '১ কেজি বক্স',
    rating: 5.0,
    reviewCount: 220,
    stock: 15,
    badge: 'ঐতিহ্যবাহী স্বাদ',
    badgeType: 'honey',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'সাতক্ষীরার শতবর্ষের ঐতিহ্যবাহী রেসিপিতে দেশি গরুর টাটকা ছানা ও ক্ষীর দিয়ে তৈরি অমৃততুল্য ক্ষীর সন্দেশ।',
    description: 'সাতক্ষীরার ক্ষীর সন্দেশের খ্যাতি দেশজুড়ে। মুখে দেওয়া মাত্রই গলে যায় এর মোলায়েম স্বাদ। কোনো গুঁড়ো দুধ বা ময়দার ভেজাল নেই, কেবল খাঁটি গরুর দুধের নির্যাস। বিশেষ বক্স প্যাকেজিংয়ে ঢাকাসহ সারাদেশে ২৪ ঘণ্টার মধ্যে পৌঁছে দেওয়া হয়।',
    origin: 'সাতক্ষীরা সদর ও দেবহাটা',
    harvestDate: 'প্রতিদিন প্রস্তুত তাজা মিষ্টি',
    benefits: [
      '১০০% খাঁটি গরুর তরল দুধের তাজা ছানা',
      'কোনো কৃত্রিম রং, প্রিজারভেটিভ বা রাসায়নিক নেই',
      'পরিমিত মিষ্টি ও অতুলনীয় প্রাকৃতিক স্বাদ',
      'পারিবারিক যেকোনো উৎসবের জন্য সেরা উপহার'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৩৬০ কিলোক্যালরি',
      'প্রোটিন': '১২ গ্রাম',
      'ক্যালসিয়াম': 'উচ্চ সমৃদ্ধ'
    }
  },
  {
    id: 'prod-005',
    name: 'সুন্দরবনের কালোজিরা ফুলের মধু',
    nameEn: 'Sundarbans Pure Kalojira Flower Honey',
    slug: 'sundarbans-kalojira-flower-honey',
    category: 'honey',
    categoryName: 'সুন্দরবনের মধু',
    price: 1350,
    originalPrice: 1550,
    unit: '১ কেজি (1 kg)',
    rating: 4.9,
    reviewCount: 84,
    stock: 20,
    badge: 'মহৌষধ গুণ',
    badgeType: 'forest',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'কালোজিরা ফুলের গাঢ় রঙের আঠালো প্রাকৃতিক মধু—যার নিরাময় ক্ষমতা সর্বজনবিদিত।',
    description: 'কালোজিরা ফুলের মধু এর অনন্য মিষ্টি স্বাদ এবং ওষধি গুণাবলীর জন্য অত্যন্ত সমাদৃত। এতে থাকে প্রাকৃতিকভাবে উচ্চ আয়রন ও মিনারেল যা রক্তস্বল্পতা ও শারীরিক দুর্বলতা দূর করতে অত্যন্ত ফলপ্রসূ।',
    origin: 'সাতক্ষীরা সুন্দরবন উপকূল',
    harvestDate: 'জানুয়ারি - ফেব্রুয়ারি ২০২৬',
    benefits: [
      'গাঢ় মিষ্টি স্বাদ ও প্রাকৃতিক ওষধি কার্যকারিতা',
      'হৃদরোগ ও রক্তচাপ নিয়ন্ত্রণে সাহায্য করে',
      'শীতকালীন সর্দি-কাশি থেকে মুক্ত রাখে'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৩১০ কিলোক্যালরি',
      'আয়রন': 'প্রাকৃতিক সমৃদ্ধ'
    }
  },
  {
    id: 'prod-006',
    name: 'সাতক্ষীরা সুন্দরবন মেগা ফ্যামিলি কম্বো',
    nameEn: 'Satkhira Sundarbans Mega Family Combo Pack',
    slug: 'satkhira-sundarbans-mega-family-combo',
    category: 'combos',
    categoryName: 'স্পেশাল কম্বো অফার',
    price: 2450,
    originalPrice: 2880,
    unit: '৩টি সেরা পণ্য বান্ডেল',
    rating: 5.0,
    reviewCount: 165,
    stock: 35,
    badge: 'মেগা সেভিংস অফার',
    badgeType: 'honey',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'খলসী মধু ১ কেজি + বিলোনা গাওয়া ঘি ৫০০ গ্রাম + ঘানি ভাঙা সরিষার তেল ১ লিটার — এক প্যাকেজে বিশাল সাশ্রয়!',
    description: 'পরিবারের সুস্থতায় প্রয়োজনীয় ৩টি খাঁটি খাদ্যপণ্য এক সাথে নিয়ে এলো সাতক্ষীরা ঘর। আলাদা কিনলে খরচ হতো ২৮৮০ টাকা, কম্বো প্যাকে পাচ্ছেন মাত্র ২৪৫০ টাকায় (সরাসরি ৪৩০ টাকা সাশ্রয়) এবং সাথে পাচ্ছেন সারা বাংলাদেশে ফ্রি ডেলিভারি!',
    origin: 'সাতক্ষীরা ও সুন্দরবন',
    harvestDate: 'তাজা সংগ্রহ ও প্যাকিং',
    benefits: [
      'এক অর্ডারে সরাসরি ৪৩০ টাকা নগদ সাশ্রয়',
      'সারা বাংলাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি',
      'পরিবারের সকালের নাস্তা ও রান্নাঘরে ১০০% বিশুদ্ধতার নিশ্চয়তা',
      'উপহার হিসেবে প্রেরণের জন্য প্রিমিয়াম প্যাকেজিং'
    ],
    nutritionalInfo: {
      'অন্তর্ভুক্ত উপাদান': 'মধু ১ কেজি, ঘি ৫০০ গ্রাম, সরিষার তেল ১ লিটার',
      'কোয়ালিটি গ্রেড': '১০০% পিওর অ্যান্ড ন্যাচারাল'
    }
  },
  {
    id: 'prod-007',
    name: 'প্রিমিয়াম অর্গানিক চিয়া সিড (সুপারফুড)',
    nameEn: 'Premium Organic Superfood Chia Seeds',
    slug: 'premium-organic-chia-seeds',
    category: 'seeds',
    categoryName: 'সুপারফুড ও বীজ',
    price: 450,
    originalPrice: 550,
    unit: '৫০০ গ্রাম জার',
    rating: 4.9,
    reviewCount: 78,
    stock: 40,
    badge: 'হাই-ফাইবার সুপারফুড',
    badgeType: 'forest',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'ওমেগা-৩ ও ডায়েটারি ফাইবারে ভরপুর এ-গ্রেড অর্গানিক চিয়া সিড—ওজন নিয়ন্ত্রণ ও শক্তি বৃদ্ধির আদর্শ খাদ্য।',
    description: 'আমাদের প্রিমিয়াম চিয়া সিড সম্পূর্ণ ধুলোবালি ও কেমিক্যালমুক্ত। পানিতে বা লেবুর শরবতে ভিজিয়ে কিংবা সালাদ ও স্মুদির সাথে এটি নিয়মিত খেলে মেটাবলিজম বাড়ে, রক্তে সুগার নিয়ন্ত্রণে থাকে এবং শরীর দীর্ঘক্ষণ চাঙ্গা থাকে।',
    origin: 'বিশ্বস্ত অর্গানিক আমদানি ও স্থানীয় কোয়ালিটি প্যাক',
    harvestDate: 'মার্চ ২০২৬',
    benefits: [
      'প্রচুর পরিমাণে ওমেগা-৩ ফ্যাটি এসিড ও প্রোটিন',
      'ওজন নিয়ন্ত্রণ ও দীর্ঘক্ষণ পেট ভরা রাখতে সাহায্য করে',
      'হজমশক্তি বৃদ্ধি ও কোষ্ঠকাঠিন্য দূর করে',
      'হাড়ের ঘনত্ব ও ত্বক সুস্থ রাখতে সহায়ক'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৪৮৬ কিলোক্যালরি',
      'ডায়েটারি ফাইবার': '৩৪.৪ গ্রাম',
      'প্রোটিন': '১৬.৫ গ্রাম',
      'ওমেগা-৩': '১৭.৮ গ্রাম'
    }
  },
  {
    id: 'prod-008',
    name: 'সাতক্ষীরার খাঁটি নলেন গুড়ের সন্দেশ',
    nameEn: 'Satkhira Special Nolen Gur Sandesh',
    slug: 'satkhira-nolen-gur-sandesh',
    category: 'sweets',
    categoryName: 'সাতক্ষীরার সন্দেশ',
    price: 950,
    originalPrice: 1100,
    unit: '১ কেজি বক্স',
    rating: 4.9,
    reviewCount: 105,
    stock: 12,
    badge: 'ঐতিহ্যবাহী নলেন গুড়',
    badgeType: 'ochre',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'শীতের সুবাসিত খেজুরের খাঁটি নলেন গুড় ও গরুর তাজা ছানা দিয়ে তৈরি মুখে জল আনা নলেন গুড়ের সন্দেশ।',
    description: 'সাতক্ষীরার ঐতিহ্যবাহী খেজুর গুড়ের মন মাতানো ঘ্রাণ আর দেশি ছানার মিশেলে তৈরি এক অপরূপ মিষ্টান্ন। এতে কোনো ধরনের চিনি বা কৃত্রিম সুগন্ধি নেই। মিষ্টিপ্রেমীদের জন্য এটি এক রাজকীয় অভিজ্ঞতা।',
    origin: 'সাতক্ষীরা সদর ও পাটকেলঘাটা',
    harvestDate: 'প্রতিদিন প্রস্তুত তাজা মিষ্টান্ন',
    benefits: [
      '১০০% প্রাকৃতিক খেজুরের খাঁটি নলেন গুড়',
      'চিনিমুক্ত ও সুষম পুষ্টিতে ভরপুর',
      'নরম তুলতুলে টেক্সচার ও অতুলনীয় সুবাস'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '৩৪০ কিলোক্যালরি',
      'প্রোটিন': '১১ গ্রাম',
      'আয়রন': 'খেজুরের গুড় থেকে প্রাকৃতিক আয়রন'
    }
  },
  {
    id: 'prod-009',
    name: 'টক-ঝাল-মিষ্টি বরই ও আমের আচার',
    nameEn: 'Sundarbans Homemade Plum & Mango Pickle',
    slug: 'sundarbans-plum-mango-pickle',
    category: 'pickles',
    categoryName: 'ঘরোয়া আচার ও মশলা',
    price: 320,
    originalPrice: 380,
    unit: '৪০০ গ্রাম জার',
    rating: 4.8,
    reviewCount: 63,
    stock: 30,
    badge: 'ঘরোয়া রেসিপি',
    badgeType: 'ochre',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'রোদে শুকানো দেশি কুল ও কাঁচা আম দিয়ে খাঁটি সরিষার তেলে ভেজানো ঘরোয়া স্বাদের সুস্বাদু আচার।',
    description: 'মা-দাদিদের প্রাচীন ঘরোয়া রেসিপিতে তৈরি। পাঁচফোড়ন ও খাঁটি সরিষার তেলের ঝাঁঝে সমৃদ্ধ এই আচার ভাত, খিচুড়ি কিংবা ডালের সাথে খাওয়ার জন্য আদর্শ। কোনো ভিনেগার বা কৃত্রিম প্রিজারভেটিভ ব্যবহার করা হয়নি।',
    origin: 'কালিগঞ্জ, সাতক্ষীরা',
    harvestDate: 'মার্চ ২০২৬',
    benefits: [
      'খাঁটি ঘানি ভাঙা সরিষার তেলে সংরক্ষিত',
      'মুখরোচক রুচি বাড়াতে সহায়ক',
      'কোনো কৃত্রিম এসিড বা রাসায়নিক রং নেই'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে ক্যালরি': '২১০ কিলোক্যালরি',
      'ভিটামিন সি': 'উচ্চ মাত্রায়'
    }
  },
  {
    id: 'prod-010',
    name: 'খাঁটি অর্গানিক মরিঙ্গা পাউডার (সজিনা পাতা গুঁড়া)',
    nameEn: 'Pure Organic Moringa Leaf Powder Superfood',
    slug: 'pure-organic-moringa-leaf-powder',
    category: 'seeds',
    categoryName: 'সুপারফুড ও বীজ',
    price: 550,
    originalPrice: 650,
    unit: '৫০০ গ্রাম প্যাক',
    rating: 4.9,
    reviewCount: 52,
    stock: 25,
    badge: 'মিরাকল ট্রির পুষ্টি',
    badgeType: 'forest',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'ছায়ায় শুকানো সতেজ কচি সজিনা পাতা থেকে গুঁড়ো করা শতভাগ খাঁটি মরিঙ্গা পাউডার—যাকে বলা হয় পুষ্টির পাওয়ার হাউস।',
    description: 'মরিঙ্গা বা সজিনা পাতাকে আধুনিক পুষ্টিবিদরা সুপারফুড হিসেবে চিহ্নিত করেছেন। এতে কমলার চেয়ে ৭ গুণ বেশি ভিটামিন সি, দুধের চেয়ে ৪ গুণ বেশি ক্যালসিয়াম এবং গাজরের চেয়ে ৪ গুণ বেশি ভিটামিন এ থাকে। প্রতিদিন সকালে এক চামচ উষ্ণ পানিতে গুলে খেলে সারাদিন ক্লান্তিহীন থাকা যায়।',
    origin: 'সাতক্ষীরা ও যশোর জেলা',
    harvestDate: 'ফেব্রুয়ারি ২০২৬',
    benefits: [
      'শরীরের সার্বিক ইমিউনিটি ও স্ট্যামিনা বাড়ায়',
      'উচ্চ রক্তচাপ ও ডায়াবেটিস নিয়ন্ত্রণে কার্যকর ভূমিকা রাখে',
      'অ্যান্টি-এজিং ও ত্বকের উজ্জ্বলতা বৃদ্ধি করে'
    ],
    nutritionalInfo: {
      'প্রতি ১০০ গ্রামে প্রোটিন': '২৭ গ্রাম',
      'ক্যালসিয়াম': '২০০০ মিলিগ্রাম',
      'ভিটামিন সি': '১৭৩ মিলিগ্রাম'
    }
  }
];
