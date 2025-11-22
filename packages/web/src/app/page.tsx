import Hero from "@/app/home/components/Hero";
import GuidedSection from "@/components/GuidedSection";

const Narrative = () => (
  <>
    <GuidedSection
      noMarginOffset
      allowOverflow
      noPadding
      backgroundDark="oklch(21% .006 285.885)"
    >
      <Hero />
    </GuidedSection>
  </>
);

export default Narrative;
