import {
  CiBank as ConnectInstitutionsIcon,
  CiVault as VaultIcon,
} from "react-icons/ci";
import { MdOutlineArticle as PlanIcon } from "react-icons/md";
import { TbSchool as LearnIcon } from "react-icons/tb";

import CallToAction from "@/components/CallToAction";
import SectionHeader from "@/components/SectionHeader";
import Code from "./Code";

const Examples = () => (
  <div className="grid gap-y-16">
    <section className="">
      <div
        id="column-layout"
        className={`grid gap-y-8 gap-x-8 items-start md:grid-cols-[repeat(2,1fr)]`}
      >
        <div className="grid grid-cols-1 gap-y-12 place-items-center">
          <header className="px-8 grid gap-y-4 max-w-[810px]">
            <SectionHeader
              title="Smarter budgeting for couples - fun for makers"
              byline="Fin is extendable. Build the experience you want from a budgeting app."
            />
          </header>
        </div>
        <div className="grid grid-cols-1 gap-y-12 items-start place-items-center md:pr-4">
          <Code />
        </div>
      </div>
    </section>
    <section className="grid sm:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(4,1fr)] gap-y-12">
      <div className="grid gap-y-2 ml-4">
        <PlanIcon color="white" size="36"></PlanIcon>
        <h2 className="text-xl font-semibold relative tracking-[-0.05em] text-white">
          Budget
        </h2>
        <p className="tracking-[0.2px] text-[#adbdcc]">
          Create and customize your budget plans to fit your life.
        </p>
        <CallToAction
          justify="justify-start"
          includeArrow
          excludeLeftPadding
          href="/plan"
          title="Create plan"
          dataTestId="create-plan"
          color="text-[#adbdcc]"
          darkColor="text-[#adbdcc]"
        />
      </div>
      <div className="grid gap-y-2 ml-4">
        <ConnectInstitutionsIcon
          color="white"
          size="36"
        ></ConnectInstitutionsIcon>
        <h2 className="text-xl font-semibold relative tracking-[-0.05em] text-white">
          Connect Your Institutions
        </h2>
        <p className="tracking-[0.2px] text-[#adbdcc]">
          Securely connect your accounts to see your full financial picture.
        </p>
        <CallToAction
          justify="justify-start"
          includeArrow
          excludeLeftPadding
          href="/institutions"
          title="Connect bank"
          dataTestId="connect-bank"
          color="text-[#adbdcc]"
          darkColor="text-[#adbdcc]"
        />
      </div>
      <div className="grid gap-y-2 ml-4">
        <VaultIcon color="white" size="36"></VaultIcon>
        <h2 className="text-xl font-semibold relative tracking-[-0.05em] text-white">
          Family Vault
        </h2>
        <p className="tracking-[0.2px] text-[#adbdcc]">
          Securely share accounts with family members and manage finances
          together.
        </p>
        <CallToAction
          justify="justify-start"
          includeArrow
          excludeLeftPadding
          href="/vault"
          title="Add collaborator"
          dataTestId="view-developer-workbench"
          color="text-[#adbdcc]"
          darkColor="text-[#adbdcc]"
        />
      </div>
      <div className="grid gap-y-2 ml-4">
        <LearnIcon color="white" size="36"></LearnIcon>
        <h2 className="text-xl font-semibold relative tracking-[-0.05em] text-white">
          Learn to Budget
        </h2>
        <p className="tracking-[0.2px] text-[#adbdcc]">
          Learn everything from budgeting basics to advanced strategies with
          our resources.
        </p>
        <CallToAction
          justify="justify-start"
          includeArrow
          excludeLeftPadding
          href="https://github.com/walkerrandolphsmith/desgin-patterns"
          title="Explore examples"
          dataTestId="browse-hugging-face"
          color="text-[#adbdcc]"
          darkColor="text-[#adbdcc]"
        />
      </div>
    </section>
  </div>
);

export default Examples;
