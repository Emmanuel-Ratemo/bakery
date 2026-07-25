/** Original catalog values — not rewritten by the admin API. */
import { PRODUCTS } from './products';

export const PRODUCT_DEFAULTS: Record<
  string,
  { pricePerUnit: number; image: string }
> = Object.fromEntries(
  PRODUCTS.map((p) => [
    p.id,
    { pricePerUnit: p.pricePerUnit, image: p.image },
  ])
);
