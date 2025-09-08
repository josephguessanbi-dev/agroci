-- Créer le bucket pour les images de produits s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques pour le bucket product-images
DO $$
BEGIN
    -- Politique pour voir les images (public)
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'product-images' 
        AND name = 'Public access to product images'
    ) THEN
        CREATE POLICY "Public access to product images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;

    -- Politique pour uploader des images (utilisateurs authentifiés seulement)
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'product-images' 
        AND name = 'Authenticated users can upload product images'
    ) THEN
        CREATE POLICY "Authenticated users can upload product images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'product-images' 
            AND auth.role() = 'authenticated'
        );
    END IF;

    -- Politique pour supprimer ses propres images
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'product-images' 
        AND name = 'Users can delete their own product images'
    ) THEN
        CREATE POLICY "Users can delete their own product images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'product-images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;