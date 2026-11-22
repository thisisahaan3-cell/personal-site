# Ahaan Gupta — Personal Portfolio

A premium personal portfolio for Ahaan Gupta, a Grade 11 (Commerce) student at Lotus Valley International School, Gurugram. It is his digital identity: academics, awards, leadership, Model UN and debate, competitions, projects and interests.

Start with `README.md` (how the code is laid out). If you are resuming after a restart, read `PROGRESS.md` first. It records what is done and what comes next.

## VERSION 2 BRIEF (16 Nov 2026) — this supersedes the Meridian direction below

The client rejected the first site (Meridian: a light, one-page scroll) as too basic. His instructions for the rebuild, in his words and order of weight:

1. **Dark mode.**
2. **The front page is only a cinematic, visually striking intro**: one screen, built around his face with an interesting animation linked to finance, and buttons that point to the sections. It must not be an endless scroll.
3. **Separate sections reached by buttons/navigation**, as on the reference site (separate pages with a persistent nav).
4. **Lead with impact.** The site encapsulates him: the most impressive things he has won, done and built (academics, awards, competitions, courses, projects) are at the forefront. Anything that does not show his ability is not given prominence.
5. **No separate section per interest.** Interests are revealed through the other parts of the site (motifs, details, interactions). If he has done nothing in a field (for example motorsport), it gets no section.
6. **Animation and moving objects on the level of aaravjuneja.in**, studied properly: see `design/reference-study/notes.md`. Each page gets one memorable moving or interactive set piece; Three.js/WebGL is welcome. Philosophy only: never copy that site's layout, assets, type or interactions.
7. **Do not waste usage.** No three-direction exercises, no long design documents, no repeated review rounds. One short direction (`design/v2-direction.md`), then build, look at it moving, fix, ship. Show the client the intro page early.

8. **Do not hold back, and do not let missing media limit the design** (his follow-up message): "I want a grand, amazing, mind-blowing, cinematic site." Set pieces may be built on real media. Use licensed stock video, photographs and CC0 3D models as placeholders now; he will send his own media later to replace them. Every stock asset is recorded in `content/research/assets.md` with source and licence, is marked as replaceable in the content file, and is atmosphere only: never captioned or framed as him or as his own event.
9. **Spend usage on building the design, not on review rounds and tests.** Keep verification to the minimum that shows things broadly work. Do not ask him questions; work continues after every usage-limit reset. Subagents do the work; anything that ran on Fable now runs on Opus 5.5.

The approved v2 direction is `design/v2-direction.md`. `design/archive-v1/design-system.md`, `design/archive-v1/directions.md` and `design/archive-v1/reviews/` describe the rejected Meridian version and are kept only as history. All content rules below still apply unchanged, and `src/content/site.ts` remains the only source of facts. His own media so far: the portrait, the Artha screenshots and official logos.

## VERSION 2.1 REFINEMENT (17 Nov 2026) — refine the v2 site, do not restart it

The client likes v2 much more but says it "looks very dead": the animations are good, the ELEMENTS are basic (boxes for desks), and it needs colour. Direction: **cinematic editorial + interactive 3D**. "A few memorable 3D experiences beat twenty decorative ones." Everything he asked for is tracked as a checklist in `PROGRESS.md` (section "V2.1 checklist"); every item must be done. Design addendum: `design/v2.1-addendum.md`.

