
import React from 'react';
import { Upload, BarChart3 } from 'lucide-react';

interface HeaderProps {
    onOpenSales: () => void;
    onOpenManagement: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSales, onOpenManagement }) => {
    return (
        <header className="app-header">
            <div className="brand">
                <span style={{ marginRight: '8px', filter: 'drop-shadow(0 0 5px var(--primary-color))' }}>⚡</span>
                <span>POS System</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={onOpenSales} style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
                    <BarChart3 size={18} />
                    <span className="mobile-hide">المبيعات</span>
                </button>

                <button className="btn btn-primary" onClick={onOpenManagement} style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
                    <Upload size={18} />
                    <span className="mobile-hide">إدارة المنتجات</span>
                </button>
            </div>

            <style>{`
                .mobile-hide { display: inline; }
                @media (max-width: 600px) {
                    .mobile-hide { display: none; }
                }
            `}</style>
        </header>
    );
};
