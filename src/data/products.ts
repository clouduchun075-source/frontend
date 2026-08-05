export interface Product {
  id: string;
  name: string; // Dynamically localized on-the-fly via t('prod_${id}_name')
  price: number;
  priceLabel?: string;
  category: string;
  brand: string;
  color: string;
  size: string[];
  tag: string | null;
  subtitle: string; // Dynamically localized on-the-fly via t('prod_${id}_subtitle')
  image: string;
  description?: string; // Dynamically localized on-the-fly via t('prod_${id}_desc')
  material?: string;
  weight?: string;
  stock: number;
  images?: string[];
  discount?: number;
  rating?: number;
}

export const allProducts: Product[] = [
  {
    id: 'c1',
    name: 'Structural Wool Coat',
    price: 1250,
    priceLabel: '$1,250',
    category: 'Outerwear',
    brand: 'SAYWAY BLACK LABEL',
    color: 'black',
    size: ['S', 'M', 'L'],
    tag: 'NEW ARRIVAL',
    subtitle: 'Carbon Black',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',
    description: 'Crafted from premium architectural-grade wool, this structural coat defines modern luxury outerwear. Featuring a tailored silhouette with clean lines and minimal hardware.',
    material: '100% Virgin Wool',
    weight: '680 GSM Heavyweight',
    stock: 15,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c2',
    name: 'Architectural Knit',
    price: 890,
    priceLabel: '$890',
    category: 'Knitwear',
    brand: 'SAYWAY CORE',
    color: 'white',
    size: ['M', 'L', 'XL'],
    tag: null,
    subtitle: 'Bone White',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600',
    description: 'A structural knit piece engineered for the modern silhouette. Features premium yarn construction with architectural ribbing details.',
    material: '80% Merino Wool, 20% Cashmere',
    weight: '420 GSM',
    stock: 0, // SOLD OUT
    rating: 4.2,
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c3',
    name: 'Pleated Trousers',
    price: 540,
    priceLabel: '$540',
    category: 'Outerwear',
    brand: 'SAYWAY BLACK LABEL',
    color: 'lightgray',
    size: ['XS', 'S', 'M'],
    tag: null,
    subtitle: 'Slate Gray',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
    description: 'Precision-cut pleated trousers with a relaxed architectural fit. Designed for comfort without compromising on structure.',
    material: '97% Organic Cotton, 3% Elastane',
    weight: '320 GSM',
    stock: 25,
    discount: 20, // -20% SALE
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c4',
    name: 'Technical Shell',
    price: 920,
    priceLabel: '$920',
    category: 'Outerwear',
    brand: 'SAYWAY BLACK LABEL',
    color: 'darkgray',
    size: ['S', 'M', 'XL'],
    tag: 'LIMITED EDITION',
    subtitle: 'Midnight',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    description: 'High-performance technical shell jacket. Waterproof, windproof, and breathable with sealed seams throughout.',
    material: '100% Nylon Ripstop',
    weight: '280 GSM',
    stock: 8,
    discount: 15, // -15% SALE
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c5',
    name: 'Essential Heavyweight Tee',
    price: 180,
    priceLabel: '$180',
    category: 'Accessories',
    brand: 'SAYWAY CORE',
    color: 'white',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    tag: null,
    subtitle: 'Optic White',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    description: 'The foundation of any premium wardrobe. Heavyweight 300GSM organic cotton with a structured drape.',
    material: '100% Organic Cotton',
    weight: '300 GSM Heavyweight',
    stock: 100,
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c6',
    name: 'Minimalist Leather Tote',
    price: 2100,
    priceLabel: '$2,100',
    category: 'Accessories',
    brand: 'SAYWAY BLACK LABEL',
    color: 'black',
    size: ['M'],
    tag: null,
    subtitle: 'Matte Black',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    description: 'Handcrafted from Italian full-grain leather. A minimalist tote designed for the modern professional with concealed magnetic closure.',
    material: 'Full-Grain Italian Leather',
    weight: 'N/A',
    stock: 5,
    rating: 5.0,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c7',
    name: 'Monolith Blazer',
    price: 680,
    priceLabel: '$680',
    category: 'Outerwear',
    brand: 'SAYWAY BLACK LABEL',
    color: 'black',
    size: ['S', 'M', 'L'],
    tag: null,
    subtitle: 'Onyx Black',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    description: 'A structured blazer with architectural shoulders. Designed for the modern minimalist with a relaxed tailored fit.',
    material: '95% Wool, 5% Elastane',
    weight: '380 GSM',
    stock: 0, // SOLD OUT
    discount: 10,
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c8',
    name: 'Premium Oversize Hoodie',
    price: 120,
    priceLabel: '$120',
    category: 'Knitwear',
    brand: 'SAYWAY CORE',
    color: 'black',
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tag: 'NEW ARRIVAL',
    subtitle: 'Carbon Black',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
    description: 'Crafted from architectural-grade heavyweight cotton, the Premium Oversize Hoodie redefines the silhouette of luxury streetwear. Featuring dropped shoulders, a double-layered hood, and refined ribbing.',
    material: '100% Organic Cotton',
    weight: '450 GSM Heavyweight',
    stock: 45,
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c9',
    name: 'Geometric Tote',
    price: 315,
    priceLabel: '$315',
    category: 'Accessories',
    brand: 'SAYWAY BLACK LABEL',
    color: 'black',
    size: ['OS'],
    tag: 'LIMITED',
    subtitle: 'Matte Black',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    description: 'Geometric-structured tote with angular design language. Premium vegan leather construction with internal organization.',
    material: 'Vegan Leather',
    weight: 'N/A',
    stock: 3,
    discount: 25, // -25% SALE
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c10',
    name: 'Pleated Technical Pant',
    price: 195,
    priceLabel: '$195',
    category: 'Outerwear',
    brand: 'SAYWAY CORE',
    color: 'lightgray',
    size: ['S', 'M', 'L'],
    tag: null,
    subtitle: 'Stone Grey',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
    description: 'Technical pleated pant with water-resistant finish. Engineered for urban mobility with a relaxed straight leg.',
    material: '95% Nylon, 5% Elastane',
    weight: '240 GSM',
    stock: 12,
    rating: 4.1,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c11',
    name: 'Linear Turtle Neck',
    price: 210,
    priceLabel: '$210',
    category: 'Knitwear',
    brand: 'SAYWAY CORE',
    color: 'white',
    size: ['XS', 'S', 'M'],
    tag: null,
    subtitle: 'Pristine White',
    image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=600',
    description: 'A refined turtleneck in premium knit construction. Clean lines and a structured collar define this essential layering piece.',
    material: '70% Merino Wool, 30% Silk',
    weight: '280 GSM',
    stock: 0, // SOLD OUT
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: 'c12',
    name: 'Cashmere Overcoat',
    price: 520,
    priceLabel: '$520',
    category: 'Outerwear',
    brand: 'SAYWAY BLACK LABEL',
    color: 'black',
    size: ['S', 'M', 'L', 'XL'],
    tag: 'POPULAR',
    subtitle: 'Deep Black',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    description: 'Luxurious cashmere overcoat with a relaxed silhouette. Perfect weight for transitional weather with a premium hand-feel.',
    material: '100% Mongolian Cashmere',
    weight: '550 GSM',
    stock: 18,
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    ],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return allProducts.find((p) => p.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase().trim();
  if (!q) return allProducts;
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  );
};
