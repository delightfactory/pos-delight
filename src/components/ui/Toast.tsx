
import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 1500 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <>
            <div className={`toast-pro ${isVisible ? 'visible' : ''}`}>
                <CheckCircle size={18} className="toast-icon" />
                <span className="toast-message">{message}</span>
            </div>

            <style>{`
                .toast-pro {
                    position: fixed;
                    bottom: 90px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 9999;
                    pointer-events: none;
                }

                .toast-pro.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                }

                .toast-icon {
                    flex-shrink: 0;
                }

                .toast-message {
                    white-space: nowrap;
                }

                @media (max-width: 768px) {
                    .toast-pro {
                        bottom: 120px;
                        max-width: 90%;
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </>
    );
};
