import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

import g1 from "@/assets/jasminsuite/room-jasminsuite.webp";
import g2 from "@/assets/jasminsuite/room4-jasminsuite.webp";
import g6 from "@/assets/jasminsuite/toilette-jasminsuite.webp";


export const Route = createFileRoute("/suites/suite-sunrise")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-sunrise"
      mainImage={g1}
      galleryImages={[g1, g2, g6]}
    />
  ),
});