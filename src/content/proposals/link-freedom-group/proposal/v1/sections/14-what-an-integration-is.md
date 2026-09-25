---
chapter: "13"
id: what-an-integration-is
layout: two-column
eyebrow: "The deal"
title: "What a VAR integration actually is"
card_summary: "One commercial shape and one technical shape, written down once so every conversation starts from a proposal."
subhead: "The single highest-leverage artefact in this engagement: a reference deal that a partnerships lead can forward internally without rewriting it."
columns:
  - title: "Commercial shape"
    items:
      - "Platform resells at its own retail price; LFG sets a wholesale floor"
      - "Margin split on registration and renewal, with renewal weighted to reward retention"
      - "Registry-of-record and accreditation sit behind LFG or a named registrar partner, so the platform never becomes a registrar"
      - "Support boundary in writing: platform owns tier 1, registry owns abuse, transfers, and disputes"
      - "Launch-phase incentives — founder pricing, reserved premium TLDs, co-marketing at delegation"
      - "Term, exclusivity window if any, and what happens to registrations if either side walks"
  - title: "Technical shape"
    items:
      - "One REST endpoint for availability, registration, and renewal — not raw EPP"
      - "Availability check fast enough to sit inline in a naming UI"
      - "Programmatic registration suitable for an agent acting on a user's behalf"
      - "DNS and certificate provisioning that assumes the platform already owns the hosting"
      - "Sandbox with fake TLDs, so a platform can build against it before delegation"
      - "Webhooks for expiry, transfer, and abuse actions"
---

`.link` changes what this conversation sounds like. A platform cannot schedule
engineering work against a namespace that does not resolve yet, and "we will
send you an API when the TLDs delegate" is how a signed partnership quietly
becomes a signed partnership that shipped nothing. Because **LFG already
administers a live TLD**, the first integration can be built, shipped and billed
against `.link` while the 2026-round TLDs are still in evaluation. The
partner gets a working product this quarter; LFG gets attach data; the new
TLDs arrive later as additional inventory on an integration that already
exists. A sandbox is still worth having for the un-delegated TLDs, but it is
no longer what the whole plan rests on.

> [!warning] TK — what exists today
> Who is the intended registry backend (Identity Digital, CentralNic, Tucows,
> in-house), is there a registrar partner, and does any API surface exist yet
> even in draft? This determines whether the platform pitch is "integrate now"
> or "commit now, integrate later" — two very different conversations, and I
> would rather have the first one.
