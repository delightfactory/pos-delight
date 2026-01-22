
import React from 'react';
import type { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void; // للنقر على الكارت (modal)
    onQuickAdd?: (product: Product) => void; // للنقر على زر + (إضافة فورية)
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onQuickAdd }) => {
    // Determine visuals based on stock
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    // Price Logic
    const finalPrice = product.sale_price || product.price;
    const hasDiscount = !!product.sale_price;

    const handleCardClick = () => {
        if (!isOutOfStock) onClick(product);
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation(); // منع تشغيل click على الكارت
        if (!isOutOfStock && onQuickAdd) {
            onQuickAdd(product);
        }
    };

    return (
        <div
            className={`product-card ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={isOutOfStock ? -1 : 0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
        >
            {/* Status Indicators */}
            <div className="card-top-badges">
                {product.code && <span className="badge-code shadow-text">{product.code}</span>}
                {isLowStock && <span className="badge-warning">مخزون قليل</span>}
            </div>

            {/* Image OR Placeholder */}
            <div className="card-image-area">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} loading="lazy" />
                ) : (
                    <div className="placeholder-icon">🌱</div>
                )}

                {/* Overlay Gradient for Text Readability */}
                <div className="card-gradient-overlay"></div>
            </div>

            {/* Content info */}
            <div className="card-content">
                <div className="info-top">
                    <h3 className="prod-name">{product.name}</h3>
                </div>

                <div className="prod-meta">
                    <div className="prod-price-box">
                        {hasDiscount && <span className="old-price">{product.price}</span>}
                        <span className="current-price">{finalPrice} <small>ج.م</small></span>
                    </div>

                    {/* Quick Add Button - Instant add with qty=1 */}
                    <button
                        className="quick-add-btn"
                        onClick={handleQuickAdd}
                        type="button"
                        title="إضافة سريعة"
                        disabled={isOutOfStock}
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Stock Overlay */}
            {isOutOfStock && (
                <div className="stock-overlay-full">
                    <span>نفذت الكمية</span>
                </div>
            )}

            <style>{`
                .product-card {
                    position: relative;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s, border-color 0.2s;
                    cursor: pointer;
                    height: 100%;
                    min-height: 170px;
                }

                .product-card:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }

                .product-card.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                .card-top-badges {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    display: flex;
                    justify-content: space-between;
                    z-index: 5;
                    pointer-events: none;
                }

                .badge-code {
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    color: white;
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-weight: 600;
                }

                .badge-warning {
                    background: linear-gradient(135deg, var(--accent-gold) 0%, #ea580c 100%);
                    color: white;
                    font-size: 0.65rem;
                    padding: 2px 8px;
                    border-radius: 8px;
                    font-weight: 600;
                    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
                }

                .card-image-area {
                    position: relative;
                    background: rgba(0, 0, 0, 0.1);
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .card-image-area img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .placeholder-icon {
                    font-size: 2rem;
                    opacity: 0.3;
                }

                .card-gradient-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
                    pointer-events: none;
                }

                .card-content {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                }

                .info-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .prod-name {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    line-height: 1.3;
                    margin: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .prod-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    margin-top: auto;
                }

                .prod-price-box {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .old-price {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-decoration: line-through;
                }

                .current-price {
                    font-weight: 800;
                    color: var(--accent-green);
                    font-size: 1rem;
                }

                .current-price small {
                    font-size: 0.7rem;
                    opacity: 0.8;
                }

                .quick-add-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, var(--accent-green) 0%, #059669 100%);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
                    flex-shrink: 0;
                    transition: transform 0.15s;
                }

                .quick-add-btn:hover {
                    transform: scale(1.08);
                }

                .quick-add-btn:active {
                    transform: scale(0.95);
                }

                .stock-overlay-full {
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }

                .stock-overlay-full span {
                    font-weight: 700;
                    font-size: 1rem;
                    color: var(--accent-red);
                    background: rgba(239, 68, 68, 0.15);
                    padding: 8px 16px;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};
