

import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { supabase } from '../supabaseClient';
import type { Invoice } from '../types';
import { BarChart3 } from 'lucide-react';

interface InvoiceWithItems extends Invoice {
    items?: Array<{
        id: string;
        product_name: string;
        quantity: number;
        price: number;
        total: number;
        is_gift: boolean;
        gift_reason: string | null;
    }>;
}

interface SalesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ count: 0, amount: 0 });
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSales();
        }
    }, [isOpen]);

    const fetchSales = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setInvoices(data);
            const totalAmount = data.reduce((sum, inv) => sum + inv.total_amount, 0);
            setTotals({ count: data.length, amount: totalAmount });
        }
        setLoading(false);
    };

    const handleInvoiceClick = async (invoice: Invoice) => {
        // Fetch invoice items
        const { data: items, error } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);

        if (error) {
            console.error('Error fetching invoice items:', error);
        }

        setSelectedInvoice({
            ...invoice,
            items: items || []
        });
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="sales-modal">
                    <h2 className="sales-modal-title">
                        <BarChart3 size={28} className="text-primary" />
                        <span>سجل المبيعات (آخر 50)</span>
                    </h2>

                    <div className="sales-stats">
                        <div className="sales-stat green">
                            <div className="sales-stat-value">{totals.amount.toLocaleString()}</div>
                            <div className="sales-stat-label">إجمالي القيمة</div>
                        </div>
                        <div className="sales-stat cyan">
                            <div className="sales-stat-value">{totals.count}</div>
                            <div className="sales-stat-label">عدد الفواتير</div>
                        </div>
                    </div>

                    <div className="sales-list">
                        {loading ? (
                            <div className="loading">جاري التحميل...</div>
                        ) : invoices.length === 0 ? (
                            <div className="sales-empty">لا توجد مبيعات</div>
                        ) : (
                            invoices.map(inv => (
                                <div
                                    key={inv.id}
                                    className="sales-item clickable"
                                    onClick={() => handleInvoiceClick(inv)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="sales-item-info">
                                        <div className="sales-item-id">#{inv.id.slice(0, 8)}</div>
                                        <div className="sales-item-date">{new Date(inv.created_at).toLocaleString('ar-EG')}</div>
                                        {inv.customer_name && <div style={{ fontSize: '11px' }}>{inv.customer_name}</div>}
                                    </div>
                                    <div className="sales-item-total">{inv.total_amount.toLocaleString()} ج.م</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="sales-actions">
                        <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
                    </div>
                </div>
            </Modal>

            <InvoiceDetailsModal
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style>{`
                .sales-item.clickable {
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sales-item.clickable:hover {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: var(--primary-color);
                    transform: translateX(4px);
                }
            `}</style>
        </>
    );
};
