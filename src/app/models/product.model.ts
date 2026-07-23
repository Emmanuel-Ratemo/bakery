export type PriceUnit = 'kg' | 'piece';

export interface Product {
  id: string;
  name: string;
  description: string;
  /** KES per kg (cakes) or per piece (pastries) */
  pricePerUnit: number;
  pricedBy: PriceUnit;
  image: string;
  category: string;
  flavours: string[];
  allergies: string[];
  themes?: string[];
}

export interface CartItem {
  lineId: string;
  product: Product;
  quantity: number;
  flavour: string;
  theme: string;
  weightKg: number;
  /** Locked line price for one unit (one cake / one pastry) */
  unitPrice: number;
  allergyNotes: string;
  customMessage: string;
}

export interface AddToCartOptions {
  flavour: string;
  theme?: string;
  weightKg?: number;
  allergyNotes?: string;
  customMessage?: string;
}
