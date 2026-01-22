
import React from 'react';
import { Package, ShoppingCart } from 'lucide-react';

interface MobileTabsProps {
    activeTab: 'products' | 'cart';
    onTabChange: (tab: 'products' | 'cart') => void;
    cartCount: number;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ activeTab, onTabChange, cartCount }) => {
    return (
        <>
            <nav className="mobile-nav-bar">
                <button
                    className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => onTabChange('products')}
                >
                    <Package size={20} />
                    <span>المنتجات</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                    onClick={() => onTabChange('cart')}
                >
                    <div className="cart-icon-wrapper">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </div>
                    <span>السلة</span>
                </button>
            </nav>

            <style>{`
                .mobile-nav-bar {
                    display: none;
                }

                @media (max-width: 768px) {
                    .mobile-nav-bar {
                        display: flex;
                        position: relative;
                        width: 100%;
                        /* Occupy natural space in the flex container */
                        flex-shrink: 0;
                        height: var(--total-bottom-offset, 56px);
                        background: var(--bg-panel);
                        border-top: 1px solid var(--border-color);
                        z-index: 100;
                        padding: 0;
                        /* Padding at the bottom for safe area */
                        padding-bottom: var(--safe-area-bottom, 0);
                    }

                    .nav-item {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                        background: transparent;
                        border: none;
                        color: var(--text-muted);
                        font-size: 0.75rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        position: relative;
                    }

                    .nav-item.active {
                        color: var(--primary-color);
                    }

                    .nav-item.active::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 40px;
                        height: 3px;
                        background: var(--primary-color);
                        border-radius: 0 0 3px 3px;
                    }

                    .cart-icon-wrapper {
                        position: relative;
                    }

                    .cart-badge {
                        position: absolute;
                        top: -6px;
                        right: -10px;
                        min-width: 18px;
                        height: 18px;
                        background: var(--accent-red);
                        color: white;
                        font-size: 0.65rem;
                        font-weight: 700;
                        border-radius: 9px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 4px;
                    }
                }
            `}</style>
        </>
    );
};
