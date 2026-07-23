import { Product } from '../models/product.model';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Rose Velvet Cupcake',
    description: 'Soft velvet crumb with rose buttercream and edible petals.',
    price: 450,
    category: 'Cake',
    image:
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Strawberry Cloud Cake',
    description: 'Light sponge layered with fresh berries and whipped cream.',
    price: 3200,
    category: 'Cake',
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Berry Bliss Muffin',
    description: 'Buttery muffin studded with seasonal berries.',
    price: 320,
    category: 'Muffins',
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Butter Croissant',
    description: 'Flaky, golden layers baked fresh every morning.',
    price: 280,
    category: 'Croissant',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Sourdough Loaf',
    description: 'Crackly crust, open crumb, baked daily.',
    price: 450,
    category: 'Bread',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Berry Tartlette',
    description: 'Crisp shell, vanilla custard, and seasonal berries.',
    price: 520,
    category: 'Tart',
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '7',
    name: 'Pink Macaron Box',
    description: 'Assorted macarons in blush, raspberry, and vanilla bean.',
    price: 1800,
    category: 'Favorite',
    image:
      'https://images.unsplash.com/photo-1569864358642-9d448389b7f2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '8',
    name: 'Lemon Blush Donut',
    description: 'Brioche donut with lemon glaze and pink sugar.',
    price: 320,
    category: 'Favorite',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '9',
    name: 'Chocolate Fudge Brownie',
    description: 'Dense cocoa brownie with a glossy ganache top.',
    price: 380,
    category: 'Favorite',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
];

export const CATEGORIES = [
  'Cake',
  'Muffins',
  'Croissant',
  'Bread',
  'Tart',
  'Favorite',
] as const;

export const GALLERY: { id: string; category: string; image: string; alt: string }[] = [
  {
    id: 'g1',
    category: 'Cake',
    alt: 'Layered celebration cake',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g2',
    category: 'Muffins',
    alt: 'Fresh muffins',
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g3',
    category: 'Croissant',
    alt: 'Golden croissants',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g4',
    category: 'Bread',
    alt: 'Artisan bread',
    image:
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g5',
    category: 'Tart',
    alt: 'Fruit tart',
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g6',
    category: 'Favorite',
    alt: 'Assorted sweets',
    image:
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g7',
    category: 'Cake',
    alt: 'Pink frosting cake',
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g8',
    category: 'Favorite',
    alt: 'Macarons',
    image:
      'https://images.unsplash.com/photo-1569864358642-9d448389b7f2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g9',
    category: 'Bread',
    alt: 'Fresh loaves',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  },
];

/**
 * Bakery WhatsApp number — used by the floating chat + cart "Order via WhatsApp".
 * Format: country code + number, no +, spaces, or dashes.
 * Example Kenya: 254712345678  |  Example US: 15551234567
 */
export const WHATSAPP_NUMBER = '254768578254';
