import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { LineChart, BarChart3, Calendar, ArrowUpRight, Gift, Percent, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { exportToExcel } from '../utils/excelExport';

interface ReportsBoardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReportsBoard: React.FC<ReportsBoardProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'discounts'>('overview');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [loading, setLoading] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        totalSales: 0,
        netRevenue: 0,
        totalOrders: 0,
        totalDiscounts: 0,
        totalGifts: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchReportData();
        }
    }, [isOpen, dateRange, customStart, customEnd, activeTab]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Determine date range
            let startDate = new Date();
            let endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            if (dateRange === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === 'week') {
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === 'custom' && customStart && customEnd) {
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                endDate.setHours(23, 59, 59, 999);
            }

            // Fetch Overview Data using the view
            const { data: revenueData, error } = await supabase
                .from('invoices')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (error) throw error;

            if (revenueData) {
                const totalSales = revenueData.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
                const totalDiscounts = revenueData.reduce((sum, inv) => sum + (inv.discount_amount || 0), 0);
                // total_gifts_value is now in type definition
                const totalGifts = revenueData.reduce((sum, inv) => sum + (inv.total_gifts_value || 0), 0);

                const netRevenue = totalSales - totalDiscounts - totalGifts;

                setStats({
                    totalSales,
                    netRevenue,
                    totalOrders: revenueData.length,
                    totalDiscounts,
                    totalGifts
                });
            }

            if (revenueData && revenueData.length > 0) {
                // Get Invoice IDs to fetch items
                const invoiceIds = revenueData.map(inv => inv.id);

                const { data: items, error: itemsError } = await supabase
                    .from('invoice_items')
                    .select('*')
                    .in('invoice_id', invoiceIds);

                if (itemsError) throw itemsError;

                if (items) {
                    // Process Product Performance
                    const productMap: Record<string, { name: string, quantity: number, revenue: number, count: number }> = {};
                    const giftMap: Record<string, { count: number, quantity: number }> = {};

                    items.forEach(item => {
                        // Product Stats
                        // Use product_name as key fallback if ID is null (older data or deleted products)
                        const key = item.product_name;
                        if (!productMap[key]) {
                            productMap[key] = {
                                name: item.product_name,
                                quantity: 0,
                                revenue: 0,
                                count: 0
                            };
                        }
                        productMap[key].quantity += item.quantity;
                        productMap[key].revenue += item.total; // total computed by DB or app
                        productMap[key].count += 1;

                        // Gift Stats
                        if (item.is_gift) {
                            const reason = item.gift_reason || 'بدون سبب';
                            if (!giftMap[reason]) {
                                giftMap[reason] = { count: 0, quantity: 0 };
                            }
                            giftMap[reason].count += 1;
                            giftMap[reason].quantity += item.quantity;
                        }
                    });

                    // Sort and Set State
                    const sortedProducts = Object.values(productMap)
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 50); // Top 50

                    setTopProducts(sortedProducts);
                    setGiftStats(giftMap);
                }
            } else {
                setTopProducts([]);
                setGiftStats({});
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // State for detailed reports
    const [topProducts, setTopProducts] = useState<Array<{ name: string, quantity: number, revenue: number, count: number }>>([]);
    const [giftStats, setGiftStats] = useState<Record<string, { count: number, quantity: number }>>({});

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="reports-board">
                <div className="reports-header">
                    <div className="reports-title">
                        <BarChart3 size={32} className="text-primary" />
                        <div>
                            <h2>لوحة التقارير</h2>
                            <p className="text-secondary">تحليلات الأداء والمبيعات</p>
                        </div>
                    </div>

                    <div className="reports-controls">
                        <button
                            className="btn btn-primary sm"
                            onClick={() => {
                                const dateStr = new Date().toISOString().split('T')[0];
                                let dataToExport: any[] = [];
                                let fileName = `Report_${dateStr}`;

                                if (activeTab === 'overview') {
                                    fileName = `Overview_Report_${dateStr}`;
                                    // For overview, we might want to export the stats object or revenueData if accessible
                                    // Since revenueData is local to fetchReportData, we might need to store it in state or just export current stats
                                    dataToExport = [
                                        { Metric: 'Total Sales', Value: stats.totalSales },
                                        { Metric: 'Net Revenue', Value: stats.netRevenue },
                                        { Metric: 'Total Orders', Value: stats.totalOrders },
                                        { Metric: 'Total Discounts', Value: stats.totalDiscounts },
                                        { Metric: 'Total Gifts Value', Value: stats.totalGifts }
                                    ];
                                } else if (activeTab === 'products') {
                                    fileName = `Products_Performance_${dateStr}`;
                                    dataToExport = topProducts.map(p => ({
                                        'Product Name': p.name,
                                        'Quantity Sold': p.quantity,
                                        'Order Count': p.count,
                                        'Revenue': p.revenue
                                    }));
                                } else if (activeTab === 'discounts') {
                                    fileName = `Gifts_Report_${dateStr}`;
                                    dataToExport = Object.entries(giftStats).map(([reason, stat]) => ({
                                        'Gift Reason': reason,
                                        'Occurrences': stat.count,
                                        'Total Quantity': stat.quantity
                                    }));
                                }

                                if (dataToExport.length > 0) {
                                    exportToExcel(dataToExport, fileName);
                                }
                            }}
                            style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Download size={16} />
                            تصدير Excel
                        </button>

                        <div className="date-tabs">
                            <button
                                className={`date-tab ${dateRange === 'today' ? 'active' : ''}`}
                                onClick={() => setDateRange('today')}
                            >
                                اليوم
                            </button>
                            <button
                                className={`date-tab ${dateRange === 'week' ? 'active' : ''}`}
                                onClick={() => setDateRange('week')}
                            >
                                أسبوع
                            </button>
                            <button
                                className={`date-tab ${dateRange === 'month' ? 'active' : ''}`}
                                onClick={() => setDateRange('month')}
                            >
                                شهر
                            </button>
                            <button
                                className={`date-tab ${dateRange === 'custom' ? 'active' : ''}`}
                                onClick={() => setDateRange('custom')}
                            >
                                مخصص
                            </button>
                        </div>

                        {dateRange === 'custom' && (
                            <div className="custom-date-inputs">
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="form-input sm"
                                />
                                <span>إلى</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="form-input sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="reports-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LineChart size={18} />
                        نظرة عامة
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <BarChart3 size={18} />
                        أداء المنتجات
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'discounts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('discounts')}
                    >
                        <Percent size={18} />
                        الخصومات والهدايا
                    </button>
                </div>

                <div className="reports-content">
                    {loading ? (
                        <div className="loading-state">جاري تحليل البيانات...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="overview-grid">
                                    <div className="stat-card blue">
                                        <div className="stat-icon"><BarChart3 size={24} /></div>
                                        <div className="stat-info">
                                            <label>إجمالي المبيعات</label>
                                            <div className="stat-value">{stats.totalSales.toLocaleString()} ج.م</div>
                                        </div>
                                    </div>
                                    <div className="stat-card green">
                                        <div className="stat-icon"><ArrowUpRight size={24} /></div>
                                        <div className="stat-info">
                                            <label>صافي الإيرادات</label>
                                            <div className="stat-value">{stats.netRevenue.toLocaleString()} ج.م</div>
                                        </div>
                                    </div>
                                    <div className="stat-card purple">
                                        <div className="stat-icon"><Calendar size={24} /></div>
                                        <div className="stat-info">
                                            <label>عدد الطلبات</label>
                                            <div className="stat-value">{stats.totalOrders}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card orange">
                                        <div className="stat-icon"><Percent size={24} /></div>
                                        <div className="stat-info">
                                            <label>إجمالي الخصومات</label>
                                            <div className="stat-value">{stats.totalDiscounts.toLocaleString()} ج.م</div>
                                        </div>
                                    </div>
                                    <div className="stat-card red">
                                        <div className="stat-icon"><Gift size={24} /></div>
                                        <div className="stat-info">
                                            <label>قيمة الهدايا</label>
                                            <div className="stat-value">{stats.totalGifts.toLocaleString()} ج.م</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="products-analysis">
                                    <h3>المنتجات الأكثر مبيعاً (من حيث الإيرادات)</h3>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>المنتج</th>
                                                <th>العدد المباع</th>
                                                <th>عدد مرات الطلب</th>
                                                <th>إجمالي الإيرادات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.length > 0 ? (
                                                topProducts.map((product, idx) => (
                                                    <tr key={idx}>
                                                        <td>{product.name}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{product.count}</td>
                                                        <td>{product.revenue.toLocaleString()} ج.م</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                                                        لا توجد بيانات لهذه الفترة
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'discounts' && (
                                <div className="discounts-analysis">
                                    <div className="analysis-section">
                                        <h3>تحليل الهدايا والمجاملات</h3>
                                        <table className="report-table">
                                            <thead>
                                                <tr>
                                                    <th>سبب الهدية</th>
                                                    <th>عدد المرات</th>
                                                    <th>إجمالي الكميات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(giftStats).length > 0 ? (
                                                    Object.entries(giftStats).map(([reason, stat], idx) => (
                                                        <tr key={idx}>
                                                            <td>{reason}</td>
                                                            <td>{stat.count}</td>
                                                            <td>{stat.quantity}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                                                            لا توجد هدايا مسجلة في هذه الفترة
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="reports-footer">
                    <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
                </div>
            </div>

            <style>{`
                .reports-board {
                    width: 900px;
                    max-width: 95vw;
                    height: 85vh; /* Fixed height relative to viewport */
                    max-height: 800px;
                    display: flex;
                    flex-direction: column;
                }
                
                @media (max-width: 768px) {
                    .reports-board {
                        width: 100%;
                        height: 100vh;
                        max-height: none;
                        border-radius: 0;
                    }
                }

                .reports-content {
                    flex: 1;
                    overflow-y: auto; /* Enable scrolling */
                    padding: 0 4px; /* Space for scrollbar */
                }

                .reports-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 20px;
                }

                .reports-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .reports-title h2 { margin: 0; font-size: 1.5rem; }
                .reports-title p { margin: 0; font-size: 0.9rem; }

                .reports-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-end;
                }

                .date-tabs {
                    display: flex;
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: 8px;
                    gap: 4px;
                }

                .date-tab {
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }

                .date-tab.active {
                    background: var(--bg-primary);
                    color: var(--primary-color);
                    font-weight: 600;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .custom-date-inputs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-secondary);
                    padding: 6px;
                    border-radius: 8px;
                }

                .reports-nav {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border: 1px solid transparent;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }

                .nav-item:hover {
                    background: var(--bg-secondary);
                }

                .nav-item.active {
                    background: rgba(37, 99, 235, 0.1);
                    color: var(--primary-color);
                    border-color: rgba(37, 99, 235, 0.2);
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--bg-secondary);
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border: 1px solid transparent;
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-card.blue { border-bottom: 3px solid #3b82f6; }
                .stat-card.green { border-bottom: 3px solid #10b981; }
                .stat-card.purple { border-bottom: 3px solid #8b5cf6; }
                .stat-card.orange { border-bottom: 3px solid #f59e0b; }
                .stat-card.red { border-bottom: 3px solid #ef4444; }

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }

                .stat-info label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                    display: block;
                }

                .stat-value {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .loading-state, .placeholder-content {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                    background: var(--bg-secondary);
                    border-radius: 12px;
                }

                .reports-footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                }

                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                }

                .report-table th, .report-table td {
                    text-align: right;
                    padding: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .report-table th {
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    background: var(--bg-secondary);
                }

                .report-table td {
                    color: var(--text-primary);
                }

                .products-analysis, .discounts-analysis {
                    padding: 0 4px;
                }

                .analysis-section {
                    margin-bottom: 32px;
                }
                
                h3 {
                    font-size: 1.1rem;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }
            `}</style>
        </Modal>
    );
};
