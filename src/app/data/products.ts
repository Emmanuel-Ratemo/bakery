import { Product } from '../models/product.model';

const CAKE_FLAVOURS = [
  'Vanilla',
  'Chocolate',
  'Red Velvet',
  'Strawberry',
  'Marble',
  'Lemon',
];

const MUFFIN_FLAVOURS = [
  'Blueberry',
  'Chocolate Chip',
  'Banana',
  'Vanilla',
  'Red Velvet',
];

const CAKE_ALLERGIES = ['Eggs', 'Milk / Dairy', 'Wheat / Gluten', 'Soy'];
const NUT_ALLERGIES = [...CAKE_ALLERGIES, 'Tree nuts'];

/** Cake sizes available at checkout */
export const CAKE_WEIGHTS_KG = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

/** Extra KES for cartoon / custom themes on birthday cakes (not Classic) */
export const THEME_SURCHARGE_KES = 1500;

export const PLAIN_BIRTHDAY_THEME = 'Classic Birthday';

export function isThemedBirthday(theme: string): boolean {
  const t = theme.trim();
  return !!t && t !== PLAIN_BIRTHDAY_THEME;
}

export function calcUnitPrice(
  product: Product,
  weightKg: number,
  theme = ''
): number {
  if (product.pricedBy === 'piece') {
    return product.pricePerUnit;
  }

  const kg = Math.max(0.5, weightKg);
  const base = Math.round(product.pricePerUnit * kg);
  const themeExtra =
    product.themes?.length && isThemedBirthday(theme) ? THEME_SURCHARGE_KES : 0;
  return base + themeExtra;
}

export function formatWeight(kg: number): string {
  return kg === 0.5 ? '½ kg' : `${kg} kg`;
}

/**
 * Kenya mid-market rates (Nairobi, ~2026): plain cakes ~2,200–2,800/kg;
 * muffins ~KSh 200–300 each. Theme add-on applied separately.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'birthday',
    name: 'Birthday Cake',
    description: 'Priced per kg and theme.',
    pricePerUnit: 2200,
    pricedBy: 'kg',
    category: 'Birthday',
    flavours: CAKE_FLAVOURS,
    allergies: CAKE_ALLERGIES,
    themes: [
      PLAIN_BIRTHDAY_THEME,
      'Elsa (Frozen)',
      'Sofia the First',
      'SpongeBob',
      'Cars (Disney)',
      'Custom theme',
    ],
    image:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate',
    name: 'Chocolate Cake',
    description: 'Priced per kg.',
    pricePerUnit: 2500,
    pricedBy: 'kg',
    category: 'Chocolate',
    flavours: ['Dark Chocolate', 'Milk Chocolate', 'Chocolate Fudge', 'Chocolate Orange'],
    allergies: NUT_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strawberry',
    name: 'Strawberry Cake',
    description: 'Priced per kg.',
    pricePerUnit: 2400,
    pricedBy: 'kg',
    category: 'Strawberry',
    flavours: ['Strawberry Cream', 'Vanilla Strawberry', 'Strawberry Shortcake'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet Cake',
    description: 'Priced per kg.',
    pricePerUnit: 2800,
    pricedBy: 'kg',
    category: 'Cakes',
    flavours: ['Classic Red Velvet', 'Red Velvet with White Chocolate'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vanilla',
    name: 'Vanilla Cake',
    description: 'Priced per kg.',
    pricePerUnit: 2200,
    pricedBy: 'kg',
    category: 'Cakes',
    flavours: ['Madagascar Vanilla', 'Vanilla Bean', 'Vanilla with Berry Filling'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'muffins',
    name: 'Fresh Muffins',
    description: 'Priced per piece.',
    pricePerUnit: 250,
    pricedBy: 'piece',
    category: 'Muffins',
    flavours: MUFFIN_FLAVOURS,
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
  },
];

export const CATEGORIES = [
  'Birthday',
  'Chocolate',
  'Strawberry',
  'Cakes',
  'Muffins',
] as const;

export const GALLERY: { id: string; category: string; image: string; alt: string }[] = [
  {
    id: 'g1',
    category: 'Birthday',
    alt: 'Birthday celebration cake',
    image:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g2',
    category: 'Birthday',
    alt: 'Party cake with candles',
    image:
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g3',
    category: 'Birthday',
    alt: 'Colourful birthday cake',
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g4',
    category: 'Chocolate',
    alt: 'Chocolate layer cake',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g5',
    category: 'Chocolate',
    alt: 'Chocolate dessert',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g6',
    category: 'Chocolate',
    alt: 'Chocolate frosted cake',
    image:
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g7',
    category: 'Strawberry',
    alt: 'Strawberry cake',
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g8',
    category: 'Strawberry',
    alt: 'Berry topped cake',
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g9',
    category: 'Strawberry',
    alt: 'Fresh strawberry dessert',
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g10',
    category: 'Cakes',
    alt: 'Layered celebration cake',
    image:
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g11',
    category: 'Cakes',
    alt: 'Red velvet cake',
    image:
      'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g12',
    category: 'Cakes',
    alt: 'Vanilla frosted cake',
    image:
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g13',
    category: 'Muffins',
    alt: 'Fresh muffins',
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g14',
    category: 'Muffins',
    alt: 'Assorted muffins',
    image:
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'g15',
    category: 'Muffins',
    alt: 'Bakery muffins',
    image:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',
  },
];

export const WHATSAPP_NUMBER = '254768578254';
