---
chapter: "02"
id: the-wedge
layout: two-column
eyebrow: "The wedge"
title: "Customers think of naming inside their workflows"
headline: "But then they _must leave_ — to a name marketplace, to register it."
card_summary: "Buying the domain is only half the friction. The other half is wiring the DNS by hand — and it disappears entirely when registration and deployment share a platform."
subhead: "Today a domain is something you leave your work to go buy, and then wire up yourself across two dashboards that disagree about what the records are called. When the registrar and the deploy target are the same platform, none of that exists — there is nothing to point at anything."
columns:
  - label: "Status quo"
    tone: muted
    title: "Go shop for a domain — then wire up the DNS yourself"
    body: "Stop building. Open a marketplace, search, compare extensions, check out. Then the actual work starts: find the DNS panel, add the records, wait, come back, verify, and hope the certificate issues."
    items:
      - "Leave the thing you were making in order to go buy something"
      - "A second vendor, a second checkout, a second account to remember"
      - "Hand-configure A, AAAA, CNAME and TXT records across two dashboards, in a vocabulary most people get wrong at least once"
      - "Or surrender the nameservers entirely, and now DNS lives somewhere else than the domain"
      - "Wait for propagation, return, click verify, debug why the TLS certificate did not issue"
      - "Renewal arrives a year later as a line item the buyer forgot about and resents"
    mindset: "Comparison-shopping mindset · two vendors · DNS debugging · decision deferred"
  - label: "VAR possibility"
    tone: accent
    title: "Embed domain selection inside the creative and developer tools"
    body: "Resell the registration without the user ever leaving the tool — and because the platform is already the deploy target, there are no records to wire. It owns both ends of the thing the user would otherwise be hand-connecting."
    items:
      - "Never leave the thing you were making"
      - "Availability is the whole experience, and a fresh namespace has nearly all of it"
      - "One click, inside a session already authenticated and already billing"
      - "Zero DNS configuration — the platform writes its own records, because it is both registrar and host"
      - "TLS provisioned automatically; no propagation wait, no verify step, no failure mode to debug"
      - "Renewal rides a subscription the user has already decided to keep"
    mindset: "Impulse mindset · one click · zero records · decided in the moment"
---

The DNS step is the underrated half of this. Buying a domain is a few minutes of
annoyance; **connecting** one is the step where people actually stall — and it is
the step every one of these platforms already pays for. "I connected my domain
and the site doesn't load" is a standing support category at Vercel, Netlify,
Webflow and Squarespace alike, and it is generated almost entirely by the
hand-off to a registrar the platform does not control. A platform that sells the
domain writes the records itself, provisions the certificate itself, and deletes
its own support burden in the process.

The other half of the wedge is availability. A person naming a project in 2026
hits the same wall every time: everything good in `.com` went twenty years ago,
and the workarounds — hyphens, misspellings, five-word compounds — are a visible
tax on a thing they just made. An agentic app builder makes this worse at machine
scale: it will happily generate forty projects an afternoon, every one of which
needs a name that resolves.

A brand-new namespace is the only thing that answers that, because on day one it
is **almost entirely unclaimed**. `.api`, `.stack`, `.ship`, `.auth` and `.agentic`
are not better TLDs than `.com` in the abstract. They are dramatically better
TLDs *at the moment of naming*, because the name you want is still there.

That is the value the platform adds, and it is why this is a VAR relationship
rather than an affiliate link: the platform is not forwarding traffic to a
registrar, it is **collapsing four steps into one inside its own product** — and
converting a deliberate purchase into an impulse one.
