
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { Modal } from './ui/Modal';

interface QuickAddModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (product: Product, quantity: number) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ product, isOpen, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) setQuantity(1);
    }, [isOpen]);

    if (!product) return null;

    const price = product.sale_price || product.price;

    const handleConfirm = () => {
        onConfirm(product, quantity);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="modal-header">
                <div className="modal-product-name">{product.name}</div>
                <div className="modal-product-price">{price.toLocaleString()} ج.م</div>
            </div>

            <div className="modal-qty-section">
                <span className="modal-qty-label">حدد الكمية</span>
                <div className="modal-qty-controls">
                    <button className="modal-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <input
                        type="number"
                        className="modal-qty-input"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <button className="modal-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
            </div>

            <div className="modal-total">
                <div className="modal-total-label">الإجمالي</div>
                <div className="modal-total-value">{(price * quantity).toLocaleString()} ج.م</div>
            </div>

            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
                <button className="btn btn-primary" onClick={handleConfirm}>إضافة للسلة</button>
            </div>
        </Modal>
    );
};
