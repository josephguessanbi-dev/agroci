-- Créer des politiques RLS pour que les admins puissent voir et gérer toutes les données

-- Politique pour que les admins puissent voir tous les profils
CREATE POLICY "Admins peuvent voir tous les profils" 
ON public.profiles 
FOR SELECT 
USING (get_user_type() = 'admin');

-- Politique pour que les admins puissent mettre à jour tous les profils
CREATE POLICY "Admins peuvent modifier tous les profils" 
ON public.profiles 
FOR UPDATE 
USING (get_user_type() = 'admin');

-- Politique pour que les admins puissent supprimer tous les profils
CREATE POLICY "Admins peuvent supprimer tous les profils" 
ON public.profiles 
FOR DELETE 
USING (get_user_type() = 'admin');

-- Politique pour que les admins puissent voir tous les produits
CREATE POLICY "Admins peuvent voir tous les produits" 
ON public.products 
FOR SELECT 
USING (get_user_type() = 'admin');

-- Politique pour que les admins puissent modifier tous les produits
CREATE POLICY "Admins peuvent modifier tous les produits" 
ON public.products 
FOR UPDATE 
USING (get_user_type() = 'admin');

-- Politique pour que les admins puissent supprimer tous les produits
CREATE POLICY "Admins peuvent supprimer tous les produits" 
ON public.products 
FOR DELETE 
USING (get_user_type() = 'admin');

-- Ajouter une colonne pour suspendre les comptes utilisateurs
ALTER TABLE public.profiles 
ADD COLUMN suspended BOOLEAN DEFAULT FALSE;

-- Ajouter une colonne pour cacher les produits (sans les supprimer)
ALTER TABLE public.products 
ADD COLUMN hidden BOOLEAN DEFAULT FALSE;

-- Mettre à jour la politique de sélection des produits pour exclure les produits cachés
DROP POLICY IF EXISTS "Tout le monde peut voir les produits approuvés" ON public.products;

CREATE POLICY "Tout le monde peut voir les produits approuvés non cachés" 
ON public.products 
FOR SELECT 
USING (status = 'approuve' AND hidden = FALSE);

-- Les producteurs peuvent toujours voir leurs propres produits même cachés
DROP POLICY IF EXISTS "Les producteurs peuvent voir leurs propres produits" ON public.products;

CREATE POLICY "Les producteurs peuvent voir leurs propres produits" 
ON public.products 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = products.producteur_id) AND (p.user_id = auth.uid()))
));

-- Fonction pour suspendre/réactiver un utilisateur
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(profile_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  current_status BOOLEAN;
  user_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF get_user_type() != 'admin' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Obtenir le statut actuel et le nom de l'utilisateur
  SELECT suspended, (nom || ' ' || prenom) INTO current_status, user_name
  FROM public.profiles 
  WHERE id = profile_id;

  IF NOT FOUND THEN
    RETURN 'Utilisateur non trouvé';
  END IF;

  -- Basculer le statut de suspension
  UPDATE public.profiles 
  SET suspended = NOT current_status
  WHERE id = profile_id;

  IF current_status THEN
    RETURN 'Utilisateur ' || user_name || ' réactivé avec succès';
  ELSE
    RETURN 'Utilisateur ' || user_name || ' suspendu avec succès';
  END IF;
END;
$$;

-- Fonction pour supprimer un utilisateur
CREATE OR REPLACE FUNCTION public.delete_user_account(profile_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_auth_id UUID;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF get_user_type() != 'admin' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Obtenir les informations de l'utilisateur
  SELECT (nom || ' ' || prenom), user_id INTO user_name, user_auth_id
  FROM public.profiles 
  WHERE id = profile_id;

  IF NOT FOUND THEN
    RETURN 'Utilisateur non trouvé';
  END IF;

  -- Supprimer le profil (qui supprimera en cascade grâce aux foreign keys)
  DELETE FROM public.profiles WHERE id = profile_id;

  RETURN 'Utilisateur ' || user_name || ' supprimé avec succès';
END;
$$;

-- Fonction pour cacher/montrer un produit
CREATE OR REPLACE FUNCTION public.toggle_product_visibility(product_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  current_status BOOLEAN;
  product_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF get_user_type() != 'admin' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Obtenir le statut actuel et le nom du produit
  SELECT hidden, nom INTO current_status, product_name
  FROM public.products 
  WHERE id = product_id;

  IF NOT FOUND THEN
    RETURN 'Produit non trouvé';
  END IF;

  -- Basculer la visibilité
  UPDATE public.products 
  SET hidden = NOT current_status
  WHERE id = product_id;

  IF current_status THEN
    RETURN 'Produit ' || product_name || ' rendu visible';
  ELSE
    RETURN 'Produit ' || product_name || ' caché';
  END IF;
END;
$$;