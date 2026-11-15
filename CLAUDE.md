# Ahaan Gupta — Personal Portfolio

A premium personal portfolio for Ahaan Gupta, a Grade 11 (Commerce) student at Lotus Valley International School, Gurugram. It is his digital identity: academics, awards, leadership, Model UN and debate, competitions, projects and interests.

If you are resuming after a restart, read `PROGRESS.md` first. It records what is done and what comes next.

## Sources of truth

- `source-material/resume-original.pdf` is the primary source of facts. It contains a phone number and the GitHub repository is public, so it is git-ignored and exists only in the session's container. If it is missing after a restart, use `content/research/facts.md` (the full extraction) and `public/Ahaan-Gupta-Resume.pdf` (the redacted copy offered for download).
- `source-material/portrait-original.webp` is the client's portrait.
- `src/content/site.ts` is the single content file the site renders from. All copy lives there.
- `content/research/facts.md` is the resume extraction; `content/research/assets.md` records where every logo and image came from and its licence.
- `design/design-system.md` is the approved visual system. `design/directions.md` holds the three directions that were considered.

Facts the client gave in conversation (not in the resume):

- He built https://artha-finance.netlify.app, a finance website, as a portfolio project.
- He is taking part in the Wharton Global High School Investment Competition (ongoing). Details of his team and strategy are not known and stay as placeholders.
- Interests: finance and economics, aviation, law, quizzing and general knowledge, Formula 1 and motorsport, Model UN / international relations / geopolitics, plus reading (400+ books) and tennis from the resume.

## Content rules (non-negotiable)

1. Never invent awards, positions, dates, rankings, qualifications or accomplishments.
2. Never invent biography, personality, personal philosophy or descriptions of his interests. These are editable placeholders until he supplies them. Placeholders must look deliberate and be easy to find in `src/content/site.ts` (`placeholder: true`).
3. Interests are interests, not professional qualifications. Do not overstate expertise.
4. Never upgrade a claim. Keep the resume's exact award levels, figures and qualifiers ("20+", "ongoing").
5. The phone number is never published. The public contact is `thisisahaan@gmail.com`. The downloadable resume is a redacted copy with the phone number removed.
6. Logos come from official sources or clearly licensed files, are used unmodified, and only indicate where something took place. No fabricated or approximated logos, and nothing that implies an organisation endorses him.

## Creative direction

Brief from the client:

- The quality and restraint of an Apple product page, adapted to a person: editorial design, cinematic storytelling, sophisticated typography, generous whitespace, large expressive headings, art-directed imagery, refined micro-interactions.
- Inspiration, in philosophy only, from aaravjuneja.in: the person's interests are communicated through the design itself rather than listed in cards. Do not copy its layout, code, assets, typography or interactions.
- Each interest has its own visual treatment inside one coherent system:
  - Aviation: flight paths, navigation graphics, airport information systems, cockpit-style instruments.
  - Finance: market visualisations, economic indicators, financial editorial design.
  - Law: archives, judicial architecture, case-document aesthetics, classical serifs.
  - Quizzing: knowledge systems, interactive questions, connected subjects.
  - Motorsport: circuit maps, telemetry, timing displays.
  - MUN and international relations: diplomatic maps, placards, institutional documents.
- The site should communicate intellectual curiosity, range, ambition and an interest in how the world works.

Avoid: generic AI portfolio templates, repeated cards, SaaS layouts, heavy gradients, glassmorphism, needless rounded rectangles, excessive animation, corporate resume layouts, six unrelated microsites, decoration with no link to his identity.

The chosen direction and its tokens are in `design/design-system.md`. Build from that file, not from memory.

## Site structure

Hero, About, Academic profile, Achievements and awards, Leadership and positions of responsibility, Model UN and public speaking, Competitions and projects (including Artha and the Wharton competition), Interests and pursuits, Contact and resume download. The creative director may reorder these if the concept is stronger for it.

## Motion requirements

Cinematic entrance sequence, scroll-based reveals, typographic animation, subtle parallax, animated section transitions, an interactive achievement timeline, refined hover states, smooth navigation. Everything must work on touch devices, respect `prefers-reduced-motion`, and animate only transform and opacity.

## Quality bar

A successful build is not enough. Work is done when:

- `npm run lint` and `npm run build` pass.
- The site has been opened in a real browser with Playwright and full-page screenshots at 1440, 834 and 390 wide have been looked at.
- Hierarchy, type, spacing and composition hold up in those screenshots; generic-looking sections have been redesigned.
- Animations, hovers and navigation have been exercised, including reduced-motion mode.
- An independent QA pass has reported no blocker or major defects.
- Nothing is reported as tested that was not actually run.

## Team (project subagents in `.claude/agents/`)

| Agent | Model | Role | Writes to |
| --- | --- | --- | --- |
| `creative-director` | claude-fable-5-2, high | Owns the identity, writes and approves the design system, reviews screenshots | `design/` |
| `visual-explorer` | claude-fable-5-2, high | Static reference boards and motif studies; never the production site | `design/explorations/` |
| `frontend-engineer` | claude-opus-5-5, high | Implements the approved system | `src/`, `public/`, `scripts/` |
| `content-researcher` | claude-sonnet-5-5, high | Facts, central content file, logo sourcing and licensing | `src/content/`, `content/research/`, `public/logos/` |
| `qa-reviewer` | claude-sonnet-5-5, high | Independent browser testing; reports only | `qa/` |

If the Agent tool reports an agent type as not found, run it headlessly with `scripts/agent.sh <agent> <prompt-file>` (see PROGRESS.md).

The main session orchestrates: it briefs agents, relays their findings and makes no design decision the creative director has not approved. Agent Teams (experimental) is not enabled, at the client's request.

## Stack and commands

Next.js 16 (App Router, static export to `out/`), React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), GSAP with ScrollTrigger, Lenis, Lucide React, Playwright 1.63.0 for browser testing.

This Next.js version has breaking changes compared with older releases. Read the relevant guide in `node_modules/next/dist/docs/` before using an API you are unsure of.

```bash
npm install          # dependencies (the SessionStart hook does this in cloud sessions)
npm run dev          # development server on :3000
npm run lint
npm run build
npm run start        # serve the static export in out/ on :3000
node scripts/screenshot.mjs http://localhost:3000 qa/screenshots/run-name
```

`scripts/screenshot.mjs` captures full-page screenshots at desktop, tablet and mobile sizes after scrolling the page so scroll-triggered content has revealed.

Skills installed in `.claude/skills/`: `frontend-design` (Anthropic) and `ui-ux-pro-max` (run `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <style|color|typography|ux>`).

## Git and deployment

- Develop on branch `claude/funny-albattani-9hs0ky`. Commit and push after each meaningful step so a restart loses nothing.
- Deployment is to Netlify as a new project, separate from the client's existing `artha-finance`, `suhanuaanu` and `resolvd` projects. The client approved deploying once QA passes.
- Update `PROGRESS.md` whenever a phase finishes.
