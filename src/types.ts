
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    price: number
                    sale_price: number | null
                    image_url: string | null
                    stock: number
                    category: string | null
                    description: string | null
                    is_featured: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    price: number
                    sale_price?: number | null
                    image_url?: string | null
                    stock?: number
                    category?: string | null
                    description?: string | null
                    is_featured?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string | null
                    price?: number
                    sale_price?: number | null
                    image_url?: string | null
                    stock?: number
                    category?: string | null
                    description?: string | null
                    is_featured?: boolean
                    created_at?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    customer_name: string | null
                    customer_phone: string | null
                    total_amount: number
                    discount_amount: number
                    discount_type: 'fixed' | 'percent' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount?: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    product_id: string | null
                    product_name: string
                    quantity: number
                    price: number
                    total: number
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    product_id?: string | null
                    product_name: string
                    quantity: number
                    price: number
                    total: number
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    product_id?: string | null
                    product_name?: string
                    quantity?: number
                    price?: number
                    total?: number
                }
            }
        }
    }
    pos: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    price: number
                    sale_price: number | null
                    image_url: string | null
                    stock: number
                    category: string | null
                    description: string | null
                    is_featured: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    price: number
                    sale_price?: number | null
                    image_url?: string | null
                    stock?: number
                    category?: string | null
                    description?: string | null
                    is_featured?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string | null
                    price?: number
                    sale_price?: number | null
                    image_url?: string | null
                    stock?: number
                    category?: string | null
                    description?: string | null
                    is_featured?: boolean
                    created_at?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    customer_name: string | null
                    customer_phone: string | null
                    total_amount: number
                    discount_amount: number
                    discount_type: 'fixed' | 'percent' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount?: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    product_id: string | null
                    product_name: string
                    quantity: number
                    price: number
                    total: number
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    product_id?: string | null
                    product_name: string
                    quantity: number
                    price: number
                    total: number
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    product_id?: string | null
                    product_name?: string
                    quantity?: number
                    price?: number
                    total?: number
                }
            }
        }
    }
}

export type Product = Database['pos']['Tables']['products']['Row']
export type Invoice = Database['pos']['Tables']['invoices']['Row']
export type InvoiceItem = Database['pos']['Tables']['invoice_items']['Row']

export interface CartItem extends Product {
    cartQuantity: number
    gift_quantity?: number  // عدد الهدايا من الكمية الكلية
    gift_reason?: string
}
