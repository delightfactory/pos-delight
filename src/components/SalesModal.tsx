

import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { supabase } from '../supabaseClient';
import type { Invoice } from '../types';
import { BarChart3, Download } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

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

    // Date filtering state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset dates on open if desired, or keep them. 
            // For now, let's keep them if set, otherwise fetch default.
            fetchSales();
        }
    }, [isOpen]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            // If dates are selected, apply filter and remove limit
            if (startDate && endDate) {
                // Adjust endDate to include the full day (23:59:59)
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);

                query = query
                    .gte('created_at', new Date(startDate).toISOString())
                    .lte('created_at', endDateTime.toISOString());
            } else {
                // Default behavior: last 50
                query = query.limit(50);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setInvoices(data);
                const totalAmount = data.reduce((sum, inv) => sum + inv.total_amount, 0);
                setTotals({ count: data.length, amount: totalAmount });
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
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
                    <div className="sales-header">
                        <h2 className="sales-modal-title">
                            <BarChart3 size={28} className="text-primary" />
                            <span>سجل المبيعات</span>
                        </h2>

                        <div className="date-filter">
                            <div className="date-input-group">
                                <label>من:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="date-input-group">
                                <label>إلى:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={fetchSales}
                                disabled={loading}
                            >
                                {loading ? '...' : 'بحث'}
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setLoading(true);
                                        supabase
                                            .from('invoices')
                                            .select('*')
                                            .order('created_at', { ascending: false })
                                            .limit(50)
                                            .then(({ data, error }) => {
                                                if (!error && data) {
                                                    setInvoices(data);
                                                    const totalAmount = data.reduce((sum, inv) => sum + inv.total_amount, 0);
                                                    setTotals({ count: data.length, amount: totalAmount });
                                                }
                                                setLoading(false);
                                            });
                                    }}
                                >
                                    مسح
                                </button>
                            )}

                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                    if (invoices.length === 0) return;

                                    const dataToExport = invoices.map(inv => ({
                                        'رقم الفاتورة': inv.id.split('-')[0], // Short ID for readability
                                        'التاريخ': new Date(inv.created_at).toLocaleDateString('ar-EG'),
                                        'الوقت': new Date(inv.created_at).toLocaleTimeString('ar-EG'),
                                        'اسم العميل': inv.customer_name || '-',
                                        'رقم الهاتف': inv.customer_phone || '-',
                                        'إجمالي الفاتورة': inv.total_amount,
                                        'قيمة الخصم': inv.discount_amount || 0,
                                        'نوع الخصم': inv.discount_type === 'fixed' ? 'مبلغ ثابت' : (inv.discount_type === 'percent' ? 'نسبة مئوية' : '-'),
                                        'صافي المدفوع': inv.total_amount // Assuming total_amount is net, if not calc it
                                    }));

                                    const fileName = startDate && endDate
                                        ? `Sales_Report_${startDate}_to_${endDate}`
                                        : `Sales_Report_Recent_${new Date().toISOString().split('T')[0]}`;

                                    exportToExcel(dataToExport, fileName, 'المبيعات');
                                }}
                                disabled={invoices.length === 0}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Download size={14} />
                                تصدير
                            </button>
                        </div>
                    </div>

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
                .sales-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .date-filter {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .date-input-group {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .date-input-group label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                
                .form-input {
                    padding: 6px 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }
                
                .btn-sm {
                    padding: 6px 12px;
                    font-size: 0.85rem;
                }

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
