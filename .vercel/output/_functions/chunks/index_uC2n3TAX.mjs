import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { n as createRenderInstruction, l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, o as Fragment } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const rawDeals = /* #__PURE__ */ JSON.parse("[{\"company\":\"NearPod\",\"vehicle\":\"NewSchools Venture Fund\",\"countries\":\"US/Brazil\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2012,\"costOfInvestment\":300000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"81x\",\"relevantValuation\":650000000,\"tags\":[\"Dragon\"]},{\"company\":\"Sano\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Medical Device\",\"initialInvestmentDate\":2012,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"2x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Plethora\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Industrial Manufacturing, Advanced Manufacturing\",\"initialInvestmentDate\":2013,\"costOfInvestment\":25000,\"stage\":\"Pre-Seed\",\"exit\":\"Recapped\",\"multiple\":\"0.2x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Clever\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Edtech, Integration Platform\",\"initialInvestmentDate\":2012,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"10x\",\"relevantValuation\":null,\"tags\":[\"Dragon\"]},{\"company\":\"Udemy\",\"vehicle\":\"Learn Capital II\",\"countries\":\"US/Turkey\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2012,\"costOfInvestment\":1500000,\"stage\":\"Seed\",\"exit\":\"IPO\",\"multiple\":\"67x\",\"relevantValuation\":null,\"tags\":[\"IPO\",\"Unicorn\"]},{\"company\":\"BRCK\",\"vehicle\":\"Angel\",\"countries\":\"Kenya\",\"sector\":\"Edge Hardware\",\"initialInvestmentDate\":2014,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1.5x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Cobalt\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Private Markets Platform, Data as a Service\",\"initialInvestmentDate\":2013,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"1.4x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"ClassDojo\",\"vehicle\":\"Learn Capital II\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2013,\"costOfInvestment\":250000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"14x\",\"relevantValuation\":1100000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Coursera\",\"vehicle\":\"Learn Capital SPV\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2013,\"costOfInvestment\":15000000,\"stage\":\"Series B\",\"exit\":\"IPO\",\"multiple\":\"9x\",\"relevantValuation\":null,\"tags\":[\"IPO\",\"Unicorn\"]},{\"company\":\"Andela\",\"vehicle\":\"Angel\",\"countries\":\"US/Nigeria\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2014,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"23x\",\"relevantValuation\":null,\"tags\":[\"Unicorn\"]},{\"company\":\"Andela\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US/Nigeria\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2014,\"costOfInvestment\":3000000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"8x\",\"relevantValuation\":null,\"tags\":[\"Unicorn\"]},{\"company\":\"Disruption Corporation\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Fundraising Platform\",\"initialInvestmentDate\":2014,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"0.5x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"HipCamp\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Marketplace\",\"initialInvestmentDate\":2014,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"12x\",\"relevantValuation\":300000000,\"tags\":[\"Dragon\"]},{\"company\":\"Brainly\",\"vehicle\":\"Learn Capital III\",\"countries\":\"Poland\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2014,\"costOfInvestment\":2000000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"3x\",\"relevantValuation\":260000000,\"tags\":[]},{\"company\":\"Jibu\",\"vehicle\":\"Angel\",\"countries\":\"Kenya\",\"sector\":\"Water Distribution\",\"initialInvestmentDate\":2014,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"KidAdmit\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2014,\"costOfInvestment\":100000,\"stage\":\"Pre-Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Brilliant.org\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2015,\"costOfInvestment\":6000000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"5.8x\",\"relevantValuation\":1000000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Maker's Row\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Network Marketplace, Advanced Manufacturing\",\"initialInvestmentDate\":2015,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"2.5x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Standard Cyborg\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"3D Data\",\"initialInvestmentDate\":2015,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"SoloLearn\",\"vehicle\":\"Learn Capital III\",\"countries\":\"Armenia\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2015,\"costOfInvestment\":750000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1.15x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Ontra\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"LegalTech, Legal AI Wrapper\",\"initialInvestmentDate\":2015,\"costOfInvestment\":5000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"17x\",\"relevantValuation\":800000000,\"tags\":[\"Dragon\"]},{\"company\":\"Willing\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"LegalTech\",\"initialInvestmentDate\":2015,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Village Market\",\"vehicle\":\"Angel\",\"countries\":\"UK\",\"sector\":\"Marketplace\",\"initialInvestmentDate\":2015,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Trusted\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Childcare\",\"initialInvestmentDate\":2015,\"costOfInvestment\":2500,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"2x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"VIPKid\",\"vehicle\":\"Learn Capital III\",\"countries\":\"China\",\"sector\":\"EdTech\",\"initialInvestmentDate\":2016,\"costOfInvestment\":6000000,\"stage\":\"Series B\",\"exit\":\"FMV\",\"multiple\":\"4x\",\"relevantValuation\":null,\"tags\":[\"Unicorn (then Down Round)\"]},{\"company\":\"Binti\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"GovTech, Childcare\",\"initialInvestmentDate\":2016,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"5x\",\"relevantValuation\":null,\"tags\":[\"Dragon\"]},{\"company\":\"Bitty Foods\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"CPG Food\",\"initialInvestmentDate\":2016,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Photomath\",\"vehicle\":\"Learn Capital III\",\"countries\":\"Croatia\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2016,\"costOfInvestment\":3000000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"27x\",\"relevantValuation\":500000000,\"tags\":[\"Dragon\"]},{\"company\":\"Wish\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"USA\",\"sector\":\"E-commerce\",\"initialInvestmentDate\":2015,\"costOfInvestment\":14150000,\"stage\":\"Series E\",\"exit\":\"IPO\",\"multiple\":\"2x\",\"relevantValuation\":null,\"tags\":[\"Unicorn\"]},{\"company\":\"Vroom\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"US\",\"sector\":\"Mobility\",\"initialInvestmentDate\":2015,\"costOfInvestment\":750000,\"stage\":\"Series C\",\"exit\":\"IPO\",\"multiple\":\"7x\",\"relevantValuation\":null,\"tags\":[\"IPO\",\"Exit\",\"Unicorn\"]},{\"company\":\"Coupang\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"Korea\",\"sector\":\"E-commerce\",\"initialInvestmentDate\":2016,\"costOfInvestment\":25000000,\"stage\":\"Series D\",\"exit\":\"IPO\",\"multiple\":\"5x\",\"relevantValuation\":60000000000,\"tags\":[\"IPO\",\"Unicorn\"]},{\"company\":\"Careem\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"UAE\",\"sector\":\"Mobility\",\"initialInvestmentDate\":2016,\"costOfInvestment\":5000000,\"stage\":\"Series D\",\"exit\":\"Acquired\",\"multiple\":\"3x\",\"relevantValuation\":2300000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Vessel Health\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Medical Device, MedTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":500000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Coral Vita\",\"vehicle\":\"Syndicate\",\"countries\":\"US\",\"sector\":\"OceanTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":2000000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"2.6x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Compass\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Business Analytics\",\"initialInvestmentDate\":2017,\"costOfInvestment\":10000,\"stage\":\"Bridge\",\"exit\":\"Acquired\",\"multiple\":\"3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Minerva\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2015,\"costOfInvestment\":5000000,\"stage\":\"Series B\",\"exit\":\"FMV\",\"multiple\":\"4.3x\",\"relevantValuation\":750000000,\"tags\":[]},{\"company\":\"Ligandal\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"BioTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":25000,\"stage\":\"Pre-Seed\",\"exit\":\"MtM\",\"multiple\":\"2x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Explorer Surgical\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"MedTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"Acquired\",\"multiple\":\"3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Maven Clinic\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"MedTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"8x\",\"relevantValuation\":1300000000,\"tags\":[\"Unicorn\"]},{\"company\":\"CottageClass\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":50000,\"stage\":\"Pre-Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Outschool\",\"vehicle\":\"Learn Capital III\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":50000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"88x\",\"relevantValuation\":null,\"tags\":[\"Unicorn\"]},{\"company\":\"Hack Reactor\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":25000,\"stage\":\"Seed\",\"exit\":\"Acquired\",\"multiple\":\"1.3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Pinch\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"FinTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":25000,\"stage\":\"Pre-Seed\",\"exit\":\"Acquired\",\"multiple\":\"4x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Henry the Dentist\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"MedTech\",\"initialInvestmentDate\":2017,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"Acquired\",\"multiple\":\"6x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Varsity Tutors\",\"vehicle\":\"Learn Capital SPV\",\"countries\":\"US\",\"sector\":\"EdTech\",\"initialInvestmentDate\":2018,\"costOfInvestment\":5000000,\"stage\":\"Series C\",\"exit\":\"IPO, SPAC\",\"multiple\":\"4x\",\"relevantValuation\":null,\"tags\":[\"IPO\",\"Unicorn\"]},{\"company\":\"Bold Health\",\"vehicle\":\"LearnStart I\",\"countries\":\"UK\",\"sector\":\"Digital Therapeutics\",\"initialInvestmentDate\":2018,\"costOfInvestment\":50000,\"stage\":\"Pre-Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Sana Labs\",\"vehicle\":\"LearnStart I\",\"countries\":\"Sweden\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2018,\"costOfInvestment\":100000,\"stage\":\"Pre-Seed\",\"exit\":\"Acquired\",\"multiple\":\"8x\",\"relevantValuation\":1200000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Osmosis\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2018,\"costOfInvestment\":1000000,\"stage\":\"Pre-Seed\",\"exit\":\"Acquired\",\"multiple\":\"6x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Bedu\",\"vehicle\":\"LearnStart I\",\"countries\":\"Mexico\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2018,\"costOfInvestment\":500000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"1.2x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"WonderSchool\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Edtech, Childcare\",\"initialInvestmentDate\":2018,\"costOfInvestment\":800000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"8x\",\"relevantValuation\":350000000,\"tags\":[]},{\"company\":\"Podium Education\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2018,\"costOfInvestment\":1000000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"18x\",\"relevantValuation\":400000000,\"tags\":[\"Dragon\"]},{\"company\":\"Equal Play\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Childcare\",\"initialInvestmentDate\":2019,\"costOfInvestment\":15000,\"stage\":\"Pre-Seed\",\"exit\":\"Write-Off\",\"multiple\":\"0x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"SpotHero\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"US\",\"sector\":\"Mobility\",\"initialInvestmentDate\":2019,\"costOfInvestment\":2000000,\"stage\":\"Series C\",\"exit\":\"FMV\",\"multiple\":\"3x\",\"relevantValuation\":500000000,\"tags\":[]},{\"company\":\"Gecko Robotics\",\"vehicle\":\"Alpha Partners II\",\"countries\":\"US\",\"sector\":\"Industrial Drones\",\"initialInvestmentDate\":2019,\"costOfInvestment\":3000000,\"stage\":\"Series C\",\"exit\":\"FMV\",\"multiple\":\"2x\",\"relevantValuation\":500000000,\"tags\":[]},{\"company\":\"Prenda\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2019,\"costOfInvestment\":400000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"6x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"CreatorUp\",\"vehicle\":\"LearnStart I\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2019,\"costOfInvestment\":600000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Chime\",\"vehicle\":\"Acquired Angel Investment\",\"countries\":\"US\",\"sector\":\"FinTech\",\"initialInvestmentDate\":2020,\"costOfInvestment\":40000,\"stage\":\"Series D\",\"exit\":\"IPO\",\"multiple\":\"2x\",\"relevantValuation\":11600000000,\"tags\":[\"IPO\",\"Unicorn\"]},{\"company\":\"TeachMint\",\"vehicle\":\"Learn Capital IV\",\"countries\":\"India\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2020,\"costOfInvestment\":4000000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"2.8x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"NovaKid\",\"vehicle\":\"LearnStart I\",\"countries\":\"Poland\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2020,\"costOfInvestment\":250000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Avela\",\"vehicle\":\"LearnStart II\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2022,\"costOfInvestment\":100000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"2.3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Shikho\",\"vehicle\":\"LearnStart II\",\"countries\":\"Bangladesh\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2020,\"costOfInvestment\":100000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"24x\",\"relevantValuation\":null,\"tags\":[\"Dragon\"]},{\"company\":\"Copper Banking\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"FinTech\",\"initialInvestmentDate\":2021,\"costOfInvestment\":50000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"6x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Yassir\",\"vehicle\":\"Angel\",\"countries\":\"Algeria\",\"sector\":\"Mobility, Super App\",\"initialInvestmentDate\":2021,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"4x\",\"relevantValuation\":null,\"tags\":[\"Unicorn\"]},{\"company\":\"Allocate\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Private Markets Marketplace, Marketplace, Data Platform, Data as a Service\",\"initialInvestmentDate\":2021,\"costOfInvestment\":10000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"4x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Trela\",\"vehicle\":\"Angel\",\"countries\":\"Brazil\",\"sector\":\"E-commerce\",\"initialInvestmentDate\":2021,\"costOfInvestment\":10000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"9x\",\"relevantValuation\":90000000,\"tags\":[]},{\"company\":\"Seabound\",\"vehicle\":\"Angel\",\"countries\":\"US/UK\",\"sector\":\"Shipping, Cleantech, OceanTech\",\"initialInvestmentDate\":2021,\"costOfInvestment\":25000000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"2.3x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Vana\",\"vehicle\":\"Angel\",\"countries\":\"US\",\"sector\":\"Web3\",\"initialInvestmentDate\":2021,\"costOfInvestment\":30000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"3x\",\"relevantValuation\":90000000,\"tags\":[]},{\"company\":\"Cybernut\",\"vehicle\":\"Avalanche II\",\"countries\":\"US\",\"sector\":\"Cybersecurity\",\"initialInvestmentDate\":2023,\"costOfInvestment\":150000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"1.8x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"BlueLayer\",\"vehicle\":\"Hypernova SPV\",\"countries\":\"US\",\"sector\":\"Climate Tech, Carbon Markets\",\"initialInvestmentDate\":2021,\"costOfInvestment\":275000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"3.5x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Harmonic.fun\",\"vehicle\":\"Hypernova I\",\"countries\":\"US\",\"sector\":\"AI Models\",\"initialInvestmentDate\":2024,\"costOfInvestment\":500000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"4x\",\"relevantValuation\":800000000,\"tags\":[]},{\"company\":\"Thinking Machines\",\"vehicle\":\"Hypernova I\",\"countries\":\"US\",\"sector\":\"AI Models\",\"initialInvestmentDate\":2025,\"costOfInvestment\":50000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"2.4x\",\"relevantValuation\":12000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Aalo Atomics\",\"vehicle\":\"AngelList Syndicate Lead\",\"countries\":\"US\",\"sector\":\"Energy\",\"initialInvestmentDate\":2025,\"costOfInvestment\":1100000,\"stage\":\"Series B\",\"exit\":\"Convert Cap\",\"multiple\":\"2.4x\",\"relevantValuation\":1400000000,\"tags\":[\"Unicorn\"]},{\"company\":\"Workback\",\"vehicle\":\"Avalanche II\",\"countries\":\"US\",\"sector\":\"Edtech\",\"initialInvestmentDate\":2025,\"costOfInvestment\":100000,\"stage\":\"Pre-Seed\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Bruin\",\"vehicle\":\"Hypernova I\",\"countries\":\"Europe\",\"sector\":\"Data Ops\",\"initialInvestmentDate\":2025,\"costOfInvestment\":75000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Star Catcher\",\"vehicle\":\"Hypernova I\",\"countries\":\"US\",\"sector\":\"Spacetech\",\"initialInvestmentDate\":2025,\"costOfInvestment\":100000,\"stage\":\"Series A\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Science.xyz\",\"vehicle\":\"Avalanche II\",\"countries\":\"US\",\"sector\":\"Brain Computer Interface\",\"initialInvestmentDate\":2025,\"costOfInvestment\":200000,\"stage\":\"Series B\",\"exit\":\"FMV\",\"multiple\":\"2.5x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Science.xyz\",\"vehicle\":\"Avalanche II\",\"countries\":\"US\",\"sector\":\"Brain Computer Interface\",\"initialInvestmentDate\":2026,\"costOfInvestment\":50000,\"stage\":\"Series C\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Science.xyz\",\"vehicle\":\"Hypernova I\",\"countries\":\"US\",\"sector\":\"Brain Computer Interface\",\"initialInvestmentDate\":2026,\"costOfInvestment\":50000,\"stage\":\"Series C\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Sava\",\"vehicle\":\"Avalanche II\",\"countries\":\"US\",\"sector\":\"Legal AI Wrapper, LegalTech\",\"initialInvestmentDate\":2026,\"costOfInvestment\":50000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]},{\"company\":\"Sava\",\"vehicle\":\"Hypernova I\",\"countries\":\"US\",\"sector\":\"Legal AI Wrapper, LegalTech\",\"initialInvestmentDate\":2026,\"costOfInvestment\":50000,\"stage\":\"Seed\",\"exit\":\"FMV\",\"multiple\":\"1x\",\"relevantValuation\":null,\"tags\":[]}]");

