---
chapter: "14"
id: api-layer
layout: table
eyebrow: "Optional, highly recommended"
title: "Build the API layer"
card_summary: "A partner cannot resell what it cannot call. Riding an existing registrar API is the fast path; owning one is the only way the bundle product and the agent use case exist at all."
subhead: "Every motion in this proposal terminates in the same requirement: a platform has to be able to check availability, register, and renew programmatically. Whose API that is turns out to be a strategy decision, not a plumbing one."
stats:
  - value: "Oct 2025"
    label: "Vercel shipped its own Domains Registrar API"
    note: "Search, price, buy, renew, transfer — the layer, already built"
  - value: "2"
    label: "Ways to give partners an API"
    note: "Ride an existing registrar, or run your own"
  - value: "~months"
    label: "Concept to production demo, building our own"
    note: "Not the multi-year platform project it sounds like"
---

The whole proposal terminates here. A platform cannot sell a domain inside its
own flow unless it can check availability, register, and renew over an API —
and the zero-DNS argument from the wedge only works if that same API writes the
records. Nothing in the channel plan ships without this layer existing
somewhere.

It already exists at the platform end. **Vercel shipped a Domains Registrar API
in October 2025** — programmatic search, pricing, bulk purchase, renewal,
transfer, nameserver management. [^8e82fd] [^15a630] That is a platform
building precisely the capability this proposal is asking platforms to use,
which is validation, and also a warning that the integration surface is being
defined right now by someone other than LFG.

### The two options

| | Ride an existing registrar API | Run our own |
| --- | --- | --- |
| **Time to first integration** | Fast — the API exists today | Months, not years |
| **Who owns the economics** | The registrar sets margin and terms | LFG |
| **How LFG's TLDs appear** | Rows in a catalogue of every TLD on earth | The catalogue |
| **Bundle registration** | Not offered | The reason to build it |
| **Agent-shaped naming** | Availability lookup only | Suggestion, bulk, programmatic-on-behalf-of |
| **Who owns the customer** | The registrar | LFG and the platform |

The incumbent path is a marketplace API such as **name.com**, which is the
route a platform would take today to sell domains at all. [^0dad8b] Selling
LFG's TLDs through it works, and for a first pilot it may be exactly right —
it removes accreditation, billing and compliance from the critical path.

### Why the incumbent path caps the upside

**In a general marketplace API, LFG's TLDs are rows.** A platform that
integrates a full-catalogue registrar gets `.com` in the same call, at which
point the naming step reverts to a search box with a thousand results — the
demand-pull shape this proposal exists to escape, re-created inside the
product. The namespace's advantage is availability and coherence, and a
catalogue of everything is the one context where neither is visible.

**Two things promised earlier do not exist in any registrar API.** The bundle —
a brand across five extensions, registered in one action, renewing on one date
— is the highest-value product in the portfolio section and no general
registrar offers it. And agent-scale naming needs endpoints no human-facing
registrar has: suggestion across a namespace, bulk availability at generation
speed, registration on a user's behalf by software. Those are the two arguments
that make a platform say yes, and both require an API built for this namespace
rather than for all namespaces.

### Why this is a months project, not a years project

I would build it, and the reason to believe that is a process claim rather than
a headcount claim. **The Lossless Group has become state-of-the-art at agentic
engineering — software-factory build processes, where specification, code
generation, review and verification run as an instrumented pipeline rather than
as a team typing.** That is the practice this very proposal was assembled with.

The realistic shape is a thin, opinionated REST layer over the registry's EPP
interface: availability, suggestion, bulk check, register, renew, transfer,
DNS write, webhook. Concept to production demo in a few months, with a sandbox
a partner can build against long before the 2026-round TLDs delegate. This
is a well-understood surface with a published protocol underneath it, not
research.

> [!note] The sequencing that gets both
> Pilot on an existing registrar API to put a live integration in front of a
> partner this quarter, and build the LFG layer in parallel. The first proves
> the channel with no platform work wasted; the second is what the bundle and
> the agent products need. They are not alternatives, and doing the first does
> not commit you to it forever.

> [!warning] TK — what the backend allows
> This is scoped as optional because it depends entirely on facts I do not
> have: the registry backend, whether LFG holds registrar accreditation or
> partners for it, what EPP access exists, and whether `.link` can be the
> testbed. Answer those and this section becomes either a concrete build plan
> or unnecessary.

[^8e82fd]: 2025. [New Domains Registrar API for domain search, pricing, purchase, and management](https://vercel.com/changelog/new-domains-registrar-api-for-domain-search-pricing-purchase-and-management). Published: 2025-10-08
[^15a630]: 2026. [Programmatic Domain Management — Vercel Registrar API](https://vercel.com/docs/domains/registrar-api). Published: 2026-09-24
[^0dad8b]: 2026. [Name.com API documentation](https://www.name.com/api-docs). Published: 2026-09-24
