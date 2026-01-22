import { useState, useEffect } from 'react';
import './index.css';
import { Header } from './components/Header';
import { MobileTabs } from './components/MobileTabs';
import { ProductPanel } from './components/ProductPanel';
import { CartPanel } from './components/CartPanel';
import { QuickAddModal } from './components/QuickAddModal';
import { ManagementModal } from './components/ManagementModal';
import { SalesModal } from './components/SalesModal';
import { Toast } from './components/ui/Toast';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { supabase } from './supabaseClient';
import type { Product } from './types';

function App() {
  const { products, refreshProducts } = useProducts();
  const cart = useCart();

  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setIsToastVisible(true);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2: Focus search (not implemented yet, placeholder)
      if (e.key === 'F2') {
        e.preventDefault();
        showToast('🔍 بحث سريع (قريباً)');
      }

      // F4: Quick Checkout
      if (e.key === 'F4' && cart.items.length > 0) {
        e.preventDefault();
        handleCheckout();
      }

      // Escape: Close all modals
      if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setIsManagementOpen(false);
        setIsSalesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.items.length]);

  // Auto-save cart draft every 30 seconds
  useEffect(() => {
    if (cart.items.length === 0) return;

    const saveInterval = setInterval(() => {
      localStorage.setItem('pos_draft_cart', JSON.stringify({
        items: cart.items,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
        discountValue: cart.discountValue,
        discountType: cart.discountType,
        savedAt: new Date().toISOString()
      }));
    }, 30000); // 30 seconds

    return () => clearInterval(saveInterval);
  }, [cart]);

  // Restore draft on load
  useEffect(() => {
    const draft = localStorage.getItem('pos_draft_cart');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const diffHours = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

        // Only restore if less than 24 hours old
        if (diffHours < 24 && parsed.items.length > 0) {
          // Note: This is informational only, actual restoration would need cart methods
          showToast(
            `💾 لديك مسودة محفوظة (${parsed.items.length} منتج). استخدم F5 لاستعادتها`
          );
        }
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickAddOpen(true);
  };

  // إضافة فورية عند النقر على زر + (كمية = 1)
  const handleQuickAdd = (product: Product) => {
    handleAddToCart(product, 1);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    cart.addToCart(product, quantity);

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Success animation (will be styled in CSS)
    const cartPanel = document.querySelector('.cart-panel');
    if (cartPanel) {
      cartPanel.classList.add('item-added');
      setTimeout(() => cartPanel.classList.remove('item-added'), 600);
    }

    showToast(`تم إضافة ${product.name}`);
  };

  const handleCheckout = async () => {
    try {
      // 1. Create Invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          total_amount: cart.totalAmount,
          discount_amount: cart.discountAmount,
          discount_type: cart.discountType,
          customer_name: cart.customerName || null,
          customer_phone: cart.customerPhone || null
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Create Invoice Items (with gift tracking)
      const invoiceItems = cart.items.map(item => {
        const giftQty = item.gift_quantity || 0;
        const unitPrice = item.sale_price || item.price;

        return {
          invoice_id: invoiceData.id,
          product_id: item.id.length < 10 ? null : item.id,
          product_name: item.name,
          quantity: item.cartQuantity,
          price: unitPrice,
          total: unitPrice * (item.cartQuantity - giftQty), // Only paid items
          is_gift: giftQty > 0,
          gift_reason: giftQty > 0 ? (item.gift_reason || `${giftQty} هدايا`) : null
        };
      });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      showToast('تم حفظ الفاتورة بنجاح!');
      cart.clearCart();
      // Optionally print here
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast('فشل حفظ الفاتورة: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <Header
        onOpenSales={() => setIsSalesOpen(true)}
        onOpenManagement={() => setIsManagementOpen(true)}
      />

      <main className="main-workspace">
        <ProductPanel
          products={products}
          onProductClick={handleProductClick}
          onQuickAdd={handleQuickAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          className={activeTab === 'cart' ? 'hidden' : ''}
        />

        <CartPanel
          cart={cart}
          onCheckout={handleCheckout}
          className={activeTab === 'products' ? 'hidden' : 'active'}
        />
      </main>

      <MobileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cart.totalItems}
      />

      <QuickAddModal
        product={selectedProduct}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onConfirm={handleAddToCart}
      />

      <ManagementModal
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        onSuccess={refreshProducts}
      />

      <SalesModal
        isOpen={isSalesOpen}
        onClose={() => setIsSalesOpen(false)}
      />

      <Toast
        message={toastMsg}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        duration={1500}
      />
    </div>
  );
}

export default App;
