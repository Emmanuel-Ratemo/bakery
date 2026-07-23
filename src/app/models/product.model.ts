export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
  allergyNotes: string;
  customMessage: string;
}

export interface AddToCartOptions {
  flavour: string;
  theme?: string;
  allergyNotes?: string;
  customMessage?: string;
}
