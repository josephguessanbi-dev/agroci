import cornIcon from "@/assets/corn-real.jpg";
import riceIcon from "@/assets/rice-real.jpg";
import cassavaIcon from "@/assets/cassava-real.jpg";
import yamIcon from "@/assets/yam-real.jpg";
import tomatoIcon from "@/assets/tomato-real.jpg";
import onionIcon from "@/assets/onion-real.jpg";
import plantainIcon from "@/assets/plantain-real.jpg";
import peasIcon from "@/assets/peas-real.jpg";
import sweetPotatoIcon from "@/assets/sweet-potato-real.jpg";
import cabbageIcon from "@/assets/cabbage-real.jpg";

const products = [
  { name: "Maïs", icon: cornIcon, description: "Grains de qualité premium" },
  { name: "Riz", icon: riceIcon, description: "Variétés locales et importées" },
  { name: "Manioc", icon: cassavaIcon, description: "Tubercules frais" },
  { name: "Igname", icon: yamIcon, description: "Tubercules de première qualité" },
  { name: "Tomates", icon: tomatoIcon, description: "Fraîches et savoureuses" },
  { name: "Oignons", icon: onionIcon, description: "Calibres variés" },
  { name: "Banane plantain", icon: plantainIcon, description: "Fruits verts de qualité" },
  { name: "Petits pois", icon: peasIcon, description: "Légumineuses fraîches" },
  { name: "Patate douce", icon: sweetPotatoIcon, description: "Tubercules sucrés" },
  { name: "Chou", icon: cabbageIcon, description: "Légumes verts frais" },
];

export const PopularProducts = () => {
  return (
    <section id="produits" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produits Populaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de produits vivriers les plus demandés, 
            directement des producteurs locaux vérifiés.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-card rounded-xl p-6 text-center hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="mb-4">
                <img
                  src={product.icon}
                  alt={`Icône ${product.name}`}
                  className="w-16 h-16 mx-auto rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};