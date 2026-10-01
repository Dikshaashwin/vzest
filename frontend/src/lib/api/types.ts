export type Me = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  createdAt: string;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  weightGrams: number | null;
  price: string;
  comparePrice: string | null;
  gstPercent: string;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  cocoaPercent: number | null;
  isActive: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type ProductDetail = ProductCard & {
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  shelfLife: string | null;
  storageInfo: string | null;
  isVegetarian: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  category: Category | null;
  // The backend doesn't expose product reviews yet (no reviews endpoint) —
  // always empty until that's built.
  reviews: { id: string; user: { name: string | null }; createdAt: string; comment: string }[];
};

export type ProductListResult = {
  products: ProductCard[];
  total: number;
  totalPages: number;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

export type CollectionAdmin = Collection & {
  productCount: number;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export type WishlistItem = {
  id: string;
  product: ProductCard;
};

export type OrderItem = {
  id: string;
  name: string;
  variantLabel: string;
  price: string;
  quantity: number;
};

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type Payment = {
  provider: string;
  status: PaymentStatus;
  razorpayPaymentId: string | null;
};

export type Shipment = {
  provider: string;
  awbCode: string | null;
  courierName: string | null;
  status: string;
};

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discount: string;
  shippingFee: string;
  gstAmount: string;
  total: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
  shipment: Shipment | null;
};
