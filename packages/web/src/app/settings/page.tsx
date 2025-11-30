import GuidedSection from "@/components/GuidedSection";
import Navigation from "@/components/Navigation";

const Narrative = () => (
  <>
    <Navigation />
    <GuidedSection
      allowOverflow
      noPadding
      backgroundDark="oklch(21% .006 285.885)"
    >
      <section className="hero relative mb-0 mt-12 lg:mb-40 lg:mt-32 max-w-screen-xl">
        <img src="/terminal.gif" alt="Terminal demo" />
      </section>
    </GuidedSection>
  </>
);

export default Narrative;
