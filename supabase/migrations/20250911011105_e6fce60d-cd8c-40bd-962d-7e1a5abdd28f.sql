-- Function to verify a producer
CREATE OR REPLACE FUNCTION public.verify_producer(profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF get_user_type() != 'admin' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Obtenir le nom de l'utilisateur
  SELECT (nom || ' ' || prenom) INTO user_name
  FROM public.profiles 
  WHERE id = profile_id AND user_type = 'producteur';

  IF NOT FOUND THEN
    RETURN 'Producteur non trouvé';
  END IF;

  -- Vérifier le producteur
  UPDATE public.profiles 
  SET verified = true
  WHERE id = profile_id AND user_type = 'producteur';

  RETURN 'Producteur ' || user_name || ' vérifié avec succès';
END;
$function$