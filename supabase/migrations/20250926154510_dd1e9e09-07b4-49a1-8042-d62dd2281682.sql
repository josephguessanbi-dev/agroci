-- Ajouter des points initiaux pour tous les utilisateurs existants
UPDATE public.profiles 
SET credits = CASE 
  WHEN credits = 0 THEN 10  -- Donner 10 points gratuits aux nouveaux utilisateurs
  ELSE credits 
END;

-- Modifier la fonction handle_new_user pour donner des points initiaux
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nom, prenom, pays, whatsapp, user_type, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'pays', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'acheteur'),
    10  -- Donner 10 points gratuits aux nouveaux utilisateurs
  );
  RETURN NEW;
END;
$function$;

-- Créer une fonction pour déduire des points lors des contacts WhatsApp
CREATE OR REPLACE FUNCTION public.deduct_credits_for_contact(buyer_profile_id uuid, producer_profile_id uuid, product_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  buyer_credits INTEGER;
  buyer_name TEXT;
  producer_name TEXT;
BEGIN
  -- Vérifier les crédits de l'acheteur
  SELECT credits, (nom || ' ' || prenom) INTO buyer_credits, buyer_name
  FROM public.profiles 
  WHERE id = buyer_profile_id;

  IF NOT FOUND THEN
    RETURN 'Acheteur non trouvé';
  END IF;

  -- Vérifier si l'acheteur a assez de crédits
  IF buyer_credits < 1 THEN
    RETURN 'Crédits insuffisants. Vous devez avoir au moins 1 crédit pour contacter un producteur.';
  END IF;

  -- Obtenir le nom du producteur
  SELECT (nom || ' ' || prenom) INTO producer_name
  FROM public.profiles 
  WHERE id = producer_profile_id;

  -- Déduire 1 crédit de l'acheteur
  UPDATE public.profiles 
  SET credits = credits - 1
  WHERE id = buyer_profile_id;

  -- Enregistrer la transaction de déduction
  INSERT INTO public.transactions (
    user_id,
    type_transaction,
    credits_utilises,
    description,
    statut
  ) VALUES (
    buyer_profile_id,
    'contact_producteur',
    1,
    'Contact du producteur ' || producer_name,
    'valide'
  );

  -- Enregistrer le clic WhatsApp
  INSERT INTO public.whatsapp_clicks (product_id, clicker_id)
  VALUES (product_id, buyer_profile_id);

  RETURN 'Contact autorisé. 1 crédit déduit de votre compte.';
END;
$function$;