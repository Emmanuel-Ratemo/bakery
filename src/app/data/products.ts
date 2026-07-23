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

export const PRODUCTS: Product[] = [
  {
    id: 'birthday',
    name: 'Birthday Cake',
    description:
      'Celebration cake with your choice of cartoon theme or a fully custom design.',
    price: 3500,
    category: 'Birthday',
    flavours: CAKE_FLAVOURS,
    allergies: CAKE_ALLERGIES,
    themes: [
      'Classic Birthday',
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
    description:
      'Rich chocolate sponge with chocolate buttercream — a classic favourite.',
    price: 3200,
    category: 'Chocolate',
    flavours: ['Dark Chocolate', 'Milk Chocolate', 'Chocolate Fudge', 'Chocolate Orange'],
    allergies: NUT_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strawberry',
    name: 'Strawberry Cake',
    description:
      'Light sponge layered with fresh strawberries and whipped cream.',
    price: 3200,
    category: 'Strawberry',
    flavours: ['Strawberry Cream', 'Vanilla Strawberry', 'Strawberry Shortcake'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet Cake',
    description: 'Soft red velvet layers with classic cream cheese frosting.',
    price: 3400,
    category: 'Cakes',
    flavours: ['Classic Red Velvet', 'Red Velvet with White Chocolate'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vanilla',
    name: 'Vanilla Cake',
    description: 'Fluffy vanilla sponge with buttercream — simple and elegant.',
    price: 2800,
    category: 'Cakes',
    flavours: ['Madagascar Vanilla', 'Vanilla Bean', 'Vanilla with Berry Filling'],
    allergies: CAKE_ALLERGIES,
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'muffins',
    name: 'Fresh Muffins',
    description:
      'Soft bakery muffins — order by the piece or as a party box. Choose your flavour.',
    price: 250,
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
