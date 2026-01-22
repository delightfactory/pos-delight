-- Migration: إضافة نظام تتبع الهدايا والخصومات
-- Schema: pos
-- الهدف: تتبع دقيق للهدايا والخصومات لحسابات الإيرادات الصحيحة

-- 1. إضافة حقول الهدايا والخصومات في invoice_items
ALTER TABLE pos.invoice_items 
ADD COLUMN IF NOT EXISTS is_gift BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gift_reason TEXT,
ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- 2. إضافة حقول التتبع في invoices
ALTER TABLE pos.invoices
ADD COLUMN IF NOT EXISTS total_gifts_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_discounts_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- 3. Function لحساب قيم الهدايا وال خصومات تلقائياً
CREATE OR REPLACE FUNCTION pos.calculate_invoice_adjustments()
RETURNS TRIGGER AS $$
DECLARE
    v_total_gifts NUMERIC;
BEGIN
    -- حساب إجمالي قيمة الهدايا
    SELECT COALESCE(SUM(total), 0)
    INTO v_total_gifts
    FROM pos.invoice_items
    WHERE invoice_id = NEW.invoice_id 
    AND is_gift = TRUE;

    -- تحديث الفاتورة
    UPDATE pos.invoices
    SET 
        total_gifts_value = v_total_gifts,
        total_discounts_value = discount_amount
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for automatic calculation
DROP TRIGGER IF EXISTS update_invoice_adjustments ON pos.invoice_items;

CREATE TRIGGER update_invoice_adjustments
AFTER INSERT OR UPDATE ON pos.invoice_items
FOR EACH ROW
EXECUTE FUNCTION pos.calculate_invoice_adjustments();

-- 5. View لعرض الإيرادات الصافية
CREATE OR REPLACE VIEW pos.revenue_analysis AS
SELECT
    i.id,
    i.created_at,
    i.total_amount as gross_sales,
    i.total_gifts_value as gifts,
    i.total_discounts_value as discounts,
    (i.total_amount - COALESCE(i.total_gifts_value, 0) - COALESCE(i.total_discounts_value, 0)) as net_revenue,
    i.customer_name,
    i.customer_phone
FROM pos.invoices i
ORDER BY i.created_at DESC;

-- 6. تعليق على الحقول الجديدة
COMMENT ON COLUMN pos.invoice_items.is_gift IS 'تحديد المنتج كهدية (قيمته لا تُحتسب في صافي الإيرادات)';
COMMENT ON COLUMN pos.invoice_items.gift_reason IS 'سبب تقديم المنتج كهدية';
COMMENT ON COLUMN pos.invoice_items.discount_reason IS 'سبب الخصم الممنوح على هذا المنتج';
COMMENT ON COLUMN pos.invoices.total_gifts_value IS 'إجمالي قيمة الهدايا في الفاتورة';
COMMENT ON COLUMN pos.invoices.total_discounts_value IS 'إجمالي قيمة الخصومات في الفاتورة';
