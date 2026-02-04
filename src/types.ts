
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
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
                Relationships: []
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
                    total_gifts_value?: number
                    total_discounts_value?: number
                }
                Insert: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                    total_gifts_value?: number
                    total_discounts_value?: number
                }
                Update: {
                    id?: string
                    customer_name?: string | null
                    customer_phone?: string | null
                    total_amount?: number
                    discount_amount?: number
                    discount_type?: 'fixed' | 'percent' | null
                    created_at?: string
                    total_gifts_value?: number
                    total_discounts_value?: number
                }
                Relationships: []
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
                    is_gift: boolean
                    gift_reason: string | null
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    product_id?: string | null
                    product_name: string
                    quantity: number
                    price: number
                    total: number
                    is_gift?: boolean
                    gift_reason?: string | null
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    product_id?: string | null
                    product_name?: string
                    quantity?: number
                    price?: number
                    total?: number
                    is_gift?: boolean
                    gift_reason?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
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
