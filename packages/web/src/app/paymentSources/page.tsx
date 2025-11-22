import GuidedSection from "@/components/GuidedSection";
import Navigation from "@/components/Navigation";
import PaymentSourcesLayout from "./components/PaymentSourcesLayout";

const Page = () => (
  <>
    <Navigation />
    <GuidedSection
      allowOverflow
      noPadding
      backgroundDark="oklch(21% .006 285.885)"
      background="#f6f9fc"
    >
      <div className="min-h-screen">
        <PaymentSourcesLayout />
      </div>
    </GuidedSection>
  </>
);

export default Page;
