
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Product } from '../types';

// Omit ID and created_at for Inserts
export type NewProduct = Omit<Product, 'id' | 'created_at'>;

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (product: NewProduct) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert(product)
                .select()
                .single();

            if (error) throw error;

            setProducts(prev => [data, ...prev]);
            return { success: true, data };
        } catch (err: any) {
            console.error('Error adding product:', err);
            return { success: false, error: err.message };
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setProducts(prev => prev.map(p => p.id === id ? data : p));
            return { success: true, data };
        } catch (err: any) {
            console.error('Error updating product:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting product:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        products,
        loading,
        error,
        refreshProducts: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
    };
};
