import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  nom: string;
  prenom: string;
  pays: string;
  region: string;
  whatsapp: string;
  type_activite: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }: EditProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    pays: "",
    region: "",
    whatsapp: "",
    type_activite: ""
  });

  const countries = [
    "Côte d'Ivoire", "Mali", "Burkina Faso", "Niger", "Sénégal", "Ghana", "Togo", "Bénin"
  ];

  const activityTypes = [
    "Agriculture céréalière", "Maraîchage", "Arboriculture", "Élevage", 
    "Agriculture mixte", "Transformation agroalimentaire", "Commerce agricole"
  ];

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        nom: data.nom || "",
        prenom: data.prenom || "",
        pays: data.pays || "",
        region: data.region || "",
        whatsapp: data.whatsapp || "",
        type_activite: data.type_activite || ""
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !formData.nom || !formData.prenom || !formData.pays || !formData.whatsapp) {
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
        .from('profiles')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          pays: formData.pays,
          region: formData.region,
          whatsapp: formData.whatsapp,
          type_activite: formData.type_activite
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profil modifié",
        description: "Votre profil a été mis à jour avec succès"
      });

      onProfileUpdated();
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
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>
            Modifiez vos informations personnelles
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pays">Pays *</Label>
              <Select 
                value={formData.pays} 
                onValueChange={(value) => handleInputChange('pays', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Région</Label>
              <Input
                id="region"
                placeholder="Votre région"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                placeholder="+225 XX XX XX XX XX"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_activite">Type d'activité</Label>
              <Select 
                value={formData.type_activite} 
                onValueChange={(value) => handleInputChange('type_activite', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une activité" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(activity => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                'Modifier le profil'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};