/** Original catalog values — not rewritten by the admin API. */
export const PRODUCT_DEFAULTS: Record<
  string,
  { pricePerUnit: number; image: string }
> = {
  birthday: {
    pricePerUnit: 2200,
    image:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
  },
  chocolate: {
    pricePerUnit: 2500,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  strawberry: {
    pricePerUnit: 2400,
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  'red-velvet': {
    pricePerUnit: 2800,
    image:
      'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=800&q=80',
  },
  vanilla: {
    pricePerUnit: 2200,
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
  },
  muffins: {
    pricePerUnit: 250,
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
  },
};
