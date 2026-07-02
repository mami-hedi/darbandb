import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

import imgMain from "@/assets/olivesuite/Balacony-oliviersuite.webp";
import g1 from "@/assets/olivesuite/room-olivesuite.webp";
import g4 from "@/assets/olivesuite/room-view-olivesuite.webp";
import g6 from "@/assets/olivesuite/Toilette-olivesuite.webp";

export const Route = createFileRoute("/suites/suite-chill-1")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-chill-1"
      mainImage={g4}
      galleryImages={[g4, g1, imgMain, g6]}
    />
  ),
});