import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Phone } from "lucide-react";

interface Producer {
  nom: string;
  prenom: string;
  whatsapp: string;
}

interface ContactProducerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producer: Producer | null;
  productName: string;
}

export const ContactProducerModal = ({ open, onOpenChange, producer, productName }: ContactProducerModalProps) => {
  const { toast } = useToast();

  const handleWhatsAppContact = () => {
    if (!producer) return;

    const message = encodeURIComponent(
      `Bonjour ${producer.prenom},\n\nJe suis intéressé(e) par votre produit "${productName}" que j'ai vu sur AgroConnect. Pourriez-vous me donner plus d'informations ?\n\nMerci !`
    );
    
    // Format WhatsApp number - ensure it starts with + and remove any extra characters
    let whatsappNumber = producer.whatsapp.replace(/[^\d+]/g, '');
    if (!whatsappNumber.startsWith('+')) {
      whatsappNumber = '+' + whatsappNumber;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Redirection vers WhatsApp",
      description: "Vous allez être redirigé vers WhatsApp pour contacter le producteur.",
    });

    onOpenChange(false);
  };

  if (!producer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contacter le producteur
          </DialogTitle>
          <DialogDescription>
            Prenez contact avec {producer.prenom} {producer.nom} pour en savoir plus sur "{productName}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Informations du producteur</h4>
            <p><strong>Nom :</strong> {producer.prenom} {producer.nom}</p>
            <p><strong>WhatsApp :</strong> {producer.whatsapp}</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contacter via WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};