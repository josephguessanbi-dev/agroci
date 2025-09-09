import { Menu, Phone, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user!.id)
        .single();

      if (!error && data?.user_type === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleHomeClick = () => {
    console.log('Clic sur le bouton d\'accueil');
    navigate('/');
  };

  return (
    <header className="bg-background border-b shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleHomeClick} className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              AgroConnect
            </button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => {
                console.log('Clic sur le bouton d\'accueil dans nav');
                navigate('/');
              }} 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Accueil
            </button>
            <button 
              onClick={() => {
                console.log('Clic sur Produits');
                navigate('/products');
              }} 
              className="text-foreground hover:text-primary transition-colors"
            >
              Produits
            </button>
            <button 
              onClick={() => {
                console.log('Clic sur Producteurs');
                navigate('/producers');
              }} 
              className="text-foreground hover:text-primary transition-colors"
            >
              Producteurs
            </button>
            <button 
              onClick={() => {
                console.log('Clic sur Acheteurs');
                navigate('/buyers');
              }} 
              className="text-foreground hover:text-primary transition-colors"
            >
              Acheteurs
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+225 0789363442</span>
            </div>
            
            {loading ? (
              <div className="flex space-x-2">
                <div className="w-16 h-8 bg-muted rounded animate-pulse" />
                <div className="w-20 h-8 bg-muted rounded animate-pulse" />
              </div>
            ) : user ? (
              <DropdownMenu modal={false} onOpenChange={(open) => console.log('Dropdown open state:', open)}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Mon compte</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 z-[100] bg-popover border shadow-lg"
                  sideOffset={8}
                >
                  <DropdownMenuItem 
                    onClick={(e) => {
                      console.log('Dashboard clicked');
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        console.log('Admin clicked');
                        e.preventDefault();
                        navigate('/admin');
                      }}
                      className="cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Administration</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      console.log('Logout clicked');
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Bouton Connexion cliqué');
                    navigate('/auth');
                  }}
                >
                  Connexion
                </Button>
                <Button 
                  variant="accent" 
                  size="sm" 
                  onClick={() => {
                    console.log('Bouton Inscription cliqué');
                    navigate('/auth');
                  }}
                >
                  Inscription
                </Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};