import { Product } from '../models/product.model';

const CAKE_ALLERGIES = ['Eggs', 'Milk / Dairy', 'Wheat / Gluten', 'Soy'];
const NUT_ALLERGIES = [...CAKE_ALLERGIES, 'Tree nuts'];

/** Cake sizes on the Bee's Blossom Bakes price list */
export const CAKE_WEIGHTS_KG = [0.5, 1, 1.5, 2, 3] as const;

/** Extra KES for birthdays / special-occasion character themes */
export const THEME_SURCHARGE_KES = 1500;

export const NORMAL_THEME = 'Normal';

export const THEME_CATEGORIES = [
  NORMAL_THEME,
  'Birthdays / Special occasions',
] as const;

/** Shown only when Birthdays / Special occasions is selected */
export const OCCASION_THEMES = [
  'Elsa (Frozen)',
  'Sofia the First',
  'SpongeBob',
  'Cars (Disney)',
  'Custom theme',
] as const;

/** @deprecated use NORMAL_THEME — kept for cart message compatibility */
export const PLAIN_BIRTHDAY_THEME = NORMAL_THEME;

export const CELEBRATION_THEMES = [...OCCASION_THEMES] as const;

type WeightKg = (typeof CAKE_WEIGHTS_KG)[number];

/** Price row for weights ½ · 1 · 1½ · 2 · 3 kg */
function prices(
  half: number,
  one: number,
  oneHalf: number,
  two: number,
  three: number
): Record<WeightKg, number> {
  return { 0.5: half, 1: one, 1.5: oneHalf, 2: two, 3: three };
}

type CakeDef = {
  id: string;
  name: string;
  category: 'Whipped Cream' | 'Specialty';
  allergies: string[];
  image: string;
  chart: Record<WeightKg, number>;
};

function cake(def: CakeDef): Product {
  return {
    id: def.id,
    name: def.name,
    description: `${def.category} · chart prices by size. Design & toppers may vary.`,
    pricePerUnit: def.chart[0.5],
    pricedBy: 'kg',
    category: def.category,
    flavours: [def.name],
    allergies: def.allergies,
    themes: [...CELEBRATION_THEMES],
    pricesByWeight: def.chart,
    image: def.image,
  };
}

/**
 * Every cake from the price-list left column (no muffins).
 * NB: prices vary depending on design and toppers.
 */
const CAKE_DEFS: CakeDef[] = [
  // Whipped cream frosting
  {
    id: 'vanilla',
    name: 'Vanilla cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1300, 2000, 2500, 3800, 4800),
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'lemon',
    name: 'Lemon cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1300, 2000, 2500, 3800, 4800),
    image:
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strawberry',
    name: 'Strawberry cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1300, 2000, 2500, 3800, 4800),
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'orange',
    name: 'Orange cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1300, 2000, 2500, 3800, 4800),
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'passion',
    name: 'Passion cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1300, 2000, 2500, 3800, 4800),
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'blueberry',
    name: 'Blueberry cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1500, 2500, 3000, 4200, 5200),
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'marble',
    name: 'Marble cake',
    category: 'Whipped Cream',
    allergies: CAKE_ALLERGIES,
    chart: prices(1500, 2500, 3000, 4000, 5000),
    image:
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
  },
  // Specialty (others)
  {
    id: 'red-velvet',
    name: 'Red velvet',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3000, 4000, 5000, 5800),
    image:
      'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coffee',
    name: 'Coffee cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(1800, 3000, 3500, 4500, 5500),
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'caramel',
    name: 'Caramel cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2500, 3600, 4800, 5800, 6800),
    image:
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pina-colada',
    name: 'Piña colada cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(1800, 3500, 4500, 5500, 6500),
    image:
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rainbow',
    name: 'Rainbow cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3200, 3800, 4800, 5800),
    image:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coconut',
    name: 'Coconut cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3200, 3800, 4800, 5800),
    image:
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'funfetti',
    name: 'Funfetti cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3000, 3500, 4500, 5500),
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'oreo',
    name: 'Oreo cake',
    category: 'Specialty',
    allergies: NUT_ALLERGIES,
    chart: prices(2000, 3500, 4500, 5500, 6500),
    image:
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate',
    name: 'Chocolate cake',
    category: 'Specialty',
    allergies: NUT_ALLERGIES,
    chart: prices(2000, 3200, 4800, 5000, 6000),
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate-mint',
    name: 'Chocolate mint',
    category: 'Specialty',
    allergies: NUT_ALLERGIES,
    chart: prices(2000, 2800, 3800, 4600, 5600),
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate-fudge',
    name: 'Chocolate fudge',
    category: 'Specialty',
    allergies: NUT_ALLERGIES,
    chart: prices(2000, 3500, 4500, 5500, 6500),
    image:
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'black-forest',
    name: 'Black forest cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3600, 4600, 5600, 6600),
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'white-forest',
    name: 'White forest cake',
    category: 'Specialty',
    allergies: CAKE_ALLERGIES,
    chart: prices(2000, 3600, 4600, 5600, 6600),
    image:
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rich-fruit',
    name: 'Rich fruit cake',
    category: 'Specialty',
    allergies: NUT_ALLERGIES,
    chart: prices(2800, 4200, 5000, 6200, 7200),
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  },
];

export const PRODUCTS: Product[] = CAKE_DEFS.map(cake);

export function isThemedBirthday(theme: string): boolean {
  const t = theme.trim();
  if (!t || t === NORMAL_THEME) return false;
  return true;
}

export function calcUnitPrice(
  product: Product,
  weightKg: number,
  theme = '',
  _flavour = '',
  themeSurchargeKes = THEME_SURCHARGE_KES
): number {
  if (product.pricedBy === 'piece') {
    return product.pricePerUnit;
  }

  const weight = (
    CAKE_WEIGHTS_KG.includes(weightKg as WeightKg) ? weightKg : 1
  ) as WeightKg;

  const base = product.pricesByWeight?.[weight] ?? product.pricePerUnit;
  const themeExtra =
    product.themes?.length && isThemedBirthday(theme)
      ? Math.max(0, Math.round(themeSurchargeKes))
      : 0;
  return base + themeExtra;
}

export function formatWeight(kg: number): string {
  return kg === 0.5 ? '½ kg' : `${kg} kg`;
}

export function startingFromPrice(product: Product): number {
  if (product.pricesByWeight) {
    return Math.min(...Object.values(product.pricesByWeight));
  }
  return product.pricePerUnit;
}

export const CATEGORIES = ['Whipped Cream', 'Specialty'] as const;

export const GALLERY: { id: string; category: string; image: string; alt: string }[] =
  PRODUCTS.slice(0, 9).map((p, i) => ({
    id: `g${i + 1}`,
    category: p.category,
    alt: p.name,
    image: p.image.replace('w=800', 'w=900'),
  }));

export const WHATSAPP_NUMBER = '254768578254';

/** Social profiles from Bee's Blossom Bakes branding */
export const SOCIAL_LINKS = {
  instagram: {
    label: "Bee's Blossom Bakes",
    url: 'https://www.instagram.com/beesblossombakes/',
  },
  tiktok: {
    label: "Bee's Blossom Bakes",
    url: 'https://www.tiktok.com/@beesblossombakes',
  },
  whatsapp: {
    label: '0768578254',
    url: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
} as const;

export const BRAND_NAME = "Bee's Blossom Bakes";
export const BRAND_TAGLINE = 'Blooming delights in every bite';
