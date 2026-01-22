
import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Customer {
    id: string;
    name: string;
    phone: string;
    total_purchases: number;
    invoice_count: number;
    last_purchase_date: string;
}

interface CustomerAutocompleteProps {
    value: string;
    phoneValue: string;
    onSelectCustomer: (name: string, phone: string) => void;
    onNameChange: (name: string) => void;
    onPhoneChange: (phone: string) => void;
}

export const CustomerAutocomplete: React.FC<CustomerAutocompleteProps> = ({
    value,
    phoneValue,
    onSelectCustomer,
    onNameChange,
    onPhoneChange
}) => {
    const [suggestions, setSuggestions] = useState<Customer[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // البحث عن العملاء
    useEffect(() => {
        const searchCustomers = async () => {
            const query = value || phoneValue;

            if (query.length < 2) {
                setSuggestions([]);
                setIsOpen(false);
                return;
            }

            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
                .order('last_purchase_date', { ascending: false })
                .limit(5);

            if (!error && data) {
                setSuggestions(data);
                setIsOpen(data.length > 0);
            }
        };

        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [value, phoneValue]);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (customer: Customer) => {
        onSelectCustomer(customer.name, customer.phone);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div className="customer-autocomplete-pro" ref={wrapperRef}>
            <div className="customer-inputs-row">
                <div className={`customer-input-group ${value ? 'has-value' : ''}`}>
                    <User size={16} className="input-icon" />
                    <input
                        type="text"
                        placeholder="اسم العميل"
                        value={value}
                        onChange={(e) => onNameChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={`customer-input-group ${phoneValue ? 'has-value' : ''}`}>
                    <Phone size={16} className="input-icon" />
                    <input
                        type="tel"
                        placeholder="رقم الهاتف"
                        value={phoneValue}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="customer-suggestions">
                    {suggestions.map((customer, index) => (
                        <button
                            key={customer.id}
                            className={`suggestion-card ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(customer)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            <div className="suggestion-main">
                                <div className="customer-name-row">
                                    <User size={14} />
                                    <strong>{customer.name}</strong>
                                </div>
                                <div className="customer-phone-row">
                                    <Phone size={12} />
                                    {customer.phone}
                                </div>
                            </div>
                            <div className="suggestion-stats">
                                <span className="stat">
                                    <TrendingUp size={12} />
                                    {customer.total_purchases?.toLocaleString() || 0} ج.م
                                </span>
                                <span className="stat">
                                    <Calendar size={12} />
                                    {customer.invoice_count || 0} فاتورة
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .customer-autocomplete-pro {
                    position: relative;
                    width: 100%;
                }

                .customer-inputs-row {
                    display: flex;
                    gap: 10px;
                }

                .customer-input-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--bg-app);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 0 14px;
                    transition: all 0.2s ease;
                    min-height: 48px;
                }

                .customer-input-group:focus-within {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .customer-input-group.has-value {
                    border-color: var(--accent-green);
                    background: rgba(16, 185, 129, 0.05);
                }

                .customer-input-group .input-icon {
                    color: var(--text-muted);
                    flex-shrink: 0;
                    transition: color 0.2s;
                }

                .customer-input-group:focus-within .input-icon {
                    color: var(--primary-color);
                }

                .customer-input-group.has-value .input-icon {
                    color: var(--accent-green);
                }

                .customer-input-group input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    padding: 14px 0;
                    font-size: 0.95rem;
                    font-weight: 500;
                    outline: none;
                    min-width: 0;
                }

                .customer-input-group input::placeholder {
                    color: var(--text-muted);
                    font-weight: 400;
                }

                /* Suggestions Dropdown */
                .customer-suggestions {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    background: var(--bg-panel);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    max-height: 280px;
                    overflow-y: auto;
                    animation: dropIn 0.2s ease;
                }

                @keyframes dropIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .suggestion-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: right;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-color);
                    transition: all 0.15s;
                }

                .suggestion-card:last-child {
                    border-bottom: none;
                }

                .suggestion-card:hover,
                .suggestion-card.active {
                    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
                }

                .suggestion-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .customer-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                }

                .customer-phone-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .suggestion-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: flex-start;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: var(--accent-green);
                    white-space: nowrap;
                    background: rgba(16, 185, 129, 0.1);
                    padding: 2px 8px;
                    border-radius: 10px;
                }

                .stat svg {
                    opacity: 0.8;
                }

                /* ============================================
                   MOBILE RESPONSIVE STYLES
                   ============================================ */
                @media (max-width: 768px) {
                    .customer-inputs-row {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .customer-input-group {
                        width: 100%;
                        min-height: 52px;
                        padding: 0 16px;
                        border-radius: 14px;
                        gap: 12px;
                    }

                    .customer-input-group .input-icon {
                        width: 20px;
                        height: 20px;
                    }

                    .customer-input-group input {
                        padding: 16px 0;
                        font-size: 1rem;
                    }

                    .customer-suggestions {
                        max-height: 220px;
                        border-radius: 14px;
                    }

                    .suggestion-card {
                        padding: 14px;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }

                    .suggestion-main {
                        gap: 6px;
                    }

                    .customer-name-row {
                        font-size: 1rem;
                    }

                    .customer-phone-row {
                        font-size: 0.85rem;
                    }

                    .suggestion-stats {
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 6px;
                    }

                    .stat {
                        font-size: 0.8rem;
                        padding: 4px 10px;
                    }
                }
            `}</style>
        </div>
    );
};
