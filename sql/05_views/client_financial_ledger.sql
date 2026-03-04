-- Financial Ledger View (Backend Aggregation)
CREATE OR REPLACE VIEW public.client_financial_ledger AS
SELECT 
  c.id as client_id,
  c.user_id,
  c.property_id,
  c.investment_amount as total_payable,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id) as scheduled_total,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid') as total_paid,
  (c.investment_amount - (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid')) as remaining_balance,
  (SELECT COUNT(*) FROM public.payments WHERE client_id = c.id AND status = 'paid') as installments_completed,
  (SELECT COUNT(*) FROM public.payments WHERE client_id = c.id AND status IN ('pending', 'overdue')) as installments_pending,
  ROUND(
    ((SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid') / NULLIF(c.investment_amount, 0)) * 100, 
    2
  ) as completion_percentage
FROM public.clients c;
