
import { useState, useMemo } from 'react';
import type { Product, CartItem } from '../types';

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

    const addToCart = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === productId ? { ...item, cartQuantity: quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountValue(0);
        setDiscountType('fixed');
    };

    const setGiftQuantity = (productId: string, quantity: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === productId) {
                const giftQty = Math.max(0, Math.min(quantity, item.cartQuantity));
                return { ...item, gift_quantity: giftQty };
            }
            return item;
        }));
    };

    const setGiftReason = (productId: string, reason: string) => {
        setItems(prev => prev.map(item =>
            item.id === productId ? { ...item, gift_reason: reason } : item
        ));
    };

    const stats = useMemo(() => {
        const totalItems = items.length;
        const totalUnits = items.reduce((sum, item) => sum + item.cartQuantity, 0);

        // Calculate subtotal (excluding gift quantities)
        const subtotal = items.reduce((sum, item) => {
            const price = item.sale_price || item.price;
            const paidQuantity = item.cartQuantity - (item.gift_quantity || 0);
            return sum + (price * paidQuantity);
        }, 0);

        // Calculate total value of gifts (for reporting)
        const giftsValue = items.reduce((sum, item) => {
            const giftQty = item.gift_quantity || 0;
            if (giftQty === 0) return sum;
            const price = item.sale_price || item.price;
            return sum + (price * giftQty);
        }, 0);

        let discountAmount = 0;
        if (discountType === 'fixed') {
            discountAmount = discountValue;
        } else {
            discountAmount = subtotal * (discountValue / 100);
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        const totalAmount = Math.max(0, subtotal - discountAmount);

        return {
            totalItems,
            totalUnits,
            subtotal,
            giftsValue,
            discountAmount,
            totalAmount
        };
    }, [items, discountValue, discountType]);

    return {
        items,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        discountValue,
        setDiscountValue,
        discountType,
        setDiscountType,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setGiftQuantity,
        setGiftReason,
        ...stats
    };
};
