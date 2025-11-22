import BillsLayout from "@/app/bills/components/BillsLayout";
import GuidedSection from "@/components/GuidedSection";
import Navigation from "@/components/Navigation";

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
        <BillsLayout />
      </div>
    </GuidedSection>
  </>
);

export default Page;
