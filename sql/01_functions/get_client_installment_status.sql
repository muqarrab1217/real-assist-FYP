CREATE OR REPLACE FUNCTION public.get_client_installment_status(p_client_id UUID)
RETURNS TABLE (
  next_due_date TIMESTAMP WITH TIME ZONE,
  next_due_amount NUMERIC,
  overdue_count INTEGER,
  overdue_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT due_date FROM public.payments WHERE client_id = p_client_id AND status = 'pending' AND due_date >= CURRENT_DATE ORDER BY due_date ASC LIMIT 1) as next_due_date,
    (SELECT amount FROM public.payments WHERE client_id = p_client_id AND status = 'pending' AND due_date >= CURRENT_DATE ORDER BY due_date ASC LIMIT 1) as next_due_amount,
    (SELECT COUNT(*)::INTEGER FROM public.payments WHERE client_id = p_client_id AND (status = 'overdue' OR (status = 'pending' AND due_date < CURRENT_DATE))) as overdue_count,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = p_client_id AND (status = 'overdue' OR (status = 'pending' AND due_date < CURRENT_DATE))) as overdue_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
