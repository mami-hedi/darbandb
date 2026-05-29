import { createFileRoute } from "@tanstack/react-router";
import { SuiteTemplate } from "@/components/site/SuiteTemplate";

import imgMain from "@/assets/g2.jpeg";
import g1 from "@/assets/g1.jpeg";
import g4 from "@/assets/g4.jpeg";
import g6 from "@/assets/g6.jpeg";

export const Route = createFileRoute("/suites/suite-olive")({
  component: () => (
    <SuiteTemplate
      suiteId="suite-olive"
      mainImage={imgMain}
      galleryImages={[g1, g4, imgMain]}
    />
  ),
});