// Database types based on your Supabase schema

export interface Author {
  author_id: number
  name: string
}

export interface Category {
  category_id: number
  name: string
  description?: string
}

export interface Book {
  book_id: number
  bk_title: string
  author_id?: number
  category_id?: number
  isbn?: string
  stock_quantity: number
  price: number
  created_at: string
}

// Extended types with relations
export interface BookWithRelations extends Book {
  authors?: Author
  categories?: Category
}

// Input types for creating/updating records
export interface CreateAuthor {
  name: string
}

export interface UpdateAuthor {
  name?: string
}

export interface CreateCategory {
  name: string
  description?: string
}

export interface UpdateCategory {
  name?: string
  description?: string
}

export interface CreateBook {
  bk_title: string
  author_id?: number
  category_id?: number
  isbn?: string
  stock_quantity?: number
  price: number
}

export interface UpdateBook {
  bk_title?: string
  author_id?: number
  category_id?: number
  isbn?: string
  stock_quantity?: number
  price?: number
}

export interface Supplier {
  supplier_id: number
  name: string
  contact: string
  email: string
  address: string
}

export type CreateSupplier = Omit<Supplier, 'supplier_id'>
export type UpdateSupplier = Partial<CreateSupplier>

// Purchases
export interface Purchase {
  purchase_id: number
  supplier_id: number | null
  purchase_date: string
  status: string
  created_at?: string
}

export interface PurchaseDetails {
  purchase_details_id: number
  purchase_id: number
  book_id: number
  quantity: number
  unit_cost: number
  received_quantity?: number
  created_at?: string
}

export type CreatePurchase = Omit<Purchase, 'purchase_id' | 'created_at'>
export type CreatePurchaseDetail = Omit<PurchaseDetails, 'purchase_details_id' | 'created_at'>

// types/database.ts

export interface Customer {
  user_id: number
  name: string
  contact?: string
  email?: string
  membership_type?: string
  created_at?: string
}

export interface Order {
  order_id: number
  customer_id: number
  order_date: string
  total_amount: number
}

export interface CreateOrder {
  customer_id: number
  total_amount: number
}

export interface UpdateOrder {
  customer_id?: number
  total_amount?: number
}

export interface OrderDetails {
  order_details_id: number
  order_id: number
  book_id: number
  quantity: number
  price: number
  payment_method?: string
}

export interface CreateOrderDetails {
  order_id: number
  book_id: number
  quantity: number
  price: number
  payment_method?: string
}

export interface UpdateOrderDetails {
  quantity?: number
  price?: number
  payment_method?: string
}
