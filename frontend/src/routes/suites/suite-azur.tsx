import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

// Importe les images spécifiques à la Suite Azur ici
import imgMain from "@/assets/g1.jpeg";
import g2 from "@/assets/g2.jpeg";
import g4 from "@/assets/g4.jpeg";
import g6 from "@/assets/g6.jpeg";

export const Route = createFileRoute("/suites/suite-azur")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-azur"
      mainImage={imgMain}
      galleryImages={[g2, g4, g6, imgMain]} // Ta sélection d'images pour la galerie
    />
  ),
});