const funds = [
	{
		fund: "Reach Capital Fund I",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2013,
		costOfInvestment: 10000000,
		stages: "Pre-Seed to Seed",
		exit: "FMV",
		multiple: "6.3x"
	},
	{
		fund: "Alpha Partners II",
		countries: "International",
		sector: "Pro-Rata Fund",
		initialInvestmentDate: 2016,
		costOfInvestment: 30000000,
		stages: "Series C to E",
		exit: "FMV",
		multiple: "3.8x"
	},
	{
		fund: "LearnStart I",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2017,
		costOfInvestment: 25000000,
		stages: "Seed",
		exit: "FMV",
		multiple: "2.4x"
	},
	{
		fund: "Learn Capital Fund II",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2012,
		costOfInvestment: 50000000,
		stages: "Seed to Series A",
		exit: "FMV",
		multiple: "2.7x"
	},
	{
		fund: "Learn Capital Fund III",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2015,
		costOfInvestment: 150000000,
		stages: "Series A to B",
		exit: "FMV",
		multiple: "2.8x"
	},
	{
		fund: "Alpha Partners III",
		countries: "International",
		sector: "Pro-Rata Fund",
		initialInvestmentDate: 2018,
		costOfInvestment: 75000000,
		stages: "Series C to E",
		exit: "FMV",
		multiple: "4.1x"
	},
	{
		fund: "LearnStart II",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2019,
		costOfInvestment: 25000000,
		stages: "Seed",
		exit: "FMV",
		multiple: "1.8x"
	},
	{
		fund: "Learn Capital Fund IV",
		countries: "International",
		sector: "Edtech",
		initialInvestmentDate: 2020,
		costOfInvestment: 250000000,
		stages: "Series A to B",
		exit: "FMV",
		multiple: "1.9x"
	},
	{
		fund: "Avalanche II",
		countries: "International",
		sector: "US",
		initialInvestmentDate: 2023,
		costOfInvestment: 4000000,
		stages: "Pre-Seed to Seed",
		exit: "FMV",
		multiple: "1.45x"
	},
	{
		fund: "Hypernova I",
		countries: "International",
		sector: "Co-Investment Fund",
		initialInvestmentDate: 2025,
		costOfInvestment: 8000000,
		stages: "Seed to Series B",
		exit: "FMV",
		multiple: "3.2x"
	},
	{
		fund: "Angel Portfolio",
		countries: "International",
		sector: "Diverse",
		initialInvestmentDate: "2013-2023",
		costOfInvestment: 1200000,
		stages: "Pre-Seed",
		exit: "FMV",
		multiple: "7.2x"
	}
];

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const deals = [...rawDeals].sort((a, b) => {
    const yearDiff = Number(a.initialInvestmentDate) - Number(b.initialInvestmentDate);
    if (yearDiff !== 0) return yearDiff;
    return a.vehicle.localeCompare(b.vehicle);
  });
  const groupMap = /* @__PURE__ */ new Map();
  for (const deal of deals) {
    const existing = groupMap.get(deal.company) || [];
    existing.push(deal);
    groupMap.set(deal.company, existing);
  }
  const groupedDeals = [];
  const seenCompanies = /* @__PURE__ */ new Set();
  for (const deal of deals) {
    if (seenCompanies.has(deal.company)) continue;
    seenCompanies.add(deal.company);
    const group = groupMap.get(deal.company);
    const sorted = [...group].sort((a, b) => b.costOfInvestment - a.costOfInvestment);
    groupedDeals.push({
      primary: sorted[0],
      subDeals: sorted.slice(1),
      hasMultiple: sorted.length > 1
    });
  }
  const vehicles = [...new Set(deals.map((d) => d.vehicle))].sort();
  const sectors = [...new Set(deals.flatMap((d) => d.sector.split(/,\s*/)))].sort();
  const exits = [...new Set(deals.flatMap((d) => d.exit.split(/,\s*/)))].sort();
  const years = [...new Set(deals.map((d) => d.initialInvestmentDate))].sort();
  const allTags = [...new Set(deals.flatMap((d) => d.tags).filter(Boolean))].sort();
  function formatCurrency(value) {
    if (!value) return "—";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }
  function formatValuation(value) {
    if (!value) return "—";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  }
  const tagColors = {
    "Unicorn": "bg-[#9138E0]/15 text-[#9138E0]",
    "Dragon": "bg-[#D9233B]/15 text-[#D9233B]",
    "IPO": "bg-[#22A6B5]/15 text-[#22A6B5]",
    "Exit": "bg-[#F59C49]/15 text-[#F59C49]"
  };
  function getTagClass(tag) {
    for (const [key, cls] of Object.entries(tagColors)) {
      if (tag.includes(key)) return cls;
    }
    return "bg-muted text-muted-foreground";
  }
  function mergedTags(group) {
    const all = [group.primary, ...group.subDeals];
    return [...new Set(all.flatMap((d) => d.tags))].filter(Boolean);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Track Record - MP Staton", "description": "Investment track record across angel investing, venture funds, and co-investment vehicles." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-[90rem] mx-auto px-6 py-16"> <h1 class="gradient-text mb-2">Track Record</h1> <p class="text-lg text-muted-foreground mb-12 max-w-3xl">
Investment track record across angel investing, venture funds, and co-investment vehicles spanning 2012 to present.
</p> <!-- Deals Table --> <div class="mb-16"> <h2 class="text-foreground mb-6">Deal History</h2> <!-- Filters --> <div class="flex flex-wrap gap-3 mb-4" id="filters"> <select id="filter-vehicle" class="filter-select"> <option value="">All Vehicles</option> ${vehicles.map((v) => renderTemplate`<option${addAttribute(v, "value")}>${v}</option>`)} </select> <select id="filter-sector" class="filter-select"> <option value="">All Sectors</option> ${sectors.map((s) => renderTemplate`<option${addAttribute(s, "value")}>${s}</option>`)} </select> <select id="filter-exit" class="filter-select"> <option value="">All Exits</option> ${exits.map((e) => renderTemplate`<option${addAttribute(e, "value")}>${e}</option>`)} </select> <select id="filter-year" class="filter-select"> <option value="">All Years</option> ${years.map((y) => renderTemplate`<option${addAttribute(String(y), "value")}>${y}</option>`)} </select> <select id="filter-tag" class="filter-select"> <option value="">All Tags</option> ${allTags.map((t) => renderTemplate`<option${addAttribute(t, "value")}>${t}</option>`)} </select> <button id="clear-filters" class="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden">
Clear filters
</button> <span id="filter-count" class="self-center text-xs text-muted-foreground ml-auto"></span> </div> <div class="overflow-x-auto rounded-lg border border-border"> <table class="w-full text-sm" id="deals-table"> <thead> <tr class="border-b border-border bg-muted/50"> <th class="text-left px-4 py-3 font-semibold text-foreground w-5"></th> <th class="text-left px-4 py-3 font-semibold text-foreground">Company</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Vehicle</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Country</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Sector</th> <th class="text-center px-4 py-3 font-semibold text-foreground">Year</th> <th class="text-right px-4 py-3 font-semibold text-foreground">Investment</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Stage</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Exit</th> <th class="text-right px-4 py-3 font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors" id="sort-multiple">Multiple <span class="sort-arrow text-xs opacity-50">&#8597;</span></th> <th class="text-right px-4 py-3 font-semibold text-foreground">Valuation</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Tags</th> </tr> </thead> <tbody> ${groupedDeals.map((group) => {
    const deal = group.primary;
    const tags = mergedTags(group);
    const groupId = deal.company.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    return renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`<tr class="deal-row deal-primary border-b border-border/50 hover:bg-muted/30 transition-colors"${addAttribute(deal.company, "data-company")}${addAttribute(deal.vehicle, "data-vehicle")}${addAttribute(deal.sector, "data-sector")}${addAttribute(deal.exit, "data-exit")}${addAttribute(String(deal.initialInvestmentDate), "data-year")}${addAttribute(tags.join(","), "data-tags")}${addAttribute(parseFloat(deal.multiple) || 0, "data-multiple")}${addAttribute(groupId, "data-group")}${addAttribute(group.hasMultiple ? "true" : "false", "data-has-children")}> <td class="px-4 py-2.5 w-5"> ${group.hasMultiple && renderTemplate`<button class="expand-toggle text-muted-foreground hover:text-foreground transition-colors text-xs leading-none"${addAttribute(groupId, "data-target")} aria-expanded="false"${addAttribute(`Expand ${deal.company} sub-investments`, "aria-label")}> <span class="expand-icon">&#9654;</span> </button>`} </td> <td class="px-4 py-2.5 font-medium text-foreground whitespace-nowrap"> ${deal.company} ${group.hasMultiple && renderTemplate`<span class="ml-1.5 text-xs text-muted-foreground font-normal">(${group.subDeals.length + 1})</span>`} </td> <td class="px-4 py-2.5 text-muted-foreground whitespace-nowrap">${deal.vehicle}</td> <td class="px-4 py-2.5 text-muted-foreground">${deal.countries}</td> <td class="px-4 py-2.5 text-muted-foreground whitespace-nowrap">${deal.sector}</td> <td class="px-4 py-2.5 text-center text-muted-foreground">${deal.initialInvestmentDate}</td> <td class="px-4 py-2.5 text-right font-mono text-muted-foreground">${formatCurrency(deal.costOfInvestment)}</td> <td class="px-4 py-2.5 text-muted-foreground whitespace-nowrap">${deal.stage}</td> <td class="px-4 py-2.5 text-muted-foreground">${deal.exit}</td> <td class="px-4 py-2.5 text-right font-mono font-semibold text-foreground">${deal.multiple}</td> <td class="px-4 py-2.5 text-right font-mono text-muted-foreground">${formatValuation(deal.relevantValuation)}</td> <td class="px-4 py-2.5"> <div class="flex gap-1 flex-wrap"> ${tags.map((tag) => renderTemplate`<span${addAttribute(`text-xs font-medium px-1.5 py-0.5 rounded ${getTagClass(tag)}`, "class")}>${tag}</span>`)} </div> </td> </tr> ${group.subDeals.map((sub) => renderTemplate`<tr class="deal-row deal-sub border-b border-border/50 hover:bg-muted/30 transition-colors" style="display:none"${addAttribute(sub.company, "data-company")}${addAttribute(sub.vehicle, "data-vehicle")}${addAttribute(sub.sector, "data-sector")}${addAttribute(sub.exit, "data-exit")}${addAttribute(String(sub.initialInvestmentDate), "data-year")}${addAttribute(sub.tags.join(","), "data-tags")}${addAttribute(parseFloat(sub.multiple) || 0, "data-multiple")}${addAttribute(groupId, "data-parent-group")}> <td class="px-4 py-2 w-5"> <span class="block w-px h-4 bg-border mx-auto"></span> </td> <td class="px-4 py-2 pl-8 font-medium text-foreground/70 whitespace-nowrap text-xs"> <span class="text-border mr-1">&#9492;</span>${sub.company} </td> <td class="px-4 py-2 text-muted-foreground/80 whitespace-nowrap text-xs">${sub.vehicle}</td> <td class="px-4 py-2 text-muted-foreground/80 text-xs">${sub.countries}</td> <td class="px-4 py-2 text-muted-foreground/80 whitespace-nowrap text-xs">${sub.sector}</td> <td class="px-4 py-2 text-center text-muted-foreground/80 text-xs">${sub.initialInvestmentDate}</td> <td class="px-4 py-2 text-right font-mono text-muted-foreground/80 text-xs">${formatCurrency(sub.costOfInvestment)}</td> <td class="px-4 py-2 text-muted-foreground/80 whitespace-nowrap text-xs">${sub.stage}</td> <td class="px-4 py-2 text-muted-foreground/80 text-xs">${sub.exit}</td> <td class="px-4 py-2 text-right font-mono font-semibold text-foreground/70 text-xs">${sub.multiple}</td> <td class="px-4 py-2 text-right font-mono text-muted-foreground/80 text-xs">${formatValuation(sub.relevantValuation)}</td> <td class="px-4 py-2"> <div class="flex gap-1 flex-wrap"> ${sub.tags.map((tag) => renderTemplate`<span${addAttribute(`text-xs font-medium px-1.5 py-0.5 rounded ${getTagClass(tag)}`, "class")}>${tag}</span>`)} </div> </td> </tr>`)}` })}`;
  })} </tbody> </table> </div> </div> <!-- Funds Table --> <div> <h2 class="text-foreground mb-6">Fund Involvements</h2> <div class="overflow-x-auto rounded-lg border border-border"> <table class="w-full text-sm"> <thead> <tr class="border-b border-border bg-muted/50"> <th class="text-left px-4 py-3 font-semibold text-foreground">Fund</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Sector</th> <th class="text-center px-4 py-3 font-semibold text-foreground">Year</th> <th class="text-right px-4 py-3 font-semibold text-foreground">Fund Size</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Stages</th> <th class="text-left px-4 py-3 font-semibold text-foreground">Status</th> <th class="text-right px-4 py-3 font-semibold text-foreground">Multiple</th> </tr> </thead> <tbody> ${funds.map((fund, i) => renderTemplate`<tr${addAttribute(`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`, "class")}> <td class="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">${fund.fund}</td> <td class="px-4 py-2.5 text-muted-foreground">${fund.sector}</td> <td class="px-4 py-2.5 text-center text-muted-foreground">${fund.initialInvestmentDate}</td> <td class="px-4 py-2.5 text-right font-mono text-muted-foreground">${formatCurrency(fund.costOfInvestment)}</td> <td class="px-4 py-2.5 text-muted-foreground whitespace-nowrap">${fund.stages}</td> <td class="px-4 py-2.5 text-muted-foreground">${fund.exit}</td> <td class="px-4 py-2.5 text-right font-mono font-semibold text-foreground">${fund.multiple}</td> </tr>`)} </tbody> </table> </div> </div> </section> ` })}  ${renderScript($$result, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/portfolio/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/portfolio/index.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/portfolio/index.astro";
const $$url = "/portfolio";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
