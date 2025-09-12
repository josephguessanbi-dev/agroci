import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  nom: string;
  prix: number;
  quantite: string;
  description: string;
  localisation: string;
  image_url: string;
}

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const EditProductModal = ({ product, isOpen, onClose, onProductUpdated }: EditProductModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prix: "",
    quantite: "",
    description: "",
    localisation: ""
  });

  const productTypes = [
    "Maïs", "Riz", "Manioc", "Igname", "Tomates", "Oignons",
    "Banane plantain", "Arachide", "Haricot", "Soja", "Cacao", "Café"
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom,
        prix: product.prix.toString(),
        quantite: product.quantite,
        description: product.description || "",
        localisation: product.localisation || ""
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !formData.nom || !formData.prix || !formData.quantite) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          nom: formData.nom,
          prix: parseFloat(formData.prix),
          quantite: formData.quantite,
          description: formData.description,
          localisation: formData.localisation
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Produit modifié",
        description: "Votre produit a été mis à jour avec succès"
      });

      onProductUpdated();
      onClose();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la modification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre produit
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit *</Label>
              <Select 
                value={formData.nom} 
                onValueChange={(value) => handleInputChange('nom', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un produit" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prix">Prix (FCFA/unité) *</Label>
              <Input
                id="prix"
                type="number"
                placeholder="Prix en FCFA"
                value={formData.prix}
                onChange={(e) => handleInputChange('prix', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité disponible *</Label>
              <Input
                id="quantite"
                placeholder="Ex: 50 sacs, 100kg, 20 tonnes..."
                value={formData.quantite}
                onChange={(e) => handleInputChange('quantite', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localisation">Localisation</Label>
              <Input
                id="localisation"
                placeholder="Ville, région..."
                value={formData.localisation}
                onChange={(e) => handleInputChange('localisation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez la qualité, l'origine, les conditions de stockage..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Modifier le produit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};