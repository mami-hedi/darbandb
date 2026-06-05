import { createFileRoute } from '@tanstack/react-router'
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

import imgMain from "@/assets/royalesuite/room.webp";
import g1 from "@/assets/royalesuite/room2.webp";
import g2 from "@/assets/royalesuite/toilette.webp";
import g4 from "@/assets/royalesuite/toilette2.webp";
import g3 from "@/assets/royalesuite/dressing.webp";

export const Route = createFileRoute('/suites/suite-royale')({
  component: () => (
    <SuiteTemplate
      suiteId="suite-royale"
      mainImage={g1}
      galleryImages={[g1, g2, g4, g3, imgMain]}
    />
  ),
});