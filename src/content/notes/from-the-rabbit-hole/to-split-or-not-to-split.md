---
title: To Split, or Not to Split — That Is the Question
lede: A million-token context window doesn't mean I should fill it. Long docs hurt creativity even when the model can technically swallow them whole.
date_created: 2026-05-11
date_modified: 2026-05-11
tags: [Context-Vigilance, AI-Co-Development, Working-Notes, Agent-Skills, Observations]
authors:
  - Michael Staton
---

# To Split, or Not to Split — That Is the Question

I was drafting a spec with Claude today and noticed myself getting *anxious* about how long the file was getting. Not because the model couldn't read it — Opus 4.7 with a 1M-token context window will happily swallow the whole thing. Anxious because **I** couldn't read it. I was scrolling past sections to find the part I wanted to discuss.

That feeling is the signal.

## The Conflation I Want to Name

There are two different things hiding under "can the model handle this":

- **Technical capacity** — the model accepts the bytes without truncating.
- **Working quality** — creativity, cross-referencing, cooperation between me and the agent.

Capacity has been growing fast. Quality has not. A long doc doesn't break the model; it dulls the *collaboration.* The agent makes more pattern-y, less specific suggestions. I lose the thread of where in the file we were. Future-me opens the doc cold and has to re-orient through twelve sections to find the one that matters.

Capability isn't the same as wisdom to use it.

## The Trigger Is Anxiety, Not Word Count

I don't want a hard rule like "split at 500 lines." Rules turn into ceremony. The actual trigger is:

> When I notice myself scrolling past sections to reach the one that matters, the doc is already too long.

That's pre-emptive, not reactive. The right time to split is *before* the doc becomes hard to navigate.

## Fork and Cross-Reference

The practice I keep landing on: factor out sub-systems into their own files and link from the parent.

- A self-contained sub-system → its own spec, linked from the parent spec.
- A reusable pattern → a blueprint, linked from the spec that uses it.
- A specific debugging journey → its own issue, linked from wherever it surfaced.

**The parent doc keeps the *map*. The children carry the *detail*.** Both stay short enough that thinking happens cleanly inside them.

## I Added This to the Skill

I codified this into my `context-vigilance` agent skill today — sharpened the relevant bullet in `SKILL.md` and added a section called *"On capability ≠ wisdom-to-use-it (the anxiety-trigger split)"* to `references/philosophy.md`. So future-me, and any agent loading the skill, gets this principle for free instead of having to rediscover it in the middle of a long doc.

That's the thing I keep relearning about working with agents: **the most valuable artifact of a session is usually the durable lesson, not the deliverable.** The spec we were writing will eventually be implemented and archived. The principle about not letting specs balloon is reusable across every project I'll ever work on.

Write the lesson down. Put it where you'll find it later.
