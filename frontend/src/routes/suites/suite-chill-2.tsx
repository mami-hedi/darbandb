import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

// Importe les images spécifiques à la Suite Azur ici

import g2 from "@/assets/azuresuite/room.webp";
import g4 from "@/assets/azuresuite/lit-double.webp";
import g6 from "@/assets/azuresuite/Toilette.webp";

export const Route = createFileRoute("/suites/suite-chill-2")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-chill-2"
      mainImage={g2}
      galleryImages={[g2, g4, g6]} // Ta sélection d'images pour la galerie
    />
  ),
});