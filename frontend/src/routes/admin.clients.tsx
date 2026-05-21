import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/clients')({
  // Aucune logique de composant ici, le routeur va chercher le fichier .lazy.tsx compagnon
});