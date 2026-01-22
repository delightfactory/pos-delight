-- Migration: نظام تتبع العملاء الاحترافي
-- Schema: pos
-- الهدف: تتبع تلقائي للعملاء من الفواتير مع Auto-sync

-- 1. إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS pos.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  total_purchases NUMERIC DEFAULT 0,
  invoice_count INTEGER DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE pos.customers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "POS: Allow read customers" 
  ON pos.customers FOR SELECT 
  USING (true);

CREATE POLICY "POS: Allow insert customers" 
  ON pos.customers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "POS: Allow update customers" 
  ON pos.customers FOR UPDATE 
  USING (true);

-- 4. Function لتحديث بيانات العميل تلقائياً من الفواتير
CREATE OR REPLACE FUNCTION pos.sync_customer_from_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث أو إنشاء سجل العميل فقط إذا كان رقم الهاتف موجود
  IF NEW.customer_phone IS NOT NULL AND NEW.customer_phone != '' THEN
    INSERT INTO pos.customers (name, phone, total_purchases, invoice_count, last_purchase_date)
    VALUES (
      COALESCE(NEW.customer_name, 'عميل'),
      NEW.customer_phone,
      NEW.total_amount,
      1,
      NEW.created_at
    )
    ON CONFLICT (phone) DO UPDATE SET
      -- تحديث الاسم فقط إذا كان الاسم الجديد غير فارغ
      name = CASE 
        WHEN NEW.customer_name IS NOT NULL AND NEW.customer_name != '' 
        THEN NEW.customer_name 
        ELSE pos.customers.name 
      END,
      total_purchases = pos.customers.total_purchases + NEW.total_amount,
      invoice_count = pos.customers.invoice_count + 1,
      last_purchase_date = NEW.created_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger للتنفيذ التلقائي بعد إضافة فاتورة
DROP TRIGGER IF EXISTS sync_customer_after_invoice ON pos.invoices;

CREATE TRIGGER sync_customer_after_invoice
AFTER INSERT ON pos.invoices
FOR EACH ROW
EXECUTE FUNCTION pos.sync_customer_from_invoice();

-- 6. Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_customers_phone ON pos.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON pos.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON pos.customers(last_purchase_date DESC);

-- 7. View لأفضل العملاء
CREATE OR REPLACE VIEW pos.top_customers AS
SELECT
  id,
  name,
  phone,
  total_purchases,
  invoice_count,
  last_purchase_date,
  ROUND(total_purchases / NULLIF(invoice_count, 0), 2) as avg_purchase
FROM pos.customers
WHERE invoice_count > 0
ORDER BY total_purchases DESC
LIMIT 20;

-- 8. تعليقات
COMMENT ON TABLE pos.customers IS 'جدول العملاء مع التحديث التلقائي من الفواتير';
COMMENT ON COLUMN pos.customers.total_purchases IS 'إجمالي قيمة مشتريات العميل';
COMMENT ON COLUMN pos.customers.invoice_count IS 'عدد الفواتير';
COMMENT ON COLUMN pos.customers.last_purchase_date IS 'تاريخ آخر عملية شراء';
