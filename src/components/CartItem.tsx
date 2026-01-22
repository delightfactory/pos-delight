
import React, { useState } from 'react';
import type { CartItem as CartItemType } from '../types';
import { Trash2, Plus, Minus, Gift, ChevronDown } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: string, newQuantity: number) => void;
    onRemove: (id: string) => void;
    onSetGiftQuantity: (id: string, quantity: number) => void;
    onSetGiftReason: (id: string, reason: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove, onSetGiftQuantity, onSetGiftReason }) => {
    const [showGiftSection, setShowGiftSection] = useState(false);
    const unitPrice = item.sale_price || item.price;
    const giftQty = item.gift_quantity || 0;
    const paidQty = item.cartQuantity - giftQty;
    const lineTotal = unitPrice * paidQty;
    const hasGifts = giftQty > 0;

    // Auto-show gift section if there are gifts
    React.useEffect(() => {
        if (hasGifts) setShowGiftSection(true);
    }, [hasGifts]);

    return (
        <div className={`cart-item-pro ${hasGifts ? 'has-gifts' : ''}`}>
            {/* Header: Name + Delete */}
            <div className="item-header-pro">
                <div className="item-name-pro">{item.name}</div>
                <button
                    className="btn-delete-pro"
                    onClick={() => onRemove(item.id)}
                    aria-label="حذف المنتج"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Price Row */}
            <div className="price-row-pro">
                <span className="unit-price-pro">{unitPrice.toLocaleString()} ج.م للقطعة</span>
                {hasGifts && (
                    <span className="gift-indicator">🎁 {giftQty} هدية</span>
                )}
            </div>

            {/* Controls Row: Qty + Total */}
            <div className="controls-row-pro">
                <div className="qty-stepper-pro">
                    <button
                        className="stepper-btn-pro minus"
                        onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                        disabled={item.cartQuantity <= 1}
                        aria-label="تقليل الكمية"
                    >
                        <Minus size={18} />
                    </button>
                    <span className="qty-display-pro">{item.cartQuantity}</span>
                    <button
                        className="stepper-btn-pro plus"
                        onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                        aria-label="زيادة الكمية"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="line-total-pro">
                    <span className="total-label">الإجمالي</span>
                    <span className="total-value">{lineTotal.toLocaleString()} <small>ج.م</small></span>
                </div>
            </div>

            {/* Gift Toggle Button */}
            <button
                className={`gift-toggle-btn ${showGiftSection ? 'active' : ''}`}
                onClick={() => setShowGiftSection(!showGiftSection)}
            >
                <Gift size={14} />
                <span>{hasGifts ? `${giftQty} هدية` : 'إضافة هدية'}</span>
                <ChevronDown size={14} className={`chevron ${showGiftSection ? 'open' : ''}`} />
            </button>

            {/* Collapsible Gift Section */}
            <div className={`gift-section-pro ${showGiftSection ? 'show' : ''}`}>
                <div className="gift-qty-row">
                    <label>عدد الهدايا:</label>
                    <div className="gift-stepper">
                        <button
                            onClick={() => onSetGiftQuantity(item.id, Math.max(0, giftQty - 1))}
                            disabled={giftQty <= 0}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="gift-qty-value">{giftQty}</span>
                        <button
                            onClick={() => onSetGiftQuantity(item.id, Math.min(item.cartQuantity, giftQty + 1))}
                            disabled={giftQty >= item.cartQuantity}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <span className="gift-max">من {item.cartQuantity}</span>
                </div>

                {hasGifts && (
                    <input
                        type="text"
                        className="gift-reason-input"
                        placeholder="سبب الهدية (اختياري)..."
                        value={item.gift_reason || ''}
                        onChange={(e) => onSetGiftReason(item.id, e.target.value)}
                    />
                )}
            </div>

            <style>{`
                .cart-item-pro {
                    background: var(--bg-panel);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 10px;
                    transition: all 0.25s ease;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .cart-item-pro:hover {
                    border-color: rgba(59, 130, 246, 0.4);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .cart-item-pro.has-gifts {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%);
                    border-color: rgba(168, 85, 247, 0.3);
                }

                /* Header */
                .item-header-pro {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .item-name-pro {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1.35;
                    flex: 1;
                }

                .btn-delete-pro {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--accent-red);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .btn-delete-pro:hover {
                    background: var(--accent-red);
                    color: white;
                    transform: scale(1.05);
                }

                .btn-delete-pro:active {
                    transform: scale(0.95);
                }

                /* Price Row */
                .price-row-pro {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .unit-price-pro {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .gift-indicator {
                    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                    color: white;
                    font-size: 0.75rem;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                /* Controls Row */
                .controls-row-pro {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 10px;
                }

                .qty-stepper-pro {
                    display: flex;
                    align-items: center;
                    background: var(--bg-app);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 4px;
                }

                .stepper-btn-pro {
                    width: 44px;
                    height: 44px;
                    border: none;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-weight: bold;
                }

                .stepper-btn-pro.minus {
                    background: var(--bg-card);
                    color: var(--text-primary);
                }

                .stepper-btn-pro.plus {
                    background: linear-gradient(135deg, var(--accent-green) 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .stepper-btn-pro:hover:not(:disabled) {
                    transform: scale(1.05);
                }

                .stepper-btn-pro:active:not(:disabled) {
                    transform: scale(0.95);
                }

                .stepper-btn-pro:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .qty-display-pro {
                    min-width: 40px;
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .line-total-pro {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    text-align: right;
                }

                .total-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .total-value {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: var(--accent-green);
                    line-height: 1.2;
                }

                .total-value small {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }

                /* Gift Toggle */
                .gift-toggle-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    background: rgba(168, 85, 247, 0.08);
                    border: 1px dashed rgba(168, 85, 247, 0.3);
                    border-radius: 8px;
                    color: #a855f7;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .gift-toggle-btn:hover {
                    background: rgba(168, 85, 247, 0.15);
                    border-style: solid;
                }

                .gift-toggle-btn.active {
                    background: rgba(168, 85, 247, 0.15);
                    border-style: solid;
                }

                .gift-toggle-btn .chevron {
                    transition: transform 0.2s;
                }

                .gift-toggle-btn .chevron.open {
                    transform: rotate(180deg);
                }

                /* Gift Section */
                .gift-section-pro {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    margin-top: 0;
                }

                .gift-section-pro.show {
                    max-height: 150px;
                    opacity: 1;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(168, 85, 247, 0.2);
                }

                .gift-qty-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .gift-qty-row label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }

                .gift-stepper {
                    display: flex;
                    align-items: center;
                    background: var(--bg-app);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    border-radius: 8px;
                    padding: 2px;
                }

                .gift-stepper button {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: #a855f7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .gift-stepper button:hover:not(:disabled) {
                    background: rgba(168, 85, 247, 0.2);
                }

                .gift-stepper button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .gift-qty-value {
                    min-width: 28px;
                    text-align: center;
                    font-weight: 700;
                    color: #a855f7;
                }

                .gift-max {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-right: auto;
                }

                .gift-reason-input {
                    width: 100%;
                    background: var(--bg-app);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    border-radius: 8px;
                    padding: 10px 12px;
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    transition: border-color 0.2s;
                }

                .gift-reason-input:focus {
                    outline: none;
                    border-color: #a855f7;
                    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
                }

                .gift-reason-input::placeholder {
                    color: var(--text-muted);
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
};
