---
chapter: "11"
id: partner-reach
layout: table
eyebrow: "Reach"
title: "How many people these platforms actually touch"
card_summary: "Published figures for every named target. The paying tier alone is ten times the entire .app book."
subhead: "Assembled from company filings, investor disclosures and tech press. Incomplete by nature — private companies disclose what flatters them — but the order of magnitude is not in doubt."
stats:
  - value: "~540M"
    label: "Registered accounts across the named platforms"
    note: "Heavily overlapping — a ceiling, not addressable demand"
  - value: "~7.5M"
    label: "Accounts already paying for something"
    note: "Wix premium + Figma paid + Replit business + Webflow customers"
  - value: "10x"
    label: "That paying tier vs the entire .app book"
    note: "7.5M paying accounts against 750K .app domains in six years"
---

| Platform | Registered users | Paying / business accounts | Enterprise tier | Scale signal |
| --- | --- | --- | --- | --- |
| **Wix** | 282M registered [^a5c418] | 6.2M paid premium subscriptions [^a5c418] | — | Already a registrar |
| **GitHub** | 180M+ developers (225M incl. all accounts) [^37b76a] | — | — | Microsoft-owned |
| **Replit** | 50M+ users [^7cd2ff] | 500K+ business users [^7cd2ff] | — | ~$525M ARR, $9B valuation [^7cd2ff] |
| **Figma** | ~13M MAU (Mar 2025) [^2c9f6a] | ~690K paid customers [^2c9f6a] | 13,861 over $10K ARR · 1,405 over $100K · 67 over $1M [^2c9f6a] | FY26 revenue guided ~$1.37B [^2c9f6a] |
| **Vercel** | 6M developers on v0 · 1M+ monthly Next.js devs [^c9dc7c] | — | OpenAI, Under Armour named [^c9dc7c] | ~$340M ARR, $9.3B valuation [^c9dc7c] |
| **Bolt / StackBlitz** | 5M registered (May 2025) [^3a8cc7] | — | — | $0 to $40M ARR in 5 months [^3a8cc7] |
| **Webflow** | 3.5M+ users [^68c5a5] | 100K+ customers across 190 countries [^68c5a5] | — | — |
| **Lovable** | Not disclosed | — | — | ~$400M ARR (Feb 2026) [^65ebe2] |
| **Squarespace** | Not disclosed | — | — | Bought ~10M domains for $180M [^d97e5b] |
| **Cloudflare** | Not disclosed | — | — | At-cost registrar; shipped a programmatic registration API in 2026 [^9161ad] |

### Reading this table honestly

**The 540M is a ceiling, not a market.** These audiences overlap heavily — a
Replit user very likely has a GitHub account — and registered accounts include
everyone who ever signed up once. It is the wrong number to plan against, and
I would not put it in front of a partner as though it were demand.

**The ~7.5M paying tier is the real number.** Wix's 6.2M premium subscriptions,
Figma's ~690K paid customers, Replit's 500K business users and Webflow's 100K
customers are accounts that have already produced a credit card for this
category of thing, inside a billing relationship that already exists. That tier
alone is **ten times the entire `.app` book that Google built in six years**.
One integration with Wix's paid base is roughly eight times `.app` on its own.

That is the order-of-magnitude case, and it does not require heroic conversion
assumptions. It requires the domain step to be *present* where those accounts
already are.

> [!note] Cloudflare just built part of this without anyone
> In 2026 Cloudflare shipped an API for registering domains programmatically and
> has said it is heading toward registrar-as-a-service. [^9161ad] That is
> validation — the infrastructure layer independently concluded that
> registration belongs behind an API, inside other people's products. It is also
> a clock. The rails this proposal depends on are being laid by a company that
> could run a namespace itself.

> [!warning] TK — gaps I could not close from public sources
> No public user count for Lovable, no domains-under-management disclosure from
> Cloudflare, and nothing reliable for Netlify, Framer, Render or Railway. If
> LFG has access to a registrar-industry data source, those four are worth
> filling before the target list is final.

[^a5c418]: 2026. [Wix Statistics 2026: Users, Revenue & Market Share](https://colorlib.com/wp/wix-statistics/). Published: 2026-09-24
[^37b76a]: 2026. [GitHub in 2026: 225 Million Developers, 630 Million Projects](https://sqmagazine.co.uk/github-statistics/). Published: 2026-09-24
[^7cd2ff]: 2026. [Replit Statistics & Data 2026: User Count, Revenue and Growth](https://devgraphiq.com/replit-statistics/). Published: 2026-09-24
[^2c9f6a]: 2026. [Figma Announces First Quarter 2026 Financial Results](https://investor.figma.com/news-events/news/news-details/2026/Figma-Announces-First-Quarter-2026-Financial-Results/default.aspx). Published: 2026-05-14
[^c9dc7c]: 2026. [Vercel Statistics 2026: Valuation, Revenue, Users, Investors](https://devgraphiq.com/vercel-statistics/). Published: 2026-09-24
[^3a8cc7]: 2026. [Bolt.new Statistics 2026: $40M ARR, 5M Users](https://vibeappscanner.com/bolt-statistics). Published: 2026-09-24
[^68c5a5]: 2026. [Webflow Statistics 2026 – 75 Key Figures](https://mycodelesswebsite.com/webflow-statistics/). Published: 2026-09-24
[^65ebe2]: 2026. [Lovable vs Bolt.new vs v0: $400M vs $40M ARR Gap](https://tech-insider.org/au/lovable-vs-bolt-new-vs-v0-2026/). Published: 2026-09-24
[^d97e5b]: 2023. [Squarespace Completes Acquisition of Google Domains Assets](https://www.squarespace.com/press-releases/2023/9/7/squarespace-completes-acquisition-of-google-domains-assets). Published: 2023-09-07
[^9161ad]: 2026. [Cloudflare API Now Lets You Register Domains Programmatically](https://www.startuphub.ai/ai-news/technology/2026/cloudflare-api-now-lets-you-register-domains-programmatically). Published: 2026-09-24
