
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import type { NewProduct } from '../hooks/useProducts';
import { X, Save } from 'lucide-react';

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: NewProduct) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<NewProduct>({
        name: '',
        code: '',
        price: 0,
        sale_price: null,
        stock: 0,
        category: '',
        description: '',
        image_url: '',
        is_featured: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                code: initialData.code || '',
                price: initialData.price,
                sale_price: initialData.sale_price,
                stock: initialData.stock,
                category: initialData.category || '',
                description: initialData.description || '',
                image_url: initialData.image_url || '',
                is_featured: initialData.is_featured
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let checked: boolean | undefined;
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? (value === '' ? 0 : parseFloat(value)) :
                    value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
                <label>اسم المنتج *</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="مثال: قميص رجالي"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>الكود / SKU</label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code || ''}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>الكمية *</label>
                    <input
                        type="number"
                        name="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>السعر الأساسي *</label>
                    <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>سعر الخصم (اختياري)</label>
                    <input
                        type="number"
                        name="sale_price"
                        min="0"
                        step="0.01"
                        value={formData.sale_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>التصنيف</label>
                <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="مثال: ملابس"
                />
            </div>

            <div className="form-group">
                <label>رابط الصورة</label>
                <input
                    type="url"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="form-group">
                <label>الوصف</label>
                <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="form-input"
                    rows={3}
                />
            </div>

            <div className="form-actions btn-group">
                <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
                    إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري الحفظ...' : (initialData ? 'تحديث المنتج' : 'إضافة منتج')}
                    <Save size={18} />
                </button>
            </div>

            <style>{`
                .product-form { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }
                .form-row { display: flex; gap: 12px; }
                .form-group { flex: 1; display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 0.9rem; font-weight: 600; color: #4b5563; }
                .form-input { padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
                .form-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); }
                .btn-group { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
            `}</style>
        </form>
    );
};
