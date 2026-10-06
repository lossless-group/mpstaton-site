---
title: Cloudflare Connect 2026 — Plan for LFG
event: Cloudflare Connect 2026
dates: Oct 19–21, 2026
summary: "Who to meet, which sessions to sit in, and how to work Cloudflare's own conference without tipping the channel plan to Cloudflare."
venue: Moscone West, 747 Howard St, San Francisco
date_created: 2026-10-02
sources:
  - https://www.cloudflare.com/connect/
  - https://www.cloudflare.com/connect/speakers/
  - https://www.cloudflare.com/connect/sessions
---

# Cloudflare Connect 2026: plan for the LFG channel

## The posture: work the room, not the host

The proposal puts Cloudflare **last**, on purpose (see `13-target-platforms.md`). Approached cold, it's "a polite no plus a competitor who now knows the plan." So at Connect:

- **In Cloudflare's own sessions:** listen and take notes. Don't pitch LFG to Cloudflare staff.
- **With Cloudflare's customers:** pitch. The people who build on Cloudflare are the proposal's tier-1 to tier-4 targets, and several are speaking here (Lovable, Hostinger, Canva, Figma, Pantheon, Laravel, Mintlify).

**A new fact that changes the Cloudflare question.** In April 2026 Cloudflare launched a Registrar API, so domains can now be searched and registered programmatically ([blog](https://blog.cloudflare.com/registrar-api-beta/)). Domain Name Wire also reports Cloudflare as one of 2025's fastest-growing registrars, alongside Hostinger. That means a platform running on Cloudflare, such as Lovable on Workers, could sell domains through Cloudflare with no other registrar involved. LFG TLDs would reach those platforms only if Cloudflare carries them. **Questions to answer by listening, not asking:** does the Registrar API support resellers or sub-accounts, and how does Cloudflare decide which TLDs to carry?

## Travel

| | Recommendation |
| --- | --- |
| **Arrive** | Sunday Oct 18 evening. Monday is the best networking day: Partner Summit, the Cold Start pitch competition at 4 PM, and the Welcome Reception from 5 to 7 PM. |
| **Depart** | Thursday Oct 22 morning. The func(tion) closing party is Wednesday at 7 PM. |
| **Hotel** | Within walking distance of 4th & Howard (SoMa, Union Square or Yerba Buena). Moscone hosts no other big event that week; Dreamforce was Sept 15–17. |
| **Pass** | Conference Pass, $595. Skip University (+$495), which is certification training. |
| **Optional extension** | TechCrunch Disrupt is Oct 13–15, the week before, also in SF. It has more AI app builders and early-stage platforms. Only worth it if a week in SF is acceptable. |

**Open items:** your departure city, whether LFG is covering travel, and whether a Conference Pass gets you into the Partner Summit. The summit is listed on the pass page but may be limited to partners, so email connect@cloudflare.com to confirm.

**The Cold Start pitch competition** isn't for LFG to enter: it's limited to US and Canadian startups that have raised under $10M. It's still worth attending, because the founders who pitch there are the platform builders LFG wants to reach.

## Speakers ranked against the strategy

### A. Direct channel targets (book meetings before the event)

| Speaker | Company | Why it matters for LFG | When |
| --- | --- | --- | --- |
| **Fabian Hedin**, Co-Founder & CTO | Lovable | Tier 1 in the proposal. It deploys on Workers, and every app it builds needs a name. **The top target.** | Tue 1:10 "TanStack Start on Workers"; Tue 3:15 "When anyone can ship software, trust becomes the platform's job" |
| **Emilis Strimaitis**, Head of Product Innovation | Hostinger | A registrar and an AI site builder in one company: Horizons and Website Builder merged into "AI Builder" in Aug 2026. It could sell LFG names both as a registrar and inside its builder. | Tue 11:00 panel "AI, reliability, and the new engineering velocity" |
| **Adam Lazur**, Principal Engineer; **Michael Yates**, Eng Director | Canva | Tier 4: Canva sells domains for the sites people build in it. Both speakers are engineers, so use them to get introduced to the domains or partnerships team. | Wed 3:25 "Scaling Canva on Cloudflare" |
| **Pratik Agarwal**, Software Engineer | Figma | Tier 4, named in the proposal. Figma runs AI-generated code (Sites and Make) on Cloudflare. He's an individual contributor, so ask for an intro. | Tue 2:30 "How Figma runs AI-generated code on Cloudflare" |
| **Chris Yates**, SVP Product, Design & Eng | Pantheon | Tier 2: hosting for Drupal and WordPress sites, now launching P1, an AI-native site builder. A senior product decision-maker. | Tue 3:15 "Building P1 on Cloudflare" |
| **Joe Dixon**, Head of Product | Laravel | Tier 2: Laravel Cloud is a deploy platform with a large PHP developer base. A product decision-maker. | Wed 1:10 "Into the tunnel: metadata-driven routing" |
| **Alex Rich**, Founder | automo.ai, ciao.dev, Desygner | A serial founder (50M+ users, three exits) building "the AI-native business stack." Desygner is a design tool, and ciao.dev looks like an app or software platform (unverified). | Tue 12:30 "50 million users. 12 people. 100x output." |
| **Hahnbee Lee**, CTO; **Nicholas Khami**, Head of Eng | Mintlify | Hosts documentation sites on customers' own domains. Fits the "replaces a subdomain" pitch (`docs.company.com` → `company.learn`). | Tue 2:30 "From 76% to 100% cache hits" |
| **Justis Blasco**, CTO; **Kristina Pototska**, PM Director | Popmenu; Commerce (formerly BigCommerce) | Long-tail small business naming: restaurant websites and online stores. Fits `.mall`, `.ship` and `.asap`. | Wed 11:00 "Getting your storefront agent ready for peak season" |
| **Aparna Subramanian**, VP Eng, Infrastructure | Shopify | Shopify sells domains to merchants, but she's in infrastructure, not domains. Treat as a route to an introduction. | Speaker, no breakout listed |

### B. Cloudflare sessions to attend and listen in (don't pitch)

| Session | Why | When |
| --- | --- | --- |
| **"Everyone can build an app now. Where does it go?"** (Josh Kahn) | This is the proposal's thesis, presented from Cloudflare's side. **Must attend.** | Tue 12:30–1:15 |
| **"Deploy to Void: Launch vibe-coded apps instantly"** (Cameron Clark, Michael Dong) | VoidZero (Vite, Evan You) joined Cloudflare, and Void is its deploy platform. Watch how domains are attached in the demo. | Tue 12:10–1:10 (overlaps Josh Kahn; choose one) |
| **"EmDash: the secure WordPress successor"** (Matt Kane) | Cloudflare's own CMS, built on Astro. Every EmDash site needs a domain, which puts Cloudflare into tier 4 itself. | Tue 1:10; Wed 11:00 (System Sketch) |
| **"Building an open agentic Internet: Discoverable, callable, and payable"** | How agents get named and found, which is directly relevant to `.agentic` and `.mate`. | Wed 11:00 |
| **"Building multi-cloud resilience: It starts with DNS"** (Christian Elmerot); **"How the Internet really works"** (Tom Paseka) | Cloudflare's DNS team. Good for understanding how it thinks about naming. | Wed 12:30; Tue 1:50 |
| **Global Partner Summit**: Tom Evans (Chief Partner Officer), Aly Cabral ("Build and sell at the edge"), Oliver Roup (roadmap) | How Cloudflare structures partner and reseller deals. Useful as a template for LFG's VAR terms. | Mon 1–5 PM (check access) |
| **"How publishers can thrive and monetize in the age of AI agents"** (Lara Cohen, Arielle Weiss) | The strategic partnerships team. Worth knowing for the eventual Cloudflare approach. | Wed 11:00 |
| **Evan You**, "Developer tooling in the agentic era" | Vite and Void. Frameworks are where projects get created. | Tue 3:15 |

### C. Amplifiers and capital (meet if the chance comes up)

- **Sarah Guo** (Conviction) and **Aaron Jacobson** (NEA): investors in AI app builders and possible warm introductions to their portfolio companies. Jacobson is on the Tue 1:10 panel with **Madison Faulkner** (Factory).
- **Bill Gross** (Idealab): invented pay-per-click search advertising and has a long history with domain names. Tue 4:00 General Session.
- **Shawn Wang / swyx** (Latent.Space), **Corey Quinn** (Duckbill, a cloud cost consultancy with a large audience) and **Kent C. Dodds**: developer-media voices. Each runs a live interview or talk.
- **Peter Steinberger** (OpenClaw, now at OpenAI): agents that create things at machine scale is the `.agentic` argument. Wed 9:00 General Session.
- **Fred Schott** (Astro creator, now building Flue at Cloudflare): you share the Astro stack, which makes for an easy conversation.

### Skip

Most of the agenda is security, zero trust, SASE and networking (about 60% of sessions). It isn't relevant to the channel strategy.

## Companies you may not know

| Company | What it is | Relevance |
| --- | --- | --- |
| **Hostinger** | A Lithuanian web host and registrar, one of 2025's fastest-growing `.com` registrars. Its "AI Builder" merged Horizons and Website Builder in Aug 2026. | **High:** both a registrar and a builder |
| **Pantheon** | Managed hosting for Drupal and WordPress, now launching P1, an AI-native web composition product. | **High:** a tier-2 host |
| **Popmenu** | A restaurant marketing and website platform, based in Atlanta. | Medium: small business sites |
| **Commerce** | BigCommerce's new name. An e-commerce platform. | Medium: online stores |
| **Squiz** | An Australian digital experience platform (DXP) used by universities and governments. CPO Julie Brettle is speaking. | Medium-low: `.learn` |
| **automo.ai / ciao.dev / Desygner** | Alex Rich's companies. Desygner is a design tool with tens of millions of users. Automo is an "AI-native business stack"; ciao.dev is unverified. | Medium-high: verify ciao.dev |
| **Taka.ai** | An AI that runs social media for small businesses, incubated inside monday.com. SocialKit is its engine. | Low-medium: small business naming |
| **Orb** | An always-on internet quality dashboard from the founders of Ookla (Speedtest) and Downdetector. CEO Doug Suttles. | Low |
| **Apate.ai** | An Australian company, now incorporated in Delaware, that deploys fleets of AI personas to waste scammers' time and disrupt scam networks. Raised about $11M. | Low; possible tie-in on namespace abuse |
| **Executor** (Rhys Sullivan) | Lets you set up tools once and use them with any AI agent. Built on Cloudflare's "code mode." | Low |
| **Standard Agents** (Justin Schroeder) | A stealth-ish agent startup from the creator of FormKit and AutoAnimate. | Low |
| **Command Code** (Ahmad Awais) | The most-used coding-agent harness for open-weight models. Ahmad previously founded Langbase. | Low |
| **Effectful Technologies** | The company behind Effect, a TypeScript framework. | Low |
| **kody.codes** | Kent C. Dodds's "personal software factory" agent, launched Sept 2026. | Low; good for audience reach |
| **Relevance AI** | An Australian platform for building teams of AI agents. | Low-medium: `.agentic` |
| **Factory** | AI coding agents ("Droids"). | Low |
| **Runway** | AI video and generative media. | Low |
| **Citrini** | Citrini Research, a thematic investing research shop. Its speaker is anonymous. | None |
| **Nisos, IONIX, Optiv, Presidio** | Security vendors and consultancies. | None |

## Draft Tuesday schedule (the main day)

| Time | Session |
| --- | --- |
| 8:30 | Opening General Session (Prince) |
| 11:00 | Hostinger panel |
| 12:30 | Josh Kahn, "Everyone can build an app now. Where does it go?" |
| 1:10 | Lovable on Workers (Hedin). EmDash repeats Wednesday. |
| 2:30 | Figma or Mintlify (choose one; catch the other at the Hub) |
| 3:15 | Lovable, "trust becomes the platform's job". Pantheon and Evan You overlap; try to catch Chris Yates at the Hub. |
| 4:00 | General Session (Fei-Fei Li, Bill Gross) |
| 5:00 | Last Call happy hour |

## Before the event

1. Register for the pass and confirm Partner Summit access.
2. Build an agenda in the [agenda builder](https://events.www.cloudflare.com/connect2026/sign-in?rId=11538273).
3. About a week out, send short LinkedIn notes to the tier-A list asking for 15 minutes at the Hub. Priority: Lovable, then Hostinger, Pantheon, Laravel, Canva.
4. Ask LFG for any warm paths into these companies first (the proposal's open item on existing relationships), so no one gets approached twice.
5. Bring a one-page version of the proposal's wedge argument and the `.link` live-TLD point. That's the reason a platform can integrate now rather than waiting for the new TLDs.
