-- Fix transactions.type_transaction allowed values
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_transaction_check;

-- Allow all values used by the app and edge functions
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_type_transaction_check
CHECK (type_transaction IN ('achat_abonnement', 'contact_producteur', 'achat_credits'));