Design
- Home: main background pure BLACK (only Home). The candle wall that forms his face should be more realistically coloured (real market colours, natural face colour in the reveal).
- Every other page gets its own design language and colour, whatever suits it best. Overall far more colourful, varied, cinematic, "non-AI".
- Real elements: realistic 3D models with PBR materials, HDRI lighting and shadows, not primitive boxes/spheres. Mouse-responsive rotation, scroll-driven camera moves, hotspots, object animations, smooth scene transitions. Lazy-load, compress, give phones a fallback. Never a photo pretending to be 3D, never a low-quality model to tick a box, never an invented asset URL.
- Assets: Poly Haven (CC0, reachable without login) is the main source; Sketchfab downloads need the client's free API token (requested); record every asset's source and licence in `content/research/assets.md`; CC-BY models get a credit line on the site. Models live in `public/models/`, HDRIs in `public/hdri/`.
- Finance must look truly amazing.
- Leadership page may borrow the IDEA (not the code; they are paid) of the "Volumes" or "Pavement" sections at supply.madebyoversight.com/sections: 3D books flying past in window light and opening as you scroll / flying low over posters lying in a street that peel away.

Structure and content
- Model UN page is renamed (for example "Law & Diplomacy") so it is not restricted to MUN; it emphasises the Executive Board appearances most, and includes the IIT Madras Introduction to Law course (8 weeks, take-home project).
- New Interests page, interactive, each interest backed by what he has done: aviation (IIT Madras Fundamentals of Aerospace, 8 weeks, with the resume's exact award wording; a gallery for aviation photos he will send), reading (400+ books), Formula 1 (he watches every race), tennis (he has taken part in and won tournaments).
- Leadership becomes "Leadership & Work Experience": all internships (Mahak Plastic Industries & RD Polypack, We Care Foundation, Fortis Adayu Hospital), then Student Council, Green Captain, Rasmanjari, Lotus Young Leaders Summit.
- Academics: school topper in Grade 10 and school topper every year from Grade 7 to Grade 11; National Finance Olympiad shown as AIR 10 (it is the Round 1 rank: label it so; Nationals AIR 54 of 10,000+ stays visible); SRCC Finance Olympiad AIR 46 of 3,000; SOF International English Olympiad (6 awards); below those the rest (SHRITEQ, Quiz to Conquer and others) with ranks where given.
- Contact: properly visualised and cinematic, with LinkedIn, Instagram, Email and Resume (LinkedIn and Instagram URLs not yet supplied: placeholders).
- Code must be organised so he can edit content and drop in his own media: one place per kind of asset, documented in `MEDIA.md`. At the end, tell him exactly which files to upload where.

Process
- Keep the subagent model; design/engineering agents run on Opus 5.5 (pass `model: "opus"`). Do not waste usage: no review rounds beyond a quick look that things work. The engineer and creative director use the `frontend-design` and `ui-ux-pro-max` skills.

New facts from the client's 17 Nov message (source: "client message"): school topper every year Grade 7 to Grade 11 including Grade 10; SRCC Finance Olympiad AIR 46 out of 3,000; watches every Formula 1 race; has participated in and won tennis tournaments; will supply aviation photos, LinkedIn and Instagram links.

## Sources of truth

- `source-material/resume-original.pdf` is the primary source of facts. It contains a phone number and the GitHub repository is public, so it is git-ignored and exists only in the session's container. If it is missing after a restart, use `content/research/facts.md` (the full extraction) and `public/Ahaan-Gupta-Resume.pdf` (the redacted copy offered for download).
- `source-material/portrait-original.webp` is the client's portrait.
- `src/content/site.ts` is the single content file the site renders from. All copy lives there.
- `content/research/facts.md` is the resume extraction; `content/research/assets.md` records where every logo and image came from and its licence.
- `design/v2-direction.md` and `design/v2.1-addendum.md` are the current visual direction (per-page palettes, set pieces). The rejected v1 system is in `design/archive-v1/`.

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

## Creative direction (original brief; read together with the version 2 brief above)

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

The current direction is in `design/v2-direction.md` and `design/v2.1-addendum.md`. Build from those files, not from memory.

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
| `creative-director` | claude-opus-5-5, high | Owns the identity, writes and approves the design system, reviews screenshots | `design/` |
| `visual-explorer` | claude-opus-5-5, high | Static reference boards and motif studies; never the production site | `design/archive-v1/explorations/` |
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
