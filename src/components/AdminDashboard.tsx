import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Eye, Shield, TrendingUp, Users, Package, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  nom: string;
  prix: number;
  quantite: string;
  description: string;
  localisation: string;
  image_url: string;
  status: 'en_attente' | 'approuve' | 'rejete';
  created_at: string;
  producteur: {
    nom: string;
    prenom: string;
    whatsapp: string;
    pays: string;
    region: string;
  };
}

interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalProducers: number;
  totalBuyers: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,
    totalProducers: 0,
    totalBuyers: 0
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPendingProducts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch product stats
      const { data: productStats, error: productStatsError } = await supabase
        .from('products')
        .select('status');

      if (productStatsError) throw productStatsError;

      // Fetch user stats
      const { data: userStats, error: userStatsError } = await supabase
        .from('profiles')
        .select('user_type');

      if (userStatsError) throw userStatsError;

      const totalProducts = productStats?.length || 0;
      const pendingProducts = productStats?.filter(p => p.status === 'en_attente').length || 0;
      const approvedProducts = productStats?.filter(p => p.status === 'approuve').length || 0;
      const rejectedProducts = productStats?.filter(p => p.status === 'rejete').length || 0;
      const totalProducers = userStats?.filter(u => u.user_type === 'producteur').length || 0;
      const totalBuyers = userStats?.filter(u => u.user_type === 'acheteur').length || 0;

      setStats({
        totalProducts,
        pendingProducts,
        approvedProducts,
        rejectedProducts,
        totalProducers,
        totalBuyers
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          nom,
          prix,
          quantite,
          description,
          localisation,
          image_url,
          status,
          created_at,
          profiles!products_producteur_id_fkey (
            nom,
            prenom,
            whatsapp,
            pays,
            region
          )
        `)
        .eq('status', 'en_attente')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedProducts = data.map(product => ({
        ...product,
        producteur: product.profiles
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits en attente",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const updateProductStatus = async (productId: string, status: 'approuve' | 'rejete') => {
    setUpdatingProduct(productId);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);

      if (error) {
        throw error;
      }

      toast({
        title: status === 'approuve' ? "Produit approuvé" : "Produit refusé",
        description: `Le produit a été ${status === 'approuve' ? 'approuvé' : 'refusé'} avec succès`,
      });

      // Remove the product from the list and update stats
      setProducts(prev => prev.filter(p => p.id !== productId));
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
    } finally {
      setUpdatingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administration</h2>
          <p className="text-muted-foreground">Gestion de la plateforme AgroConnect</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingProducts}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedProducts} approuvés, {stats.rejectedProducts} refusés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducers + stats.totalBuyers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducers} producteurs, {stats.totalBuyers} acheteurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="validation">
            Validation des produits
            {stats.pendingProducts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingProducts}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Résumé de l'activité sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Produits en attente de validation</p>
                      <p className="text-sm text-muted-foreground">Nécessitent votre attention</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{stats.pendingProducts}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Produits approuvés</p>
                      <p className="text-sm text-muted-foreground">Visibles sur la plateforme</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{stats.approvedProducts}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Utilisateurs actifs</p>
                      <p className="text-sm text-muted-foreground">Producteurs et acheteurs</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{stats.totalProducers + stats.totalBuyers}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Produits en attente d'approbation
                <Badge variant="secondary">{products.length} produit(s)</Badge>
              </CardTitle>
              <CardDescription>
                Examinez et approuvez ou refusez les nouveaux produits soumis par les producteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Chargement des produits...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun produit en attente d'approbation</p>
                  <p className="text-sm">Tous les produits ont été traités ✨</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Producteur</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.nom}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.nom}</p>
                              {product.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {product.description}
                                </p>
                              )}
                              {product.localisation && (
                                <p className="text-xs text-muted-foreground">📍 {product.localisation}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {product.producteur.prenom} {product.producteur.nom}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.producteur.pays}
                                {product.producteur.region && `, ${product.producteur.region}`}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.prix.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell>{product.quantite}</TableCell>
                          <TableCell>
                            {new Date(product.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateProductStatus(product.id, 'approuve')}
                                disabled={updatingProduct === product.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updatingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateProductStatus(product.id, 'rejete')}
                                disabled={updatingProduct === product.id}
                              >
                                {updatingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};