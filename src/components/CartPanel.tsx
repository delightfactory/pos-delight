
import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';
import { CustomerAutocomplete } from './CustomerAutocomplete';
import { Printer, ChevronDown, Trash2, User, Percent } from 'lucide-react';

interface CartPanelProps {
    cart: ReturnType<typeof useCart>;
    onCheckout: () => Promise<void>;
    className?: string;
}

export const CartPanel: React.FC<CartPanelProps> = ({ cart, onCheckout, className }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showCustomer, setShowCustomer] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);

    const handleCheckout = async () => {
        if (cart.items.length === 0) return;
        setIsProcessing(true);
        await onCheckout();
        setIsProcessing(false);
    };

    const hasCustomerData = cart.customerName || cart.customerPhone;
    const hasDiscount = cart.discountAmount > 0;

    return (
        <section className={`cart-panel ${className || ''}`}>
            {/* Header */}
            <div className="cart-header">
                <div className="header-title">
                    <span className="header-icon">🧾</span>
                    <h2>الفاتورة الحالية</h2>
                    <span className="items-badge">{cart.totalItems}</span>
                </div>

                {cart.items.length > 0 && (
                    <button className="btn-clear-cart" onClick={cart.clearCart} title="تفريغ السلة">
                        <Trash2 size={16} />
                        <span>تفريغ</span>
                    </button>
                )}
            </div>

            {/* Items List */}
            <div className="cart-items-list">
                {cart.items.length === 0 ? (
                    <div className="empty-cart-state">
                        <div className="empty-icon">🛒</div>
                        <h3>السلة فارغة</h3>
                        <p>اضغط على أي منتج لإضافته</p>
                    </div>
                ) : (
                    <div className="items-container">
                        {cart.items.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={cart.updateQuantity}
                                onRemove={cart.removeFromCart}
                                onSetGiftQuantity={cart.setGiftQuantity}
                                onSetGiftReason={cart.setGiftReason}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Sticky */}
            <div className="cart-footer">
                {/* Quick Action Buttons */}
                <div className="quick-actions">
                    <button
                        className={`action-pill ${showCustomer ? 'active' : ''} ${hasCustomerData ? 'has-data' : ''}`}
                        onClick={() => setShowCustomer(!showCustomer)}
                    >
                        <User size={14} />
                        <span>{hasCustomerData ? cart.customerName || 'عميل' : 'بيانات العميل'}</span>
                        <ChevronDown size={12} className={showCustomer ? 'rotated' : ''} />
                    </button>

                    <button
                        className={`action-pill ${showDiscount ? 'active' : ''} ${hasDiscount ? 'has-data' : ''}`}
                        onClick={() => setShowDiscount(!showDiscount)}
                    >
                        <Percent size={14} />
                        <span>{hasDiscount ? `-${cart.discountAmount} ج.م` : 'خصم'}</span>
                        <ChevronDown size={12} className={showDiscount ? 'rotated' : ''} />
                    </button>
                </div>

                {/* Customer Section (Collapsible) */}
                <div className={`collapsible-section ${showCustomer ? 'open' : ''}`}>
                    <CustomerAutocomplete
                        value={cart.customerName}
                        phoneValue={cart.customerPhone}
                        onSelectCustomer={(name, phone) => {
                            cart.setCustomerName(name);
                            cart.setCustomerPhone(phone);
                        }}
                        onNameChange={cart.setCustomerName}
                        onPhoneChange={cart.setCustomerPhone}
                    />
                </div>

                {/* Discount Section (Collapsible) */}
                <div className={`collapsible-section ${showDiscount ? 'open' : ''}`}>
                    <div className="discount-section-inner">
                        <label className="discount-label">قيمة الخصم:</label>
                        <div className="discount-input-row">
                            <input
                                type="number"
                                placeholder="0"
                                value={cart.discountValue || ''}
                                onChange={(e) => cart.setDiscountValue(parseFloat(e.target.value) || 0)}
                                className="discount-input"
                            />
                            <select
                                value={cart.discountType}
                                onChange={(e) => cart.setDiscountType(e.target.value as 'fixed' | 'percent')}
                                className="discount-type-select"
                            >
                                <option value="fixed">ج.م</option>
                                <option value="percent">%</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoice Summary */}
                {cart.items.length > 0 && (
                    <div className="invoice-summary-v2">
                        <div className="summary-line">
                            <span>الإجمالي الفرعي</span>
                            <span>{cart.subtotal.toLocaleString()} ج.م</span>
                        </div>
                        {cart.giftsValue > 0 && (
                            <div className="summary-line gift">
                                <span>🎁 قيمة الهدايا</span>
                                <span>-{cart.giftsValue.toLocaleString()} ج.م</span>
                            </div>
                        )}
                        {cart.discountAmount > 0 && (
                            <div className="summary-line discount">
                                <span>💰 الخصم</span>
                                <span>-{cart.discountAmount.toLocaleString()} ج.م</span>
                            </div>
                        )}
                        <div className="summary-line total">
                            <span>الإجمالي النهائي</span>
                            <span className="total-amount">{cart.totalAmount.toLocaleString()} <small>ج.م</small></span>
                        </div>
                    </div>
                )}

                {/* Checkout Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleCheckout}
                    disabled={cart.items.length === 0 || isProcessing}
                >
                    {isProcessing ? (
                        <span className="processing-text">
                            <span className="spinner"></span>
                            جاري الحفظ...
                        </span>
                    ) : (
                        <>
                            <Printer size={22} />
                            <span>طباعة الفاتورة</span>
                        </>
                    )}
                </button>
            </div>

            <style>{`
                /* ============================================
                   CART PANEL - FULL PAGE SCROLL LAYOUT
                   Best practices: iOS momentum, overscroll containment
                   ============================================ */
                
                .cart-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-panel);
                    /* Enable smooth scrolling for the entire panel */
                    overflow-y: auto;
                    overflow-x: hidden;
                    /* iOS momentum scrolling */
                    -webkit-overflow-scrolling: touch;
                    /* Prevent scroll chaining to parent */
                    overscroll-behavior: contain;
                    /* Thin scrollbar */
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-color) transparent;
                }

                /* Header - Sticky at top */
                .cart-header {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-panel);
                    /* Smooth blur effect for content behind */
                    backdrop-filter: blur(8px);
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .header-icon {
                    font-size: 1.3rem;
                    filter: drop-shadow(0 0 6px rgba(255,255,255,0.2));
                }

                .header-title h2 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .items-badge {
                    background: var(--primary-color);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 10px;
                    min-width: 24px;
                    text-align: center;
                }

                .btn-clear-cart {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 8px;
                    color: var(--accent-red);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-clear-cart:hover {
                    background: var(--accent-red);
                    color: white;
                }

                /* Items List - No internal scroll, flows naturally */
                .cart-items-list {
                    flex: 0 0 auto;
                    padding: 16px;
                }

                .empty-cart-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    text-align: center;
                    opacity: 0.6;
                    padding: 40px 20px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    filter: grayscale(50%);
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .empty-cart-state h3 {
                    margin: 0 0 8px;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                }

                .empty-cart-state p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                /* Footer - Static, scrolls with content */
                .cart-footer {
                    flex: 0 0 auto;
                    padding: 16px;
                    background: var(--bg-panel);
                    border-top: 1px solid var(--border-color);
                }

                /* Quick Actions */
                .quick-actions {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .action-pill {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-pill:hover {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .action-pill.active {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }

                .action-pill.has-data {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: var(--accent-green);
                }

                .action-pill svg.rotated {
                    transform: rotate(180deg);
                }

                .action-pill svg {
                    transition: transform 0.2s;
                }

                /* Collapsible Sections */
                .collapsible-section {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .collapsible-section.open {
                    max-height: 150px;
                    opacity: 1;
                    margin-bottom: 12px;
                }

                .discount-section-inner {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px;
                }

                .discount-label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                    font-weight: 600;
                }

                .discount-input-row {
                    display: flex;
                    gap: 12px;
                }

                .discount-input {
                    flex: 1;
                    background: var(--bg-app);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 14px;
                    color: var(--text-primary);
                    font-size: 1.1rem;
                    font-weight: 700;
                    text-align: center;
                    transition: all 0.2s;
                    min-width: 0;
                }

                .discount-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background: rgba(59, 130, 246, 0.05);
                }

                .discount-type-select {
                    background: var(--bg-app);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 0 20px;
                    color: var(--text-primary);
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .discount-type-select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                /* Invoice Summary */
                .invoice-summary-v2 {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                }

                .summary-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .summary-line.gift span:last-child,
                .summary-line.discount span:last-child {
                    color: var(--accent-red);
                }

                .summary-line.total {
                    border-top: 1px solid var(--border-color);
                    margin-top: 8px;
                    padding-top: 12px;
                }

                .summary-line.total span:first-child {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .total-amount {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--accent-green);
                }

                .total-amount small {
                    font-size: 0.8rem;
                    opacity: 0.8;
                }

                /* Checkout Button */
                .btn-checkout {
                    width: 100%;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #0ea5e9 100%);
                    border: none;
                    border-radius: 14px;
                    color: white;
                    font-size: 1.05rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                }

                .btn-checkout::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .btn-checkout:hover:not(:disabled)::before {
                    left: 100%;
                }

                .btn-checkout:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.5);
                }

                .btn-checkout:active:not(:disabled) {
                    transform: scale(0.98);
                }

                .btn-checkout:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .processing-text {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ============================================
                   MOBILE RESPONSIVE - FULL PAGE SCROLL
                   ============================================ */
                @media (max-width: 768px) {
                    .cart-panel {
                        position: fixed;
                        top: 64px;
                        left: 0;
                        right: 0;
                        /* Align exactly above the navbar using the dynamic offset */
                        bottom: var(--total-bottom-offset, 56px);
                        z-index: 50;
                        transform: translateX(100%);
                        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                        /* Full panel scroll instead of inner scroll */
                        overflow-y: auto;
                        overflow-x: hidden;
                        -webkit-overflow-scrolling: touch;
                        overscroll-behavior: contain;
                        background: var(--bg-panel);
                    }

                    .cart-panel.active {
                        transform: translateX(0);
                    }

                    .cart-panel.hidden {
                        transform: translateX(100%);
                    }

                    .cart-header {
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        flex-shrink: 0;
                        padding: 12px 14px;
                        backdrop-filter: blur(12px);
                        background: rgba(30, 41, 59, 0.95);
                    }

                    .cart-items-list {
                        flex: 0 0 auto;
                        padding: 12px 14px;
                        /* Remove internal scroll - content flows naturally */
                        overflow: visible;
                    }

                    .items-container {
                        /* Items stack naturally */
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .cart-footer {
                        flex: 0 0 auto;
                        padding: 14px;
                        /* Regular padding since container respects navbar + safe-area height */
                        padding-bottom: 24px;
                        border-top: 1px solid var(--border-color);
                        background: var(--bg-panel);
                        /* Not sticky - scrolls with content */
                    }

                    .quick-actions {
                        gap: 6px;
                        margin-bottom: 10px;
                    }

                    .action-pill {
                        padding: 10px 12px;
                        font-size: 0.8rem;
                    }

                    .collapsible-section.open {
                        max-height: 180px;
                        margin-bottom: 12px;
                    }

                    .discount-section-inner {
                        padding: 14px;
                        border-radius: 14px;
                    }

                    .discount-input {
                        padding: 16px;
                        font-size: 1.2rem;
                    }

                    .discount-type-select {
                        padding: 0 24px;
                        font-size: 1.1rem;
                    }

                    .invoice-summary-v2 {
                        padding: 10px 12px;
                        margin-bottom: 10px;
                    }

                    .summary-line {
                        padding: 5px 0;
                        font-size: 0.85rem;
                    }

                    .btn-checkout,
                    .cart-footer .btn-primary {
                        height: 52px;
                        font-size: 1rem;
                        border-radius: 12px;
                    }
                }
            `}</style>
        </section>
    );
};
