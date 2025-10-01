import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

interface ContactRequest {
  id: string;
  producer_id: string;
  product_id: string;
  status: string;
  message: string | null;
  created_at: string;
  producer_profile: {
    nom: string;
    prenom: string;
    whatsapp: string;
    pays: string;
    region: string | null;
  };
  product: {
    nom: string;
    image_url: string | null;
  };
}

export const BuyerContactRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          producer_profile:profiles!contact_requests_producer_id_fkey(nom, prenom, whatsapp, pays, region),
          product:products(nom, image_url)
        `)
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleWhatsAppContact = (request: ContactRequest) => {
    const producer = request.producer_profile;
    
    // Format WhatsApp number
    let whatsappNumber = producer.whatsapp.replace(/[^\d+]/g, '');
    if (!whatsappNumber.startsWith('+')) {
      whatsappNumber = '+' + whatsappNumber;
    }

    // Generate WhatsApp message
    const message = encodeURIComponent(
      `Bonjour ${producer.prenom} ${producer.nom},\n\nJe suis intéressé(e) par votre produit "${request.product.nom}" sur AgroConnect. Pouvons-nous en discuter ?\n\nMerci !`
    );

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'acceptee':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'refusee':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mes demandes de contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mes demandes de contact
        </CardTitle>
        <CardDescription>
          Suivez vos demandes et contactez les producteurs qui ont accepté
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Vous n'avez envoyé aucune demande de contact
          </p>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {request.product.image_url && (
                    <img 
                      src={request.product.image_url} 
                      alt={request.product.nom}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {request.producer_profile.prenom} {request.producer_profile.nom}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.producer_profile.pays}
                          {request.producer_profile.region && `, ${request.producer_profile.region}`}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Produit:</strong> {request.product.nom}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Demandé le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    
                    {request.status === 'acceptee' && (
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-sm text-green-800 mb-2">
                            ✅ Le producteur a accepté votre demande ! Vous pouvez maintenant le contacter.
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>WhatsApp:</strong> {request.producer_profile.whatsapp}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleWhatsAppContact(request)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contacter sur WhatsApp
                        </Button>
                      </div>
                    )}
                    
                    {request.status === 'en_attente' && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⏳ En attente de la réponse du producteur
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'refusee' && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <p className="text-sm text-red-800">
                          ❌ Le producteur a refusé cette demande
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
