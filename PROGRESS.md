# Progress

Read this first when resuming after a restart or a usage-limit reset. Keep it current.

## V2.1 checklist (client's 17 Nov feedback; refine, do not restart) — tick each when DONE and deployed

Design
- [ ] C1. Home background pure black (only Home)
- [ ] C2. Home candle wall more realistically coloured (market greens/reds; natural colour in the face reveal)
- [ ] C3. Each other page has its own design language and colour; site overall much more colourful and varied
- [ ] C4. Realistic 3D models (PBR, HDRI lighting, shadows) replace primitive shapes; mouse rotation, scroll camera, hotspots, object animation, scene transitions; lazy-loaded, compressed, phone fallbacks
- [ ] C5. Finance page looks truly amazing
- [ ] C6. Leadership page uses an original take on the "Volumes"/"Pavement" idea
- [ ] C7. Contact page properly visualised and cinematic

Structure and content
- [ ] C8. Model UN page renamed (Law & Diplomacy or similar); Executive Board appearances emphasised most; IIT Madras Introduction to Law course (8 weeks, take-home project) added there
- [ ] C9. New Interests page, interactive: aviation (IIT Madras aerospace course, 8 weeks, exemplary-performance certificate; photo gallery slots for his aviation photos), reading (400+ books), Formula 1 (watches every race), tennis (participated in and won tournaments)
- [ ] C10. Leadership renamed "Leadership & Work Experience": internships (Mahak Plastic Industries & RD Polypack, We Care Foundation, Fortis Adayu), then Student Council, Green Captain, Rasmanjari, Lotus Young Leaders Summit
- [ ] C11. Academics: topper in Grade 10; topper every year Grade 7–11; NFO shown as AIR 10 (Round 1), SRCC AIR 46 of 3,000, SOF IEO 6 awards; then SHRITEQ, Quiz to Conquer and the rest with ranks where given
- [ ] C12. Contact links: LinkedIn (https://linkedin.com/in/ahaan-gupta), Instagram (https://www.instagram.com/ahaan_dr3/), Email, Resume — URLs are now in `site.contact.links` and `site.social`; the Contact page still has to be built (Run B)

Assets and code
- [x] C13. 3D asset list presented to the client (done in chat 17 Nov) and recorded with licences in `content/research/assets.md`
- [x] C14. 22 Poly Haven models (meshopt GLB, WebP textures, 7.8 MB total) in `public/models/` and 4 HDRIs in `public/hdri/`; `scripts/fetch-polyhaven.mjs` fetches more (run with `NODE_USE_ENV_PROXY=1`). `decorative_book_set_01` has no glTF and was skipped; check the chess set's scale before use
- [ ] C15. Sketchfab models: the client supplied his API token on 17 Nov (kept OUTSIDE the repo in the session scratchpad at `private/sketchfab-token`; never commit it; scripts read `SKETCHFAB_TOKEN`). content-researcher is sourcing airliner, formula car, tennis racket, lectern/microphone and gavel into `public/models/`, with attributions in `src/content/credits.ts`
- [ ] C19. Credit line for CC-BY models at the very bottom of the website (client's request): a footer on every page rendering `src/content/credits.ts` (Run B)
- [ ] C16. Code organised for his edits; `MEDIA.md` says exactly where each of his own photos, clips and models goes; final message lists what to upload
- [ ] C17. Subagents on Opus 5.5 for design/engineering; frontend-design and ui-ux-pro-max skills used
- [ ] C18. Deployed; hourly task disabled when everything above is done

Work log for V2.1
- 17 Nov ~05:45 UTC: content-researcher (Sonnet) updated `src/content/site.ts` additively (`academics`, `lawDiplomacy`, `work`, `interestsPage`, `contact.links`, new `ui.pages`; `nfo` stat now "AIR 10" Round 1 with AIR 54 secondary; SRCC "AIR 46 of 3,000"); tsc passes.
- 17 Nov ~05:50 UTC: creative-director (confirmed claude-opus-5-5) wrote `design/v2.1-addendum.md`: per-page palettes and one hero 3D set piece per page; build order Run A / Run B.
- 17 Nov ~06:00 UTC: frontend-engineer Run A started (model opus): shared 3D kit, page tokens/routes/nav (Model UN route becomes `/law-diplomacy`, `/interests` stub), Home recolour on black, Finance (bronze bull, field, Artha on the laptop), Law & Diplomacy (real furniture, Executive Board first, law corner). It commits after each item. NEXT: look at `qa/screenshots/v21-a/`, deploy, then Run B (Academics colour + real-object moment + content changes; Leadership & Work Experience as flying dossiers/books; Interests page; cinematic Contact desk scene with Email/Resume/LinkedIn/Instagram; `MEDIA.md`), deploy, tick the checklist, final message telling the client what to upload where.
- Asked the client (not blocking): a free Sketchfab API token (he replies "ready", then call `request_credential` for host api.sketchfab.com, header Authorization, prefix Token), LinkedIn and Instagram URLs, aviation photos.

State when this checklist was written (17 Nov 05:40 UTC): Home, Finance, Model UN, Academics are built and committed; Leadership (stints chart) is half-built and committed as work in progress; Contact is a stub. Live site has Home + Finance + Model UN (older deploy).

## VERSION 2 REBUILD (started 16 Nov 2026 ~19:10 UTC)

The client rejected the first site as too basic. New brief is at the top of CLAUDE.md. Reference study: `design/reference-study/notes.md`. Design agents now run on claude-opus-5-5 (client's instruction). The hourly scheduled task is ON again; disable it when v2 is deployed. Everything under "Phases" below is the finished, superseded v1.

- [x] V2-1. Direction written: `design/v2-direction.md`, "Price Discovery" (a WebGL wall of candlesticks settles into his face; six routes: Home, Finance, Model UN, Academics, Leadership, Contact; one pinned set piece per page; stock footage M1–M9 as replaceable atmosphere). NOTE: that run was served by Fable 5.2 because the session held the old agent definition; ALWAYS pass `model: "opus"` on Agent calls to creative-director, visual-explorer and frontend-engineer, and check the served model in the subagent transcript
- [ ] V2-1b. Stock media M1–M9 into `public/media/` with provenance (content-researcher) — started ~19:35 UTC 16 Nov
- [x] V2-2. Shell + Home intro built and committed (7e32477): dark tokens, board nav, candle page transition, route stubs, WebGL candle wall with burst/settle and pointer lens. Frames in `qa/screenshots/v2-home/` were sent to the client. DEPLOYED 17 Nov ~00:50 UTC as a first look (section pages are stubs). Deploy with `scripts/deploy.sh "<proxy-path from the Netlify MCP deploy-site tool>"`
- [x] V2-3a. Finance ("The field": WebGL points to scale) and Model UN ("The chamber": Three.js hemicycle with 21 placards) built, plus the Home fixes (f90a09b, 836d4db, 66bbb84). DEPLOYED 17 Nov ~01:25 UTC. Own-media slots live in `site.mediaSlots`
- [ ] V2-3b. Academics (the altitude tape + quiz), Leadership (the stints chart = interactive timeline), Contact (compact candle portrait + 400 spines), and the Model UN panel/headline overlap fix — fresh frontend-engineer with `model: "opus"`, started ~01:30 UTC 17 Nov; commits after each page. When done: look at a few frames in `qa/screenshots/v2-*/`, get a deploy command from the Netlify MCP `deploy-site` tool and run `scripts/deploy.sh`
- [ ] V2-1c. Media: M4, M7, M9 obtained (Wikimedia Commons, CC0/public domain). M3 (Model UN cold-open loop) still MISSING: flag clip removed; intended replacement is NASA's public-domain "BlackMarble 2016 rotating globe at night" on Wikimedia Commons, which was rate-limited (HTTP 429). Retry later: download, cut 12 s at 1280x720 H.264 under 2.5 MB plus poster to `public/media/m3-model-un.mp4/.jpg`, remove `pending: true` from `site.media.m3`, record in `content/research/assets.md`
- [ ] V2-4. One QA pass (qa-reviewer), fixes, redeploy to the same Netlify project (`ahaan-gupta`, how-to under v1 step 7)
- [ ] V2-5. Disable the hourly scheduled task

Usage rules: one agent at a time, tight briefs, fresh agents rather than resuming huge contexts, judge motion from frame sequences or video rather than stills.

## Client decisions (15 Nov 2026)

- Netlify: approved. Create a NEW project (not artha-finance, suhanuaanu or resolvd) and deploy once QA passes.
- Contact: email only (thisisahaan@gmail.com). No phone number anywhere. Resume download is a redacted copy.
- Direction: present three directions, then build the creative director's recommendation without waiting.
- Agent Teams: keep off. Subagents only.
- When the usage limit runs out: stop and save. An hourly scheduled task ("Resume portfolio build") restarts the work. Disable it once the site is deployed.

## Phases

- [x] 0. Setup: Next.js 16 + TS + Tailwind v4, Motion, GSAP, Lenis, Lucide, Playwright 1.63.0, skills, SessionStart hook, CLAUDE.md, five subagent files
- [x] 0b. Verified each subagent runs (15 Nov): creative-director and visual-explorer on claude-fable-5-2, frontend-engineer on claude-opus-5-5, content-researcher and qa-reviewer on claude-sonnet-5-5 (from each run's `modelUsage`)
- [x] 1. Content: `src/content/site.ts` (type-checks), `content/research/facts.md`, 7 logos with provenance in `content/research/assets.md`
- [x] 2. Three creative directions in `design/directions.md`: A Almanac, B Placard, C Meridian. Creative director recommends C, Meridian; client pre-authorised building the recommendation. Reference boards done: `design/explorations/01-almanac.html`, `02-placard.html`, `03-meridian.html` with screenshots in `shots/` (sent to the client)
- [x] 3. Approved design system: `design/design-system.md` (Meridian). Quiz questions and `site.ui` strings added to `src/content/site.ts`
- [x] 4. Assets: portrait, logos with provenance, Artha screenshots, redacted resume PDF in `public/` (still wanted: 5–7 verified quiz questions from the content researcher, once the design system says how many)
- [x] 5. Site built by the frontend-engineer (claude-opus-5-5) and pushed in five commits (443c29d..ca5aec7): all chapters, line system, timeline, quiz. Lint and static build pass. Its report lists 10 small deviations for the creative director to rule on
- [x] 6a. QA round 1 FAIL (3 major) → creative-director review (approved with changes) → fix round 1a → QA round 1b PASS (no blocker, no major; `qa/reports/2026-11-16-round-1b.md`)
- [x] 6b. Fix round 1b done (commits 38698db, 9cfbf3c, d84dce4; timeline layout-shift fix skipped). QA round 2: FAIL on one major regression D1 (phone awards record squeezed to ~110px) plus 7 minors (`qa/reports/2026-11-16-round-2.md`)
- [x] 6c. Fix round 2a done (0ba526d, f161635): D1–D8 fixed. QA round 2b: PASS, no blocker or major (`qa/reports/2026-11-16-round-2b.md`). REDEPLOYED 16 Nov ~10:50 UTC; live check at 1440/834/390: no console errors, failed requests or overflow; resume PDF served; phone number absent
- [x] 7. DEPLOYED 16 Nov ~09:35 UTC: https://ahaan-gupta.netlify.app (project `ahaan-gupta`, siteId `36ccd93d-a2a8-4d47-9a9a-20715e27d896`). Production is public; team login applies to non-production previews only. Live check: 200, no console errors, no overflow, phone number absent, resume PDF served. To redeploy: call the Netlify MCP `deploy-site` with the siteId, then run the printed `npx @netlify/mcp` command with `NODE_USE_ENV_PROXY=1` (Node's fetch ignores the proxy otherwise), after temporarily moving `source-material/resume-original.pdf` out of the repo folder so it is never uploaded. Netlify injects a comment into <head>; `src/app/layout.tsx` strips it before hydration (do not remove that script). The 'Powered by Netlify' badge is Netlify's free-plan badge
- [x] 8. Hourly scheduled task disabled on 16 Nov ~13:40 UTC (work complete)

## Left for a later pass (not blocking)

- Creative-director sign-off on the final build was not run (usage). The engineer changed four approved details in round 2a that the creative director has not ruled on: the sticky "400+" removed on phone and tablet; the timeline's "2013 – 2026" note moved above the title; about 370px more scroll in the pinned timeline; leadership ticks at 2px.
- Minor QA remnants: leadership ticks render half-weight at 2x/3x pixel density (use a whole-pixel height); one aviation waypoint triangle is crossed by the route line; timeline layout shift on desktop from the pin (CLS, no visible jump) not fixed; Courses and Further competitions tables are plain; twelve single-line placeholders repeat until the client supplies text.
- Not tested: Firefox and Safari, screen readers, 200% zoom, real touch gestures on the globe, finance figure and circuit.
- Client decisions open: age in the resume PDF, Rasmanjari wording, what "19+ awards" counts, Grade X year, Wharton logo, biography and interest text, Wharton/GITAM details, social links.

## Log

- 16 Nov ~20:20 UTC: fifth usage limit hit during the v2 home build; reset 23:50; resumed 00:37 UTC 17 Nov. The home wall was already committed, so nothing was lost.

- 16 Nov 05:15 UTC: third usage limit hit as fix round 1 began (nothing changed). Reset 08:30. Resumed 08:38 with a FRESH frontend-engineer on fix round 1a (review items 1, 2, 3, 5, 6, 17 and phone sort buttons: the two QA majors plus quick items). Plan: narrow QA re-check of the majors → first deploy → round 1b (review items 4, 7–16, 18) → QA round 2 → redeploy. Lesson: resuming an agent with a 400k context is expensive; prefer fresh agents with tight briefs.

- 15 Nov ~23:05 UTC: second usage limit hit just as the engineer started; reset 03:30 UTC 16 Nov; engineer resumed 03:38 and finished the build ~04:17.
- 15 Nov 18:07 UTC: hit the 5-hour usage limit about 50 minutes in (Fable orchestrator plus two Fable agents in parallel is expensive). Resumed 22:38 UTC after the 21:50 reset. Both interrupted agents (creative-director writing `design/design-system.md`; visual-explorer drawing boards, Meridian first, A and B compact) were resumed with SendMessage.
- Budget rule from here: critical path first (design system → frontend build → QA → deploy). Keep briefs tight; avoid running more than two agents at once.

- Notes for the creative director's first screenshot review (from the visual explorer's Meridian board): the finance line returns to the meridian behind the Artha screenshot (needs approval); the hero portrait at 384px stops above the 900px fold; Night hairlines need two extra tokens; motorsport is thin on facts; some Stone sections have large empty areas.

## Notes for whoever resumes

- From about 18:00 UTC on 15 Nov the session's Agent tool DOES see the five project agents (`subagent_type: creative-director` etc.), so delegate natively; `scripts/agent.sh` remains as a fallback.
- Invoking subagents (fallback): the Agent tool only sees `.claude/agents/` if the directory existed when the session process started. In the first session it did not, so agents were run headlessly with `scripts/agent.sh <agent> <prompt-file> <out.json>` (prints the report, the session id and the model that served it; `RESUME=<session-id>` continues an agent's conversation). After a restart, try the Agent tool with `subagent_type` first; use the script if the agent type is not found. Never edit `scripts/agent.sh` while a run is in progress.
- Run agents that build (`npm run build`) one at a time; they share `.next/` and `out/`.
- The site is a static export (`output: "export"` in next.config.ts; `cacheComponents` was removed because it cannot be combined with export). `npm run build` writes `out/`; `npm run start` serves it on :3000 with `serve`. Netlify publishes `out/` (see netlify.toml).
- Assets ready: `public/images/portrait.webp|jpg` (797x1060, border cropped; keep it under about 420 CSS px wide so it stays sharp), `public/images/artha-home.webp` (2880x1800) and `artha-home-mobile.webp`, `public/Ahaan-Gupta-Resume.pdf` (phone number redacted and verified absent).
- The GitHub repository is PUBLIC. Never commit `source-material/resume-original.pdf`.
- Open items for the client (do not block on them): the Rasmanjari paragraph in the resume is a rough draft with typos (it is also in the downloadable PDF); "19+ awards" versus 16 rows in the table; biography, interest descriptions, Wharton/GITAM details and social links are placeholders.
