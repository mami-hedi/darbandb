import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

import imgMain from "@/assets/g6.jpeg";
import g1 from "@/assets/g1.jpeg";
import g2 from "@/assets/g2.jpeg";
import g4 from "@/assets/g4.jpeg";

export const Route = createFileRoute("/suites/suite-ambre")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-ambre"
      mainImage={imgMain}
      galleryImages={[g1, g2, g4, imgMain]}
    />
  ),
});