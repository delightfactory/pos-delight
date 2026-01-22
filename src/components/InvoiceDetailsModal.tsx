
import React from 'react';
import { FileDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Invoice {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    total_amount: number;
    discount_amount: number;
    discount_type: 'fixed' | 'percent' | null;
    created_at: string;
    items?: InvoiceItem[];
}

interface InvoiceItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    is_gift: boolean;
    gift_reason: string | null;
}

interface InvoiceDetailsModalProps {
    invoice: Invoice | null;
    onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, onClose }) => {
    const overlayRef = React.useRef<HTMLDivElement>(null);

    // All hooks must be called before any conditional returns
    if (!invoice) return null;

    const exportToExcel = () => {
        if (!invoice.items || invoice.items.length === 0) {
            alert('لا توجد عناصر للتصدير');
            return;
        }

        // إعداد البيانات للتصدير
        const data: any[] = invoice.items.map((item, index) => ({
            '#': index + 1,
            'المنتج': item.product_name,
            'الكمية': item.quantity,
            'السعر': item.price,
            'الإجمالي': item.total,
            'هدية؟': item.is_gift ? 'نعم' : 'لا',
            'سبب الهدية': item.gift_reason || '-'
        }));

        // إضافة صف الإجمالي
        data.push({
            '#': '',
            'المنتج': 'الإجمالي',
            'الكمية': '',
            'السعر': '',
            'الإجمالي': invoice.total_amount,
            'هدية؟': '',
            'سبب الهدية': ''
        });

        // إنشاء الورقة
        const ws = XLSX.utils.json_to_sheet(data);

        // تنسيق الأعمدة
        const colWidths = [
            { wch: 5 },  // #
            { wch: 25 }, // المنتج
            { wch: 8 },  // الكمية
            { wch: 10 }, // السعر
            { wch: 12 }, // الإجمالي
            { wch: 8 },  // هدية؟
            { wch: 20 }  // سبب الهدية
        ];
        ws['!cols'] = colWidths;

        // إنشاء المصنف
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الفاتورة');

        // حفظ الملف
        const filename = `invoice_${invoice.id.slice(0, 8)}_${new Date(invoice.created_at).toLocaleDateString('ar-EG')}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="invoice-modal">
                {/* Header */}
                <div className="invoice-modal-header">
                    <div>
                        <h2>تفاصيل الفاتورة</h2>
                        <p className="invoice-id">#{invoice.id.slice(0, 8)}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-export" onClick={exportToExcel}>
                            <FileDown size={18} />
                            <span>تصدير Excel</span>
                        </button>
                        <button className="btn-close-modal" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="invoice-modal-body">
                    {/* Customer Info */}
                    {(invoice.customer_name || invoice.customer_phone) && (
                        <div className="invoice-section">
                            <h3>معلومات العميل</h3>
                            <div className="customer-info-grid">
                                {invoice.customer_name && (
                                    <div className="info-item">
                                        <span className="label">الاسم:</span>
                                        <span className="value">{invoice.customer_name}</span>
                                    </div>
                                )}
                                {invoice.customer_phone && (
                                    <div className="info-item">
                                        <span className="label">الهاتف:</span>
                                        <span className="value">{invoice.customer_phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice Date */}
                    <div className="invoice-section">
                        <h3>التاريخ</h3>
                        <p className="invoice-date">
                            {new Date(invoice.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="invoice-section">
                        <h3>المنتجات</h3>
                        <div className="invoice-items-list">
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <div key={item.id} className="invoice-item-row">
                                        <div className="item-index">{index + 1}</div>
                                        <div className="item-details">
                                            <div className="item-name">
                                                {item.product_name}
                                                {item.is_gift && <span className="gift-tag">🎁 هدية</span>}
                                            </div>
                                            {item.gift_reason && (
                                                <div className="gift-reason-text">
                                                    السبب: {item.gift_reason}
                                                </div>
                                            )}
                                            <div className="item-meta">
                                                {item.quantity} × {item.price.toLocaleString()} ج.م
                                            </div>
                                        </div>
                                        <div className="item-total">
                                            {item.total.toLocaleString()} ج.م
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-items">لا توجد عناصر</p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="invoice-summary-section">
                        {invoice.discount_amount > 0 && (
                            <div className="summary-row">
                                <span>الخصم:</span>
                                <span className="discount">-{invoice.discount_amount.toLocaleString()} ج.م</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>الإجمالي النهائي:</span>
                            <span className="total-value">{invoice.total_amount.toLocaleString()} ج.م</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1001;
                    padding: 20px;
                    animation: fadeInOverlay 0.2s ease-out;
                }

                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .invoice-modal {
                    background: var(--bg-panel);
                    border-radius: 16px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    animation: slideUpModal 0.3s ease-out;
                }

                @keyframes slideUpModal {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .invoice-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-panel);
                    flex-shrink: 0;
                }

                .invoice-modal-header h2 {
                    font-size: 1.2rem;
                    color: var(--text-primary);
                    margin: 0;
                }

                .invoice-modal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                    min-height: 0;
                }

                .invoice-id {
                    font-size: 0.85rem;
                    color: var(--primary-color);
                    font-family: monospace;
                    margin-top: 4px;
                }

                .header-actions {
                    display: flex;
                    gap: 8px;
                }

                .btn-export {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: var(--accent-green);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-export:hover {
                    background: #059669;
                    transform: translateY(-1px);
                }

                .btn-close-modal {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-close-modal:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: var(--accent-red);
                    color: var(--accent-red);
                }

                .invoice-section {
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-color);
                }

                .invoice-section h3 {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin: 0 0 12px 0;
                }

                .customer-info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .info-item {
                    display: flex;
                    gap: 8px;
                }

                .info-item .label {
                    color: var(--text-secondary);
                    min-width: 60px;
                }

                .info-item .value {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .invoice-date {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .invoice-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .invoice-item-row {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg-app);
                    border-radius: 8px;
                }

                .item-index {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .item-details {
                    flex: 1;
                }

                .item-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gift-tag {
                    font-size: 0.75rem;
                    background: linear-gradient(135deg, #a855f7, #ec4899);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                }

                .gift-reason-text {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                    font-style: italic;
                }

                .item-meta {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }

                .item-total {
                    font-weight: 700;
                    color: var(--accent-green);
                    flex-shrink: 0;
                }

                .no-items {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 20px;
                }

                .invoice-summary-section {
                    padding: 16px 24px;
                    background: rgba(59, 130, 246, 0.05);
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 0.95rem;
                }

                .summary-row.total {
                    border-top: 2px solid var(--primary-color);
                    padding-top: 12px;
                    margin-top: 8px;
                }

                .summary-row .discount {
                    color: var(--accent-red);
                    font-weight: 600;
                }

                .summary-row .total-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--accent-green);
                }

                @media (max-width: 640px) {
                    .invoice-modal {
                        max-height: 95vh;
                    }

                    .invoice-modal-header {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .btn-export {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
};
