
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductForm } from './ProductForm';
import type { Product } from '../types';
import { Upload, Plus, Search, Edit2, Trash2, ArrowRight, X } from 'lucide-react';

import { parseProductsCSV } from '../utils/csvParser';

interface ManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ManagementModal: React.FC<ManagementModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { products, loading, deleteProduct, addProduct, updateProduct } = useProducts();
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [importing, setImporting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const overlayRef = React.useRef<HTMLDivElement>(null);

    // Must have all hooks BEFORE any conditional returns
    if (!isOpen) return null;

    // Filter Logic
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // CSV Handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setStatusMsg('جاري تحليل الملف...');

        try {
            const parsedProducts = await parseProductsCSV(file);
            setStatusMsg(`تم العثور على ${parsedProducts.length} منتج. جاري الحفظ...`);

            let successCount = 0;
            for (const prod of parsedProducts) {
                // Check if exists logic omitted for speed in this demo, just upsert via addProduct if needed or expand logic
                // For now, using direct add (will create new IDs) - in prod use upsert logic
                await addProduct({
                    ...prod,
                    code: prod.code ?? null,
                    sale_price: prod.sale_price ?? null,
                    image_url: prod.image_url ?? null,
                    stock: prod.stock ?? 0,
                    category: prod.category ?? null,
                    description: prod.description ?? null,
                    is_featured: prod.is_featured ?? false
                });
                successCount++;
            }
            if (successCount > 0 && onSuccess) onSuccess();
            setStatusMsg(`تم استيراد ${successCount} منتج بنجاح!`);
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            console.error(error);
            setStatusMsg('حدث خطأ أثناء الاستيراد');
        } finally {
            setImporting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-container">

                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {view === 'list' && 'إدارة المنتجات'}
                        {view === 'add' && 'إضافة منتج جديد'}
                        {view === 'edit' && 'تعديل منتج'}
                    </h2>
                    <button className="btn-icon" onClick={onClose}><X size={24} color="white" /></button>
                </div>

                {/* Content */}
                <div className="modal-body">
                    {/* LIST VIEW */}
                    {view === 'list' && (
                        <>
                            <div className="actions-bar">
                                <div className="search-box">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="بحث باسم المنتج أو الكود..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="action-buttons">
                                    <label className="btn btn-outline">
                                        <Upload size={18} />
                                        <span>CSV</span>
                                        <input type="file" accept=".csv" hidden onChange={handleFileUpload} disabled={importing} />
                                    </label>
                                    <button className="btn btn-primary" onClick={() => setView('add')}>
                                        <Plus size={18} />
                                        <span>جديد</span>
                                    </button>
                                </div>
                            </div>

                            {statusMsg && <div className="status-msg">{statusMsg}</div>}

                            <div className="products-list">
                                {loading ? (
                                    <div className="loading-state">جاري التحميل...</div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="empty-state">لا توجد منتجات مطابقة</div>
                                ) : (
                                    filteredProducts.map(p => (
                                        <div key={p.id} className="product-row">
                                            <div className="row-thumb">
                                                {p.image_url ? <img src={p.image_url} alt="" /> : '📦'}
                                            </div>
                                            <div className="row-info">
                                                <div className="row-name">{p.name}</div>
                                                <div className="row-meta">
                                                    <span className="row-price">{p.sale_price || p.price} ج.م</span>
                                                    <span className={`stock-badge ${p.stock <= 5 ? 'low' : 'ok'}`}>
                                                        {p.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row-actions">
                                                <button className="btn-icon-sm edit" onClick={() => {
                                                    setEditingProduct(p);
                                                    setView('edit');
                                                }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn-icon-sm delete" onClick={() => {
                                                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                                        deleteProduct(p.id).then(() => {
                                                            if (onSuccess) onSuccess();
                                                        });
                                                    }
                                                }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* ADD/EDIT FORM */}
                    {(view === 'add' || view === 'edit') && (
                        <div className="form-wrapper">
                            <button className="back-link" onClick={() => { setView('list'); setEditingProduct(undefined); }}>
                                <ArrowRight size={16} />
                                <span>العودة للقائمة</span>
                            </button>

                            <ProductForm
                                initialData={editingProduct}
                                onSubmit={async (data) => {
                                    if (view === 'add') {
                                        await addProduct(data);
                                    } else if (editingProduct) {
                                        await updateProduct(editingProduct.id, data);
                                    }
                                    if (onSuccess) onSuccess();
                                    setView('list');
                                    setEditingProduct(undefined);
                                }}
                                onCancel={() => { setView('list'); setEditingProduct(undefined); }}
                                isSubmitting={loading}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.95); /* Deep slate fade */
                    backdrop-filter: blur(5px);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                }

                .modal-container {
                    width: 100%;
                    max-width: 600px;
                    height: 90vh;
                    background: var(--bg-app);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    overflow: hidden;
                }

                .modal-header {
                    padding: 16px;
                    background: var(--bg-panel);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-title { font-size: 1.2rem; font-weight: 700; color: white; }

                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                /* Actions Bar */
                .actions-bar {
                    padding: 16px;
                    background: var(--bg-panel);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: var(--bg-app);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0 12px;
                }
                .search-icon { color: var(--text-muted); }
                .search-box input {
                    width: 100%;
                    padding: 12px 8px;
                    background: transparent;
                    border: none;
                    color: white;
                    outline: none;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                .btn-outline {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    background: transparent;
                    height: 40px;
                    font-size: 0.9rem;
                }
                .btn-primary { height: 40px; width: auto; flex: 1; font-size: 0.9rem; }

                /* List */
                .products-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }

                .product-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    background: var(--bg-panel);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border: 1px solid rgba(255,255,255,0.03);
                }
                
                .row-thumb {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    background: var(--bg-app);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-size: 1.2rem;
                }
                .row-thumb img { width: 100%; height: 100%; object-fit: cover; }

                .row-info { flex: 1; }
                .row-name { font-weight: 500; font-size: 0.95rem; color: white; margin-bottom: 2px; }
                .row-meta { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
                .row-price { color: var(--accent-green); font-weight: 700; }
                
                .stock-badge { 
                    padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;
                }
                .stock-badge.ok { background: rgba(59, 130, 246, 0.2); color: var(--primary-color); }
                .stock-badge.low { background: var(--accent-gold); color: black; }

                .row-actions { display: flex; gap: 8px; }
                .btn-icon-sm {
                    width: 32px; height: 32px;
                    border-radius: 6px;
                    border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                }
                .edit { background: rgba(255,255,255,0.1); color: white; }
                .delete { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); }

                .loading-state, .empty-state {
                    padding: 40px; text-align: center; color: var(--text-muted);
                }
                .status-msg {
                    background: rgba(16, 185, 129, 0.2); color: var(--accent-green);
                    padding: 8px; font-size: 0.9rem; text-align: center; margin-bottom: 10px; border-radius: 6px;
                }

                /* Form */
                .form-wrapper { padding: 16px; overflow-y: auto; height: 100%; }
                .back-link {
                    display: flex; align-items: center; gap: 6px;
                    background: none; border: none; color: var(--text-secondary);
                    margin-bottom: 16px; cursor: pointer;
                }
            `}</style>
        </div>
    );
};
