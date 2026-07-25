export type PriceUnit = 'kg' | 'piece';

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Display / fallback starting price (KES) — usually the ½ kg chart price */
  pricePerUnit: number;
  pricedBy: PriceUnit;
  image: string;
  category: string;
  flavours: string[];
  allergies: string[];
  themes?: string[];
  /** Official chart prices by weight (kg → KES) */
  pricesByWeight?: Record<number, number>;
}

export interface CartItem {
  lineId: string;
  product: Product;
  quantity: number;
  flavour: string;
  theme: string;
  weightKg: number;
  /** Locked line price for one unit (one cake) */
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
