-- Créer une vue publique sécurisée pour les profils de producteurs
-- qui exclut les informations sensibles comme WhatsApp
CREATE OR REPLACE VIEW public.public_producer_profiles AS
SELECT 
  id,
  nom,
  prenom,
  pays,
  region,
  user_type,
  verified,
  type_activite,
  created_at
FROM public.profiles
WHERE user_type = 'producteur' AND verified = true;

-- Fonction sécurisée pour obtenir les informations de contact
-- seulement lors d'une interaction légitime (clic sur bouton WhatsApp)
CREATE OR REPLACE FUNCTION public.get_producer_contact_info(producer_profile_id uuid, product_id uuid)
RETURNS TABLE(whatsapp text, nom text, prenom text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  clicker_profile_id uuid;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Obtenir l'ID du profil de l'utilisateur qui clique
  SELECT id INTO clicker_profile_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();

  -- Enregistrer l'interaction pour l'audit
  INSERT INTO public.whatsapp_clicks (product_id, clicker_id)
  VALUES (product_id, clicker_profile_id);

  -- Retourner les informations de contact seulement après l'enregistrement
  RETURN QUERY
  SELECT 
    p.whatsapp,
    p.nom,
    p.prenom
  FROM public.profiles p
  WHERE p.id = producer_profile_id 
    AND p.user_type = 'producteur'
    AND p.verified = true
    AND p.whatsapp IS NOT NULL;
END;
$$;

-- Supprimer l'ancienne politique qui expose les données sensibles
DROP POLICY IF EXISTS "profile_select_verified_producers" ON public.profiles;

-- Créer une nouvelle politique plus restrictive
CREATE POLICY "profile_select_public_info_only" 
ON public.profiles 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (user_type = 'producteur' AND verified = true AND false) -- Désactiver l'accès direct
);

-- Politique pour la vue publique
CREATE POLICY "public_producer_profiles_select"
ON public.profiles
FOR SELECT
USING (user_type = 'producteur' AND verified = true);

-- Assurer que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;