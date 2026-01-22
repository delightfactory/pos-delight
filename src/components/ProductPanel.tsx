
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';

interface ProductPanelProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onQuickAdd: (product: Product) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    className?: string;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({
    products,
    onProductClick,
    onQuickAdd,
    searchQuery,
    onSearchChange,
    className
}) => {
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className={`products-panel ${className || ''}`}>
            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="ابحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="products-count">{filtered.length} منتج</div>
            </div>

            <div className="products-grid">
                {filtered.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onClick={onProductClick}
                        onQuickAdd={onQuickAdd}
                    />
                ))}
            </div>
        </section>
    );
};
