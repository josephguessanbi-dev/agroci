-- Validate FK constraints so PostgREST recognizes relations for embeds
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_requests_buyer_id_fkey' AND NOT convalidated
  ) THEN
    ALTER TABLE public.contact_requests VALIDATE CONSTRAINT contact_requests_buyer_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_requests_producer_id_fkey' AND NOT convalidated
  ) THEN
    ALTER TABLE public.contact_requests VALIDATE CONSTRAINT contact_requests_producer_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_requests_product_id_fkey' AND NOT convalidated
  ) THEN
    ALTER TABLE public.contact_requests VALIDATE CONSTRAINT contact_requests_product_id_fkey;
  END IF;
END $$;