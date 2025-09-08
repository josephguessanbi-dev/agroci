import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Produits Disponibles
          </h1>
          <p className="text-muted-foreground">
            Découvrez tous les produits proposés par nos producteurs vérifiés
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input 
              placeholder="Rechercher un produit..." 
              className="w-full"
            />
          </div>
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catalogue des Produits</CardTitle>
            <CardDescription>
              Explorez notre large sélection de produits agricoles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Les produits apparaîtront ici une fois que des producteurs les auront ajoutés.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Products;