import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Définition du type de contexte
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Le Provider qui enveloppe ton application
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // On force directement à TRUE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  // On force directement à FALSE (pas de chargement)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // On s'assure que même après le montage, l'état reste connecté et dispo
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const login = () => {
    // Optionnel en mode "toujours connecté", mais on le garde pour éviter les erreurs
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Si vous cliquez sur déconnexion, on simule juste une action vide 
    // ou vous pouvez le laisser pour pouvoir tester le logout
    console.log("Logout cliqué (désactivé temporairement)");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook personnalisé
export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth doit être utilisé à l\'intérieur d\'un AdminAuthProvider');
  }
  return context;
};